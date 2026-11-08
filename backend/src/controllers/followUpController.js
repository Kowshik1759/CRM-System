const FollowUp = require('../models/FollowUp');

// Helper to check and mark overdue follow-ups
const updateOverdueStatuses = async () => {
  const now = new Date();
  await FollowUp.updateMany(
    {
      status: 'Pending',
      scheduledDate: { $lt: now }
    },
    { $set: { status: 'Overdue' } }
  );
};

// @desc    Get all follow-ups with filters (pending, overdue, upcoming, completed)
// @route   GET /api/v1/followups
// @access  Private
exports.getFollowUps = async (req, res, next) => {
  try {
    await updateOverdueStatuses();

    const { status, type, priority, assignedTo, upcoming } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    if (req.user.role === 'sales_executive' && req.query.onlyMine === 'true') {
      query.assignedTo = req.user._id;
    }

    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
      query.status = 'Pending';
    }

    const followUps = await FollowUp.find(query)
      .populate('customer', 'name company email phone')
      .populate('lead', 'title name company phone')
      .populate('assignedTo', 'name email avatar')
      .sort({ scheduledDate: 1 });

    // Summary counts
    const pendingCount = await FollowUp.countDocuments({ status: 'Pending' });
    const overdueCount = await FollowUp.countDocuments({ status: 'Overdue' });
    const completedCount = await FollowUp.countDocuments({ status: 'Completed' });

    res.status(200).json({
      success: true,
      count: followUps.length,
      summary: {
        pending: pendingCount,
        overdue: overdueCount,
        completed: completedCount
      },
      data: followUps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single follow-up
// @route   GET /api/v1/followups/:id
// @access  Private
exports.getFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findById(req.params.id)
      .populate('customer', 'name company email phone')
      .populate('lead', 'title name company')
      .populate('assignedTo', 'name email');

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    res.status(200).json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
};

// @desc    Create follow-up
// @route   POST /api/v1/followups
// @access  Private
exports.createFollowUp = async (req, res, next) => {
  try {
    const { title, type, scheduledDate, priority, customer, lead, assignedTo, notes } = req.body;

    const followUp = await FollowUp.create({
      title,
      type: type || 'Call',
      scheduledDate,
      priority: priority || 'Medium',
      customer: customer || undefined,
      lead: lead || undefined,
      assignedTo: assignedTo || req.user._id,
      notes: notes || '',
      createdBy: req.user._id
    });

    const populated = await FollowUp.findById(followUp._id)
      .populate('customer', 'name company')
      .populate('lead', 'title company')
      .populate('assignedTo', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update follow-up
// @route   PUT /api/v1/followups/:id
// @access  Private
exports.updateFollowUp = async (req, res, next) => {
  try {
    const { status, outcome } = req.body;
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    if (status === 'Completed' && followUp.status !== 'Completed') {
      req.body.completedAt = new Date();
    }

    const updated = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('customer', 'name company')
      .populate('lead', 'title company')
      .populate('assignedTo', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Follow-up updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete follow-up
// @route   DELETE /api/v1/followups/:id
// @access  Private
exports.deleteFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    await FollowUp.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Follow-up deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

