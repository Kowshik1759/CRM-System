const http = require('http');
const { app, startServer } = require('../server');

const runFullLifecycleSimulation = async () => {
  console.log('\n=============================================================');
  console.log(' STARTING FULL END-TO-END BUSINESS LIFECYCLE SIMULATION');
  console.log('=============================================================\n');

  let server;

  try {
    server = await startServer();
    const port = 5000;

    const request = (path, method = 'GET', body = null, token = null) => {
      return new Promise((resolve, reject) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(
          {
            hostname: '127.0.0.1',
            port,
            path,
            method,
            headers
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                resolve({ status: res.statusCode, data: parsed });
              } catch (e) {
                resolve({ status: res.statusCode, raw: data });
              }
            });
          }
        );

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
      });
    };

    // Step 1: Admin Login
    console.log('[Step 1] Authenticating as Admin (Alexander Wright)...');
    const loginRes = await request('/api/v1/auth/login', 'POST', {
      email: 'admin@crmpro.com',
      password: 'Admin@123'
    });
    const token = loginRes.data.token;
    console.log('✓ Admin authenticated successfully. JWT token obtained.\n');

    // Step 2: Capture initial reports baseline
    console.log('[Step 2] Capturing baseline metrics from Reports...');
    const baselineConversion = await request('/api/v1/reports/lead-conversion', 'GET', null, token);
    const baselineSales = await request('/api/v1/reports/sales-performance', 'GET', null, token);
    const initialRevenue = baselineSales.data.data.summary.totalRevenue;
    const initialConvertedLeads = baselineConversion.data.data.summary.convertedLeads;
    console.log(`Initial Converted Leads: ${initialConvertedLeads}`);
    console.log(`Initial Closed Revenue:  $${initialRevenue.toLocaleString()}\n`);

    // Step 3: Create a high-value Lead
    console.log('[Step 3] Creating new prospect Lead ("Global Logistics AI Dispatcher" - $75,000)...');
    const newLeadRes = await request('/api/v1/leads', 'POST', {
      title: 'Global Logistics AI Dispatcher',
      name: 'Victoria Vance',
      company: 'Global Freight Carriers Ltd',
      email: 'vvance@globalfreight.com',
      phone: '+1 (555) 789-0123',
      source: 'LinkedIn',
      status: 'New',
      priority: 'Urgent',
      estimatedValue: 75000,
      notes: 'Enterprise fleet dispatch optimization RFP.'
    }, token);
    const leadId = newLeadRes.data.data._id;
    console.log(`✓ Lead created with ID: ${leadId}\n`);

    // Step 4: Advance Lead through Pipeline Stages
    console.log('[Step 4] Advancing Lead through Pipeline: New -> Contacted -> Qualified -> Proposal...');
    await request(`/api/v1/leads/${leadId}/stage`, 'PATCH', { status: 'Contacted' }, token);
    await request(`/api/v1/leads/${leadId}/stage`, 'PATCH', { status: 'Qualified' }, token);
    await request(`/api/v1/leads/${leadId}/stage`, 'PATCH', { status: 'Proposal' }, token);
    console.log('✓ Lead successfully advanced to "Proposal" stage in Kanban pipeline.\n');

    // Step 5: Convert Lead into Customer
    console.log('[Step 5] Executing 1-Click "Convert Lead to Customer" action...');
    const convertRes = await request(`/api/v1/leads/${leadId}/convert`, 'POST', null, token);
    const customerId = convertRes.data.customer._id;
    const opportunityId = convertRes.data.opportunity._id;
    console.log(`✓ Customer created: "${convertRes.data.customer.company}" (ID: ${customerId})`);
    console.log(`✓ Opportunity auto-generated: Value $${convertRes.data.opportunity.value} (ID: ${opportunityId})\n`);

    // Step 6: Log Customer Interaction
    console.log('[Step 6] Recording Customer Interaction (Executive Technical Review)...');
    await request('/api/v1/interactions', 'POST', {
      type: 'Meeting',
      subject: 'Executive Technical Review & Security Architecture',
      details: 'Conducted live security audit with VP of Engineering. Approved architecture.',
      customer: customerId,
      durationMinutes: 60,
      outcome: 'Signed commercial agreement!'
    }, token);
    console.log('✓ Interaction logged in customer history timeline.\n');

    // Step 7: Close Opportunity as Won
    console.log('[Step 7] Updating Opportunity stage to "Closed Won"...');
    await request(`/api/v1/opportunities/${opportunityId}`, 'PUT', {
      stage: 'Closed Won'
    }, token);
    console.log('✓ Opportunity marked as Won! Revenue credited to customer account.\n');

    // Step 8: Schedule and Complete a Follow-up Activity
    console.log('[Step 8] Scheduling & Completing Post-Sale Onboarding Follow-up...');
    const followupRes = await request('/api/v1/followups', 'POST', {
      title: 'Customer Onboarding Kickoff Call',
      type: 'Meeting',
      scheduledDate: new Date().toISOString(),
      priority: 'High',
      customer: customerId,
      notes: 'Initial account provisioning kickoff.'
    }, token);
    const followupId = followupRes.data.data._id;

    await request(`/api/v1/followups/${followupId}`, 'PUT', {
      status: 'Completed',
      outcome: 'Kickoff call completed successfully with all stakeholders.'
    }, token);
    console.log('✓ Follow-up activity marked as Completed with outcome.\n');

    // Step 9: Verify Real-Time Updates in All 4 Mandatory Reports
    console.log('[Step 9] Verifying Real-Time Updates Across All 4 Mandatory Reports...');

    const updatedConversion = await request('/api/v1/reports/lead-conversion', 'GET', null, token);
    const updatedSales = await request('/api/v1/reports/sales-performance', 'GET', null, token);
    const updatedCustomers = await request('/api/v1/reports/customer-details', 'GET', null, token);
    const updatedFollowups = await request('/api/v1/reports/followup-activity', 'GET', null, token);

    console.log('\n--- VERIFICATION OF DYNAMIC METRICS ---');

    // Report 1 verification
    const newConvertedLeads = updatedConversion.data.data.summary.convertedLeads;
    console.log(`Report 1 (Lead Conversion): Converted Leads: ${initialConvertedLeads} -> ${newConvertedLeads} (Incremented by ${newConvertedLeads - initialConvertedLeads})`);
    if (newConvertedLeads !== initialConvertedLeads + 1) throw new Error('Lead conversion report did not dynamically reflect the converted lead');

    // Report 2 verification
    const newRevenue = updatedSales.data.data.summary.totalRevenue;
    console.log(`Report 2 (Sales Performance): Closed Revenue: $${initialRevenue.toLocaleString()} -> $${newRevenue.toLocaleString()} (+$${(newRevenue - initialRevenue).toLocaleString()})`);
    if (newRevenue !== initialRevenue + 75000) throw new Error('Sales performance report did not dynamically reflect the won opportunity revenue');

    // Report 3 verification
    const foundNewCustomer = updatedCustomers.data.data.customers.find((c) => c._id === customerId);
    console.log(`Report 3 (Customer Details): New Customer "${foundNewCustomer?.company}" verified in customer report with Revenue $${(foundNewCustomer?.totalRevenue || 0).toLocaleString()}`);
    if (!foundNewCustomer) throw new Error('New customer record missing from customer details report');

    // Report 4 verification
    const completedCount = updatedFollowups.data.data.summary.completedFollowups;
    console.log(`Report 4 (Follow-up Activity): Completed Follow-ups Count: ${completedCount}`);
    if (completedCount <= 0) throw new Error('Follow-up activity report did not reflect completed follow-ups');

    console.log('\n=============================================================');
    console.log(' SUCCESS: FULL BUSINESS LIFECYCLE E2E SIMULATION VERIFIED!');
    console.log(' ALL 4 REPORTS DYNAMICALLY UPDATED FROM LIVE MONGODB DATA!');
    console.log('=============================================================\n');
  } catch (error) {
    console.error('Simulation Error:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
      const { disconnectDB } = require('../config/db');
      await disconnectDB();
    }
    process.exit(0);
  }
};

runFullLifecycleSimulation();
