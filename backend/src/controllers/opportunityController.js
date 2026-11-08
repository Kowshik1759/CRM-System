const Opportunity = require('../models/Opportunity');
const Customer = require('../models/Customer');

// @desc    Get all opportunities
// @route   GET /api/v1/opportunities
// @access  Private
exports.getOpportunities = async (req, res, next) => {
  try {
    const { stage, assignedTo, search } = req.query;
    const query = {};

    if (stage) query.stage = stage;
    if (assignedTo) query.assignedTo = assignedTo;

    if (req.user.role === 'sales_executive' && req.query.onlyMine === 'true') {
      query.assignedTo = req.user._id;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const opportunities = await Opportunity.find(query)
      .populate('customer', 'name company email phone')
      .populate('lead', 'title company')
      .populate('assignedTo', 'name email avatar')
      .sort({ expectedCloseDate: 1 });

    // Calculate aggregated metrics
    const totalValue = opportunities.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const wonValue = opportunities
      .filter((o) => o.stage === 'Closed Won')
      .reduce((acc, curr) => acc + (curr.value || 0), 0);
    const pipelineValue = opportunities
      .filter((o) => !['Closed Won', 'Closed Lost'].includes(o.stage))
      .reduce((acc, curr) => acc + (curr.value || 0), 0);

    res.status(200).json({
      success: true,
      count: opportunities.length,
      metrics: {
        totalValue,
        wonValue,
        pipelineValue
      },
      data: opportunities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single opportunity
// @route   GET /api/v1/opportunities/:id
// @access  Private
exports.getOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('customer', 'name company email phone')
      .populate('lead', 'title name company')
      .populate('assignedTo', 'name email avatar');

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new opportunity
// @route   POST /api/v1/opportunities
// @access  Private
exports.createOpportunity = async (req, res, next) => {
  try {
    const { title, customer, lead, value, stage, probability, expectedCloseDate, assignedTo, notes } = req.body;

    const opportunity = await Opportunity.create({
      title,
      customer: customer || undefined,
      lead: lead || undefined,
      value: Number(value) || 0,
      stage: stage || 'Discovery',
      probability: probability !== undefined ? Number(probability) : 20,
      expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assignedTo: assignedTo || req.user._id,
      notes: notes || '',
      createdBy: req.user._id
    });

    const populated = await Opportunity.findById(opportunity._id)
      .populate('customer', 'name company')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update opportunity (including stage, won/lost)
// @route   PUT /api/v1/opportunities/:id
// @access  Private
exports.updateOpportunity = async (req, res, next) => {
  try {
    const { stage } = req.body;
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    // If stage becomes Closed Won, set actualCloseDate and update customer total revenue
    if (stage === 'Closed Won' && opportunity.stage !== 'Closed Won') {
      req.body.actualCloseDate = new Date();
      if (opportunity.customer) {
        await Customer.findByIdAndUpdate(opportunity.customer, {
          $inc: { totalRevenue: Number(req.body.value || opportunity.value) }
        });
      }
    } else if (stage === 'Closed Lost') {
      req.body.actualCloseDate = new Date();
    }

    const updated = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('customer', 'name company')
      .populate('assignedTo', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/v1/opportunities/:id
// @access  Private
exports.deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
