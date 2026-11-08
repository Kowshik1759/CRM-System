const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const Task = require('../models/Task');
const FollowUp = require('../models/FollowUp');
const Interaction = require('../models/Interaction');

// @desc    Get dashboard metrics & summary data
// @route   GET /api/v1/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const isExecutive = req.user.role === 'sales_executive';
    const filter = isExecutive && req.query.onlyMine === 'true' ? { assignedTo: req.user._id } : {};

    // 1. Core KPIs
    const [
      totalCustomers,
      totalLeads,
      convertedLeads,
      activeOpportunities,
      pendingTasks,
      upcomingFollowUps
    ] = await Promise.all([
      Customer.countDocuments(),
      Lead.countDocuments(filter),
      Lead.countDocuments({ ...filter, status: 'Converted' }),
      Opportunity.countDocuments({ stage: { $nin: ['Closed Won', 'Closed Lost'] } }),
      Task.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
      FollowUp.countDocuments({ status: 'Pending', scheduledDate: { $gte: new Date() } })
    ]);

    // Total revenue from Closed Won opportunities + customer revenues
    const wonOpportunities = await Opportunity.find({ stage: 'Closed Won' });
    const totalRevenue = wonOpportunities.reduce((acc, curr) => acc + (curr.value || 0), 0);

    // Active pipeline value
    const pipelineOpportunities = await Opportunity.find({ stage: { $nin: ['Closed Won', 'Closed Lost'] } });
    const pipelineValue = pipelineOpportunities.reduce((acc, curr) => acc + (curr.value || 0), 0);

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    // 2. Leads by stage for visual distribution
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'];
    const leadsByStageRaw = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$estimatedValue' } } }
    ]);
    const leadsByStage = stages.map((stage) => {
      const found = leadsByStageRaw.find((item) => item._id === stage);
      return {
        stage,
        count: found ? found.count : 0,
        value: found ? found.totalValue : 0
      };
    });

    // 3. Recent 5 Interactions
    const recentActivities = await Interaction.find()
      .populate('performedBy', 'name avatar role')
      .populate('customer', 'name company')
      .populate('lead', 'title company')
      .sort({ date: -1 })
      .limit(6);

    // 4. Upcoming Follow-ups (next 5)
    const upcomingFollowupList = await FollowUp.find({
      status: 'Pending',
      scheduledDate: { $gte: new Date() }
    })
      .populate('customer', 'name company phone')
      .populate('lead', 'name company phone')
      .populate('assignedTo', 'name avatar')
      .sort({ scheduledDate: 1 })
      .limit(5);

    // 5. Urgent / Pending Tasks (next 5)
    const urgentTasksList = await Task.find({
      status: { $in: ['Pending', 'In Progress'] }
    })
      .populate('assignedTo', 'name avatar')
      .sort({ dueDate: 1 })
      .limit(5);

    // 6. Monthly Revenue Trend (Live Aggregation)
    const monthlyRevenueRaw = await Opportunity.aggregate([
      { $match: { stage: 'Closed Won', actualCloseDate: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$actualCloseDate' } },
          revenue: { $sum: '$value' },
          dealsWon: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalCustomers,
          totalLeads,
          convertedLeads,
          activeOpportunities,
          totalRevenue,
          pipelineValue,
          pendingTasks,
          upcomingFollowUps,
          conversionRate
        },
        leadsByStage,
        monthlyRevenue: monthlyRevenueRaw,
        recentActivities,
        upcomingFollowupList,
        urgentTasksList
      }
    });
  } catch (error) {
    next(error);
  }
};
