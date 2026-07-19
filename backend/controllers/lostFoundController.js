const { LostFoundItem } = require('../models/associations');

/**
 * createLostFoundItem
 * POST /api/lost-found-items
 * Creates a new lost or found item report.
 */
const createLostFoundItem = async (req, res) => {
  try {
    const { type, title, description, category, location, itemDate } = req.body;
    const reporterId = req.user.id;

    // 1. Validate required fields
    if (!type || !title || !description || !category || !location || !itemDate) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Type, title, description, category, location, and itemDate are required.'
      });
    }

    // 2. Validate type is lost or found
    if (type !== 'lost' && type !== 'found') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Type must be either "lost" or "found".'
      });
    }

    // 3. Validate itemDate is not in the future
    const parsedDate = new Date(itemDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Invalid date format.'
      });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // end of today
    if (parsedDate > today) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Date cannot be in the future.'
      });
    }

    // 4. Handle photo path
    // If multer successfully uploaded the photo, it will be in req.file
    let photoPath = null;
    if (req.file) {
      // Normalize slashes for web-friendly paths
      photoPath = req.file.path.replace(/\\/g, '/');
    }

    // 5. Create record
    const item = await LostFoundItem.create({
      reporterId,
      type,
      title,
      description,
      category,
      location,
      itemDate, // DATEONLY matches YYYY-MM-DD
      photoPath,
      status: 'open'
    });

    return res.status(201).json({
      success: true,
      data: {
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status
      }
    });

  } catch (error) {
    console.error('Error creating lost/found item:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not save lost/found item post.'
    });
  }
};

module.exports = {
  createLostFoundItem
};
