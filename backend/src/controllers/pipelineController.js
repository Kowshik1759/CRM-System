const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');

// @desc    Get Sales Pipeline data grouped by stages
// @route   GET /api/v1/pipeline
// @access  Private
exports.getPipeline = async (req, res, next) => {
  try {
    const { assignedTo } = req.query;
    const leadQuery = {};

    if (assignedTo) {
      leadQuery.assignedTo = assignedTo;
    } else if (req.user.role === 'sales_executive' && req.query.onlyMine === 'true') {
      leadQuery.assignedTo = req.user._id;
    }

    const leads = await Lead.find(leadQuery)
      .populate('assignedTo', 'name email avatar')
      .sort({ updatedAt: -1 });

    const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'];

    // Group leads into stages and calculate totals
    const columns = {};
    let totalPipelineValue = 0;
    let activeDealsCount = 0;

    stages.forEach((stage) => {
      columns[stage] = {
        stage,
        items: [],
        totalValue: 0,
        count: 0
      };
    });

    leads.forEach((lead) => {
      const stage = stages.includes(lead.status) ? lead.status : 'New';
      columns[stage].items.push(lead);
      columns[stage].totalValue += lead.estimatedValue || 0;
      columns[stage].count += 1;

      if (stage !== 'Lost') {
        totalPipelineValue += lead.estimatedValue || 0;
        activeDealsCount += 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        stages,
        columns,
        totalPipelineValue,
        activeDealsCount,
        totalLeads: leads.length
      }
    });
  } catch (error) {
    next(error);
  }
};
