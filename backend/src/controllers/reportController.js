const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const User = require('../models/User');

// @desc    Report 1: Lead Conversion Report
// @route   GET /api/v1/reports/lead-conversion
// @access  Private
exports.getLeadConversionReport = async (req, res, next) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ status: 'Converted' });
    const lostLeads = await Lead.countDocuments({ status: 'Lost' });
    const inProgressLeads = totalLeads - convertedLeads - lostLeads;

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
    const lossRate = totalLeads > 0 ? ((lostLeads / totalLeads) * 100).toFixed(1) : 0;

    // Funnel stage distribution
    const stagesOrder = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'];
    const funnelRaw = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' }
        }
      }
    ]);

    const funnel = stagesOrder.map((stage) => {
      const match = funnelRaw.find((item) => item._id === stage);
      return {
        stage,
        count: match ? match.count : 0,
        value: match ? match.totalValue : 0
      };
    });

    // Conversion by Lead Source
    const sourceBreakdown = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          total: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] }
          },
          lost: {
            $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          source: '$_id',
          total: 1,
          converted: 1,
          lost: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$converted', '$total'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalLeads,
          convertedLeads,
          lostLeads,
          inProgressLeads,
          conversionRate: Number(conversionRate),
          lossRate: Number(lossRate)
        },
        funnel,
        sourceBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report 2: Sales Performance Report
// @route   GET /api/v1/reports/sales-performance
// @access  Private
exports.getSalesPerformanceReport = async (req, res, next) => {
  try {
    // 1. Sales by Employee
    const salesByEmployee = await Opportunity.aggregate([
      { $match: { stage: 'Closed Won' } },
      {
        $group: {
          _id: '$assignedTo',
          totalRevenue: { $sum: '$value' },
          wonOpportunities: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$_id',
          employeeName: '$employee.name',
          employeeEmail: '$employee.email',
          totalRevenue: 1,
          wonOpportunities: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Overall total revenue and won count
    const totalWon = await Opportunity.find({ stage: 'Closed Won' });
    const totalRevenue = totalWon.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const wonOpportunitiesCount = totalWon.length;

    // 2. Monthly Sales Trends (Bar & Line combo data)
    const monthlySalesTrends = await Opportunity.aggregate([
      { $match: { stage: 'Closed Won', actualCloseDate: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$actualCloseDate' } },
          revenue: { $sum: '$value' },
          dealsWon: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          revenue: 1,
          dealsWon: 1
        }
      }
    ]);

    // Average Deal Size
    const averageDealSize = wonOpportunitiesCount > 0 ? Math.round(totalRevenue / wonOpportunitiesCount) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          wonOpportunitiesCount,
          averageDealSize
        },
        salesByEmployee,
        monthlySalesTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report 3: Customer Details Report
// @route   GET /api/v1/reports/customer-details
// @access  Private
exports.getCustomerDetailsReport = async (req, res, next) => {
  try {
    const { search, status, assignedTo, industry } = req.query;
    const query = {};

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (industry) query.industry = industry;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email department')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Aggregate status breakdown
    const statusBreakdown = await Customer.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalRevenue' } } }
    ]);

    // Acquisition by month
    const acquisitionTrends = await Customer.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      totalCustomers: customers.length,
      data: {
        customers,
        statusBreakdown,
        acquisitionTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report 4: Follow-up Activity Report
// @route   GET /api/v1/reports/followup-activity
// @access  Private
exports.getFollowUpActivityReport = async (req, res, next) => {
  try {
    const now = new Date();
    const completedFollowups = await FollowUp.countDocuments({ status: 'Completed' });
    const pendingFollowups = await FollowUp.countDocuments({ status: 'Pending', scheduledDate: { $gte: now } });
    const overdueFollowups = await FollowUp.countDocuments({
      $or: [{ status: 'Overdue' }, { status: 'Pending', scheduledDate: { $lt: now } }]
    });
    const totalFollowups = completedFollowups + pendingFollowups + overdueFollowups;

    // Employee-wise follow-up activity
    const employeeActivity = await FollowUp.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', 'Overdue'] },
                    { $and: [{ $eq: ['$status', 'Pending'] }, { $lt: ['$scheduledDate', now] }] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$_id',
          employeeName: '$employee.name',
          total: 1,
          completed: 1,
          pending: 1,
          overdue: 1,
          completionRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Channel breakdown
    const channelBreakdown = await FollowUp.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } }
        }
      },
      { $project: { type: '$_id', count: 1, completed: 1 } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalFollowups,
          completedFollowups,
          pendingFollowups,
          overdueFollowups,
          complianceRate: totalFollowups > 0 ? ((completedFollowups / totalFollowups) * 100).toFixed(1) : 0
        },
        employeeActivity,
        channelBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};
