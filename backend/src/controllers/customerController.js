const Customer = require('../models/Customer');
const Interaction = require('../models/Interaction');
const Opportunity = require('../models/Opportunity');

// @desc    Get all customers with filtering, search, pagination
// @route   GET /api/v1/customers
// @access  Private
exports.getCustomers = async (req, res, next) => {
  try {
    const { search, status, assignedTo, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    // RBAC: Sales executives see assigned or all if not restricted
    if (req.user.role === 'sales_executive' && req.query.onlyMine === 'true') {
      query.assignedTo = req.user._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      count: customers.length,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer with related interactions & opportunities
// @route   GET /api/v1/customers/:id
// @access  Private
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email phone avatar role')
      .populate('createdBy', 'name email');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const interactions = await Interaction.find({ customer: customer._id })
      .populate('performedBy', 'name email avatar role')
      .sort({ date: -1 });

    const opportunities = await Opportunity.find({ customer: customer._id })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...customer.toObject(),
        interactions,
        opportunities
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new customer
// @route   POST /api/v1/customers
// @access  Private
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, company, email, phone, address, status, source, industry, assignedTo, notes } = req.body;

    const customer = await Customer.create({
      name,
      company,
      email,
      phone,
      address,
      status: status || 'active',
      source: source || 'Website',
      industry: industry || 'Technology',
      assignedTo: assignedTo || req.user._id,
      notes: notes || '',
      createdBy: req.user._id
    });

    const populated = await Customer.findById(customer._id).populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/v1/customers/:id
// @access  Private
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedTo', 'name email');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/v1/customers/:id
// @access  Private (Admin / Sales Manager)
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

