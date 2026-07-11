const Course = require('../models/Course');
const { Op } = require('sequelize');

/**
 * POST /api/courses
 * Create a new academic course.
 */
const createCourse = async (req, res) => {
  try {
    const { code, title, department, creditHours, applicability, batchSemester, description } = req.body;

    const errors = {};

    // 1. Validate Code
    const cleanCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
    const codePattern = /^[A-Z]{2,5}-\d{3,4}$/;
    if (!cleanCode) {
      errors.code = 'Course code is required.';
    } else if (!codePattern.test(cleanCode)) {
      errors.code = 'Invalid course code pattern. Must be like CSE-3106 or MAT-101.';
    }

    // 2. Validate Title
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    if (!cleanTitle) {
      errors.title = 'Course title is required.';
    }

    // 3. Validate Department
    const cleanDept = typeof department === 'string' ? department.trim() : '';
    if (!cleanDept) {
      errors.department = 'Department is required.';
    }

    // 4. Validate Credit Hours
    const credits = Number(creditHours);
    if (creditHours === undefined || creditHours === null || creditHours === '') {
      errors.creditHours = 'Credit hours is required.';
    } else if (isNaN(credits) || credits < 1 || credits > 5) {
      errors.creditHours = 'Credit hours must be a number between 1 and 5.';
    }

    // 5. Validate Applicability / batchSemester
    const finalBatchSemester = (applicability || batchSemester || '').toString().trim();
    if (!finalBatchSemester) {
      errors.applicability = 'Semester/Batch applicability is required.';
    }

    // Return 400 if any validation errors occurred
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // 6. Check for duplicate course code (case-insensitive in SQLite/MySQL, but normalize it)
    const existingCourse = await Course.findOne({
      where: {
        code: cleanCode,
      },
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: `Course with code '${cleanCode}' already exists.`,
      });
    }

    // 7. Persist course records
    const newCourse = await Course.create({
      code: cleanCode,
      title: cleanTitle,
      department: cleanDept,
      creditHours: credits,
      batchSemester: finalBatchSemester,
      description: typeof description === 'string' ? description.trim() : null,
    });

    // 8. Return response
    return res.status(201).json({
      success: true,
      data: {
        id: newCourse.id,
        code: newCourse.code,
        title: newCourse.title,
        department: newCourse.department,
        creditHours: newCourse.creditHours,
      },
    });
  } catch (error) {
    console.error('Error in createCourse controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating course.',
    });
  }
};

module.exports = {
  createCourse,
};
