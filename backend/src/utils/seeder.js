const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const Task = require('../models/Task');
const Interaction = require('../models/Interaction');

const seedData = async (shouldDisconnect = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    console.log('[Seeder] Cleaning existing collections...');

    await Promise.all([
      User.deleteMany(),
      Customer.deleteMany(),
      Lead.deleteMany(),
      Opportunity.deleteMany(),
      FollowUp.deleteMany(),
      Task.deleteMany(),
      Interaction.deleteMany()
    ]);

    console.log('[Seeder] Seeding Users with 4 Roles...');

    const admin = await User.create({
      name: 'Alexander Wright',
      email: 'admin@crmpro.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Executive Management',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isActive: true
    });

    const manager = await User.create({
      name: 'Sarah Jenkins',
      email: 'manager@crmpro.com',
      password: 'Manager@123',
      role: 'sales_manager',
      department: 'Sales Leadership',
      phone: '+1 (555) 019-2832',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      isActive: true
    });

    const executive1 = await User.create({
      name: 'David Miller',
      email: 'executive@crmpro.com',
      password: 'Executive@123',
      role: 'sales_executive',
      department: 'Direct Sales',
      phone: '+1 (555) 019-2833',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isActive: true
    });

    const executive2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena@crmpro.com',
      password: 'Executive@123',
      role: 'sales_executive',
      department: 'Direct Sales',
      phone: '+1 (555) 019-2834',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isActive: true
    });

    const support = await User.create({
      name: 'Marcus Chen',
      email: 'support@crmpro.com',
      password: 'Support@123',
      role: 'customer_support',
      department: 'Customer Success',
      phone: '+1 (555) 019-2835',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isActive: true
    });

    console.log('[Seeder] Seeding Customers...');

    const customers = await Customer.create([
      {
        name: 'Robert Vance',
        company: 'Vance Refrigeration Systems',
        email: 'rvance@vancerefrig.com',
        phone: '+1 (555) 234-5678',
        address: { street: '142 Industrial Pkwy', city: 'Scranton', state: 'PA', zip: '18504', country: 'USA' },
        status: 'active',
        source: 'Referral',
        industry: 'Manufacturing',
        totalRevenue: 48500,
        assignedTo: executive1._id,
        notes: 'Long-term client renewing service maintenance SLA yearly.',
        createdBy: admin._id
      },
      {
        name: 'Katherine Hall',
        company: 'CloudScale Technologies',
        email: 'k.hall@cloudscale.io',
        phone: '+1 (555) 876-5432',
        address: { street: '742 Evergreen Terrace', city: 'Austin', state: 'TX', zip: '78701', country: 'USA' },
        status: 'active',
        source: 'Website',
        industry: 'Technology',
        totalRevenue: 92000,
        assignedTo: executive2._id,
        notes: 'Enterprise SaaS tier customer; interested in custom API add-ons.',
        createdBy: manager._id
      },
      {
        name: 'Benjamin Ross',
        company: 'Apex BioLogistics',
        email: 'b.ross@apexlogistics.com',
        phone: '+1 (555) 432-1098',
        address: { street: '55 Harbor View Dr', city: 'Boston', state: 'MA', zip: '02110', country: 'USA' },
        status: 'active',
        source: 'LinkedIn',
        industry: 'Healthcare & Pharma',
        totalRevenue: 34000,
        assignedTo: executive1._id,
        notes: 'Requires HIPAA compliant logging and cold chain tracking integrations.',
        createdBy: admin._id
      },
      {
        name: 'Maya Patel',
        company: 'BrightPath Learning Academy',
        email: 'mpatel@brightpath.edu',
        phone: '+1 (555) 321-7654',
        address: { street: '12 University Blvd', city: 'Denver', state: 'CO', zip: '80202', country: 'USA' },
        status: 'active',
        source: 'Cold Call',
        industry: 'Education',
        totalRevenue: 18500,
        assignedTo: executive2._id,
        notes: 'School district pilot program across 14 elementary branches.',
        createdBy: executive2._id
      },
      {
        name: 'Liam Henderson',
        company: 'Stellar Dynamics Corp',
        email: 'liam@stellardyn.com',
        phone: '+1 (555) 987-1234',
        address: { street: '88 Apollo Way', city: 'Seattle', state: 'WA', zip: '98101', country: 'USA' },
        status: 'inactive',
        source: 'Trade Show',
        industry: 'Aerospace & Defense',
        totalRevenue: 65000,
        assignedTo: executive1._id,
        notes: 'Contract currently under legal audit for annual renewal.',
        createdBy: admin._id
      }
    ]);

    console.log('[Seeder] Seeding Leads across all 6 Stages...');

    const leads = await Lead.create([
      {
        title: 'Enterprise ERP Modernization',
        name: 'Samantha Reed',
        company: 'Summit Financial Partners',
        email: 'sreed@summitfp.com',
        phone: '+1 (555) 901-2345',
        source: 'Website',
        status: 'New',
        priority: 'High',
        estimatedValue: 28000,
        assignedTo: executive1._id,
        notes: 'Inbound contact form inquiry requesting security whitepaper.',
        createdBy: executive1._id
      },
      {
        title: 'Multi-Location POS Rollout',
        name: 'Carlos Mendoza',
        company: 'Sol Del Sur Eateries',
        email: 'carlos@soldelsur.com',
        phone: '+1 (555) 901-2346',
        source: 'Referral',
        status: 'Contacted',
        priority: 'Medium',
        estimatedValue: 15500,
        assignedTo: executive2._id,
        notes: 'Introductory phone call completed; scheduled product demo.',
        createdBy: manager._id
      },
      {
        title: 'Cybersecurity Compliance Suite',
        name: 'Arthur Pendelton',
        company: 'ShieldGuard Security',
        email: 'arthur@shieldguard.co',
        phone: '+1 (555) 901-2347',
        source: 'Cold Call',
        status: 'Qualified',
        priority: 'Urgent',
        estimatedValue: 42000,
        assignedTo: executive1._id,
        notes: 'BANT qualification verified: Budget $50k approved, Q4 deadline.',
        createdBy: executive1._id
      },
      {
        title: 'Global Supply Chain Dashboard',
        name: 'Diana Prince',
        company: 'Themis Global Shipping',
        email: 'dprince@themislogistics.com',
        phone: '+1 (555) 901-2348',
        source: 'LinkedIn',
        status: 'Proposal',
        priority: 'High',
        estimatedValue: 56000,
        assignedTo: executive2._id,
        notes: 'Formal proposal submitted; awaiting procurement board review.',
        createdBy: manager._id
      },
      {
        title: 'Fleet Management Telematics',
        name: 'Robert Vance',
        company: 'Vance Refrigeration Systems',
        email: 'rvance@vancerefrig.com',
        phone: '+1 (555) 234-5678',
        source: 'Referral',
        status: 'Converted',
        priority: 'High',
        estimatedValue: 48500,
        assignedTo: executive1._id,
        convertedCustomerId: customers[0]._id,
        convertedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        notes: 'Successfully closed deal and converted to active customer account.',
        createdBy: admin._id
      },
      {
        title: 'Legacy Database Migration',
        name: 'Gregory House',
        company: 'Princeton Diagnostics',
        email: 'ghouse@princetondiag.org',
        phone: '+1 (555) 901-2349',
        source: 'Email Campaign',
        status: 'Lost',
        priority: 'Low',
        estimatedValue: 22000,
        assignedTo: executive2._id,
        notes: 'Lost to competitor due to legacy on-premise hardware constraints.',
        createdBy: executive2._id
      }
    ]);

    console.log('[Seeder] Seeding Opportunities & Historical Sales for Reports...');

    const opportunities = await Opportunity.create([
      {
        title: 'Vance Refrigeration Annual Service',
        customer: customers[0]._id,
        value: 48500,
        stage: 'Closed Won',
        probability: 100,
        expectedCloseDate: new Date('2026-08-15'),
        actualCloseDate: new Date('2026-08-14'),
        assignedTo: executive1._id,
        createdBy: admin._id,
        notes: 'Signed and paid upfront.'
      },
      {
        title: 'CloudScale Multi-Tenant Infrastructure',
        customer: customers[1]._id,
        value: 92000,
        stage: 'Closed Won',
        probability: 100,
        expectedCloseDate: new Date('2026-09-20'),
        actualCloseDate: new Date('2026-09-18'),
        assignedTo: executive2._id,
        createdBy: manager._id,
        notes: 'Major strategic win.'
      },
      {
        title: 'Apex BioLogistics Cold Chain SLA',
        customer: customers[2]._id,
        value: 34000,
        stage: 'Closed Won',
        probability: 100,
        expectedCloseDate: new Date('2026-10-10'),
        actualCloseDate: new Date('2026-10-08'),
        assignedTo: executive1._id,
        createdBy: admin._id,
        notes: 'Annual recurring contract.'
      },
      {
        title: 'Themis Global Shipping Fleet Contract',
        customer: customers[2]._id,
        lead: leads[3]._id,
        value: 56000,
        stage: 'Proposal',
        probability: 75,
        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        assignedTo: executive2._id,
        createdBy: manager._id,
        notes: 'Decision maker presentation next Tuesday.'
      },
      {
        title: 'ShieldGuard Security Compliance',
        lead: leads[2]._id,
        value: 42000,
        stage: 'Negotiation',
        probability: 80,
        expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        assignedTo: executive1._id,
        createdBy: executive1._id,
        notes: 'Contract redlines in progress.'
      },
      {
        title: 'Princeton Diagnostics Migration',
        lead: leads[5]._id,
        value: 22000,
        stage: 'Closed Lost',
        probability: 0,
        expectedCloseDate: new Date('2026-07-15'),
        actualCloseDate: new Date('2026-07-20'),
        lostReason: 'Budget frozen by board; chose cheaper on-premise bandaid.',
        assignedTo: executive2._id,
        createdBy: executive2._id
      }
    ]);

    console.log('[Seeder] Seeding Follow-ups (Upcoming, Overdue, Completed)...');

    await FollowUp.create([
      {
        title: 'Quarterly Account Health Check Call',
        type: 'Call',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        priority: 'High',
        customer: customers[1]._id,
        assignedTo: executive2._id,
        notes: 'Review cloud usage spike and discuss storage tier expansion.',
        createdBy: manager._id
      },
      {
        title: 'Security Compliance Proposal Presentation',
        type: 'Meeting',
        scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        priority: 'High',
        lead: leads[2]._id,
        assignedTo: executive1._id,
        notes: 'Bring lead architect to explain SOC2 and ISO27001 integration.',
        createdBy: executive1._id
      },
      {
        title: 'Contract Pricing Redline Follow-up',
        type: 'Email',
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'Overdue',
        priority: 'Medium',
        lead: leads[3]._id,
        assignedTo: executive2._id,
        notes: 'Check if CFO reviewed revised payment milestone terms.',
        createdBy: executive2._id
      },
      {
        title: 'Initial Discovery Call',
        type: 'Call',
        scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        priority: 'Medium',
        lead: leads[1]._id,
        assignedTo: executive2._id,
        outcome: 'Client interested in 10-seat trial package.',
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdBy: manager._id
      },
      {
        title: 'Technical Requirement Clarification',
        type: 'Meeting',
        scheduledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        priority: 'High',
        customer: customers[0]._id,
        assignedTo: executive1._id,
        outcome: 'Confirmed hardware serial number compatibility.',
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      }
    ]);

    console.log('[Seeder] Seeding Tasks...');

    await Task.create([
      {
        title: 'Prepare Custom Enterprise Proposal for Themis Shipping',
        description: 'Format multi-region pricing breakdown with 15% annual volume discount.',
        assignedTo: executive2._id,
        priority: 'Urgent',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        relatedTo: { modelType: 'Lead', refId: leads[3]._id },
        createdBy: manager._id
      },
      {
        title: 'Send Revised Master Service Agreement (MSA)',
        description: 'Incorporate corporate counsel terms for Vance Refrigeration renewal.',
        assignedTo: executive1._id,
        priority: 'High',
        status: 'Pending',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        relatedTo: { modelType: 'Customer', refId: customers[0]._id },
        createdBy: admin._id
      },
      {
        title: 'Resolve CloudScale API Rate-Limit Support Ticket',
        description: 'Verify webhook concurrency headers and whitelist staging IP cluster.',
        assignedTo: support._id,
        priority: 'High',
        status: 'Pending',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        relatedTo: { modelType: 'Customer', refId: customers[1]._id },
        createdBy: support._id
      },
      {
        title: 'Audit Inactive Accounts for Win-back Campaign',
        description: 'Export all accounts dormant over 90 days and prepare discount code.',
        assignedTo: manager._id,
        priority: 'Medium',
        status: 'Completed',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      }
    ]);

    console.log('[Seeder] Seeding Customer Interaction History...');

    await Interaction.create([
      {
        type: 'Meeting',
        subject: 'Executive Quarterly Business Review (QBR)',
        details: 'Met with CTO Katherine Hall. Expressed 98% satisfaction with platform uptime. Requested API telemetry dashboard.',
        customer: customers[1]._id,
        performedBy: executive2._id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        durationMinutes: 45,
        outcome: 'Expansion opportunity scheduled for next month.'
      },
      {
        type: 'Call',
        subject: 'Cold Outreach Qualification Call',
        details: 'Discussed cloud migration pain points with Arthur Pendelton. Identified severe compliance bottleneck.',
        lead: leads[2]._id,
        performedBy: executive1._id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        durationMinutes: 25,
        outcome: 'Qualified lead and sent security whitepaper.'
      },
      {
        type: 'Support Ticket',
        subject: 'SSO SAML Integration Certificate Renewal',
        details: 'Customer reported expired Okta cert on authentication portal. Assisted DevOps lead with generating new X.509 cert.',
        customer: customers[0]._id,
        performedBy: support._id,
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        durationMinutes: 30,
        outcome: 'Resolved within SLA. Customer provided 5-star rating.'
      },
      {
        type: 'Email',
        subject: 'Enterprise Proposal & Price Sheet V2',
        details: 'Sent customized proposal PDF including multi-year commitment discounts.',
        lead: leads[3]._id,
        performedBy: executive2._id,
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        durationMinutes: 10,
        outcome: 'Received delivery confirmation and read receipt.'
      },
      {
        type: 'Note',
        subject: 'Client Onboarding Brief & Stakeholder Roster',
        details: 'Internal note: Robert Vance is the primary commercial signatory; account billing contact is Phyllis in Finance.',
        customer: customers[0]._id,
        performedBy: admin._id,
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        durationMinutes: 15,
        outcome: 'Saved to customer knowledge base.'
      }
    ]);

    console.log('[Seeder] Data seeding completed successfully!');
  } catch (error) {
    console.error('[Seeder Error]:', error);
    throw error;
  } finally {
    if (shouldDisconnect) {
      await disconnectDB();
    }
  }
};

if (require.main === module) {
  seedData(true).then(() => process.exit(0));
}

module.exports = seedData;
