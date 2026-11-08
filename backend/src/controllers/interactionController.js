const Interaction = require('../models/Interaction');

// @desc    Get all interactions (chronological interaction history)
// @route   GET /api/v1/interactions
// @access  Private
exports.getInteractions = async (req, res, next) => {
  try {
    const { type, customer, lead, performedBy, search } = req.query;
    const query = {};

    if (type) query.type = type;
    if (customer) query.customer = customer;
    if (lead) query.lead = lead;
    if (performedBy) query.performedBy = performedBy;

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { outcome: { $regex: search, $options: 'i' } }
      ];
    }

    const interactions = await Interaction.find(query)
      .populate('customer', 'name company email phone')
      .populate('lead', 'title name company')
      .populate('performedBy', 'name email avatar role')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: interactions.length,
      data: interactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new interaction
// @route   POST /api/v1/interactions
// @access  Private
exports.createInteraction = async (req, res, next) => {
  try {
    const { type, subject, details, customer, lead, date, durationMinutes, outcome } = req.body;

    const interaction = await Interaction.create({
      type: type || 'Note',
      subject,
      details,
      customer: customer || undefined,
      lead: lead || undefined,
      performedBy: req.user._id,
      date: date || new Date(),
      durationMinutes: Number(durationMinutes) || 0,
      outcome: outcome || ''
    });

    const populated = await Interaction.findById(interaction._id)
      .populate('customer', 'name company')
      .populate('lead', 'title company')
      .populate('performedBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Interaction recorded successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete interaction
// @route   DELETE /api/v1/interactions/:id
// @access  Private
exports.deleteInteraction = async (req, res, next) => {
  try {
    const interaction = await Interaction.findById(req.params.id);
    if (!interaction) {
      return res.status(404).json({ success: false, message: 'Interaction not found' });
    }

    await Interaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Interaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
