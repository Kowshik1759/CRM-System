const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Opportunity = require('../models/Opportunity');
const Interaction = require('../models/Interaction');

// @desc    Get all leads with search and filters
// @route   GET /api/v1/leads
// @access  Private
exports.getLeads = async (req, res, next) => {
  try {
    const { status, source, priority, assignedTo, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // RBAC: Sales executives by default focus on their leads if onlyMine=true
    if (req.user.role === 'sales_executive' && req.query.onlyMine === 'true') {
      query.assignedTo = req.user._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email')
      .populate('convertedCustomerId', 'name company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead
// @route   GET /api/v1/leads/:id
// @access  Private
exports.getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const interactions = await Interaction.find({ lead: lead._id })
      .populate('performedBy', 'name email avatar')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...lead.toObject(),
        interactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lead with duplicate prevention check
// @route   POST /api/v1/leads
// @access  Private
exports.createLead = async (req, res, next) => {
  try {
    const { title, name, company, email, phone, source, status, priority, estimatedValue, assignedTo, notes } = req.body;

    // Duplicate check by email or phone
    const duplicate = await Lead.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone }
      ],
      status: { $ne: 'Lost' }
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `A lead already exists with matching email (${duplicate.email}) or phone (${duplicate.phone}): "${duplicate.company} - ${duplicate.name}"`
      });
    }

    const lead = await Lead.create({
      title: title || `${company} - Deal Opportunity`,
      name,
      company,
      email: email.toLowerCase(),
      phone,
      source: source || 'Website',
      status: status || 'New',
      priority: priority || 'Medium',
      estimatedValue: Number(estimatedValue) || 0,
      assignedTo: assignedTo || req.user._id,
      notes: notes || '',
      createdBy: req.user._id
    });

    const populated = await Lead.findById(lead._id).populate('assignedTo', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead
// @route   PUT /api/v1/leads/:id
// @access  Private
exports.updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedTo', 'name email avatar');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead stage (Pipeline fast action)
// @route   PATCH /api/v1/leads/:id/stage
// @access  Private
exports.updateLeadStage = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'];

    if (!validStages.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid lead stage' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.status = status;
    await lead.save();

    res.status(200).json({
      success: true,
      message: `Lead stage updated to ${status}`,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert qualified lead to customer
// @route   POST /api/v1/leads/:id/convert
// @access  Private
exports.convertLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (lead.status === 'Converted' && lead.convertedCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'Lead has already been converted to a customer'
      });
    }

    // Check if customer already exists with this email
    let customer = await Customer.findOne({ email: lead.email });

    if (!customer) {
      customer = await Customer.create({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        status: 'active',
        source: lead.source,
        assignedTo: lead.assignedTo || req.user._id,
        notes: `Converted from Lead: ${lead.title}. Notes: ${lead.notes}`,
        createdBy: req.user._id
      });
    }

    // If estimated deal value > 0, automatically generate an Opportunity for seamless pipeline flow
    let opportunity = null;
    if (lead.estimatedValue > 0) {
      opportunity = await Opportunity.create({
        title: `${lead.company} - Contract`,
        customer: customer._id,
        lead: lead._id,
        value: lead.estimatedValue,
        stage: 'Proposal',
        probability: 70,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        assignedTo: lead.assignedTo || req.user._id,
        notes: `Auto-generated from converted lead: ${lead.title}`,
        createdBy: req.user._id
      });
    }

    lead.status = 'Converted';
    lead.convertedCustomerId = customer._id;
    lead.convertedAt = new Date();
    await lead.save();

    res.status(200).json({
      success: true,
      message: `Lead successfully converted to Customer "${customer.company}"`,
      customer,
      opportunity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lead
// @route   DELETE /api/v1/leads/:id
// @access  Private
exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
