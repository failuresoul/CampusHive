const { LostFoundItem, User, LostFoundClaim, Notification } = require('../models/associations');
const { Op } = require('sequelize');

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

/**
 * getLostFoundItems
 * GET /api/lost-found-items
 * Retrieves a paginated list of lost/found item reports, with optional filtering.
 */
const getLostFoundItems = async (req, res) => {
  try {
    const { type, category, status, search, page, pageSize, reporterId } = req.query;

    const pageNum = parseInt(page) || 1;
    const limit = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * limit;

    const whereClause = {};

    // 1. Type Filter (lost/found/all)
    if (type && type !== 'all') {
      whereClause.type = type;
    }

    // 2. Category Filter
    if (category) {
      whereClause.category = category;
    }

    // 3. Status Filter (default to 'open', allow 'all' or specific values)
    const statusFilter = status || 'open';
    if (statusFilter !== 'all') {
      whereClause.status = statusFilter;
    }

    // 4. Search Filter (matches title/description)
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // 5. Reporter ID filter
    if (reporterId) {
      whereClause.reporterId = reporterId;
    }

    const { count, rows } = await LostFoundItem.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']], // show most recent first
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: {
        items: rows,
        pagination: {
          page: pageNum,
          pageSize: limit,
          totalItems: count,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lost/found items:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not fetch lost/found items.'
    });
  }
};

const getLostFoundItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LostFoundItem.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['name']
        }
      ]
    });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost/found item not found.'
      });
    }
    return res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not fetch item details.'
    });
  }
};

const claimLostFoundItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const claimantId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Claim message is required.'
      });
    }

    const item = await LostFoundItem.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost/found item not found.'
      });
    }

    if (item.status === 'resolved' || item.status === 'claimed') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: This item is already resolved/claimed.'
      });
    }

    if (String(item.reporterId) === String(claimantId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: You cannot claim your own reported item.'
      });
    }

    // Check duplicate pending claims
    const existingClaim = await LostFoundClaim.findOne({
      where: {
        itemId: id,
        claimantId,
        status: 'pending'
      }
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: You already have a pending claim for this item.'
      });
    }

    // Create claim
    const claim = await LostFoundClaim.create({
      itemId: id,
      claimantId,
      message: message.trim(),
      status: 'pending'
    });

    // Notify reporter
    const claimant = await User.findByPk(claimantId);
    await Notification.create({
      userId: item.reporterId,
      type: 'lost_found_claim',
      referenceId: item.id,
      message: `New claim request on your item "${item.title}" by ${claimant?.name || 'someone'}.`
    });

    return res.status(201).json({
      success: true,
      data: {
        claimId: claim.id,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error claiming lost/found item:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not submit claim.'
    });
  }
};

const getLostFoundItemClaims = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;

    const item = await LostFoundItem.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost/found item not found.'
      });
    }

    if (String(item.reporterId) !== String(requesterId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the reporter can view claims.'
      });
    }

    const claims = await LostFoundClaim.findAll({
      where: { itemId: id },
      include: [
        {
          model: User,
          as: 'claimant',
          attributes: ['id', 'name', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: claims
    });
  } catch (error) {
    console.error('Error fetching item claims:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not fetch claims.'
    });
  }
};

const confirmLostFoundItemClaim = async (req, res) => {
  try {
    const { id, claimId } = req.params;
    const requesterId = req.user.id;

    const item = await LostFoundItem.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost/found item not found.'
      });
    }

    if (String(item.reporterId) !== String(requesterId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the reporter can confirm claims.'
      });
    }

    const claim = await LostFoundClaim.findByPk(claimId);
    if (!claim || String(claim.itemId) !== String(id)) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found for this item.'
      });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Only pending claims can be confirmed.'
      });
    }

    // Confirm this claim
    claim.status = 'confirmed';
    await claim.save();

    // Resolve item
    item.status = 'resolved';
    await item.save();

    // Auto-reject other pending claims on this item
    await LostFoundClaim.update(
      { status: 'rejected' },
      {
        where: {
          itemId: id,
          status: 'pending',
          id: { [Op.ne]: claimId }
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Claim confirmed and item resolved.'
    });
  } catch (error) {
    console.error('Error confirming claim:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not confirm claim.'
    });
  }
};

module.exports = {
  createLostFoundItem,
  getLostFoundItems,
  getLostFoundItemById,
  claimLostFoundItem,
  getLostFoundItemClaims,
  confirmLostFoundItemClaim
};
