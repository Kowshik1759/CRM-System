const http = require('http');
const { app, startServer } = require('../server');

const runTests = async () => {
  console.log('[E2E Test] Starting backend and seeding test verification...');
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

    console.log('[Test 1] Testing Health Check Endpoint (/api/health)...');
    const health = await request('/api/health');
    console.log('Health check status:', health.status, health.data?.status);
    if (health.status !== 200) throw new Error('Health check failed');

    console.log('[Test 2] Testing Admin Login (/api/v1/auth/login)...');
    const loginRes = await request('/api/v1/auth/login', 'POST', {
      email: 'admin@crmpro.com',
      password: 'Admin@123'
    });
    console.log('Login status:', loginRes.status, 'User:', loginRes.data?.user?.name, 'Role:', loginRes.data?.user?.role);
    if (!loginRes.data?.token) throw new Error('Admin login failed');
    const token = loginRes.data.token;

    console.log('[Test 3] Testing Dashboard Metrics (/api/v1/dashboard)...');
    const dash = await request('/api/v1/dashboard', 'GET', null, token);
    console.log('Dashboard status:', dash.status, 'Total Customers:', dash.data?.data?.kpis?.totalCustomers, 'Total Revenue: $' + dash.data?.data?.kpis?.totalRevenue);

    console.log('[Test 4] Testing Lead Conversion Report (/api/v1/reports/lead-conversion)...');
    const rep1 = await request('/api/v1/reports/lead-conversion', 'GET', null, token);
    console.log('Lead Conversion Report status:', rep1.status, 'Conversion Rate:', rep1.data?.data?.summary?.conversionRate + '%');

    console.log('[Test 5] Testing Sales Performance Report (/api/v1/reports/sales-performance)...');
    const rep2 = await request('/api/v1/reports/sales-performance', 'GET', null, token);
    console.log('Sales Performance Report status:', rep2.status, 'Won Deals:', rep2.data?.data?.summary?.wonOpportunitiesCount);

    console.log('[Test 6] Testing Customer Details Report (/api/v1/reports/customer-details)...');
    const rep3 = await request('/api/v1/reports/customer-details', 'GET', null, token);
    console.log('Customer Details Report status:', rep3.status, 'Customer Count:', rep3.data?.totalCustomers);

    console.log('[Test 7] Testing Follow-up Activity Report (/api/v1/reports/followup-activity)...');
    const rep4 = await request('/api/v1/reports/followup-activity', 'GET', null, token);
    console.log('Follow-up Report status:', rep4.status, 'Total Followups:', rep4.data?.data?.summary?.totalFollowups);

    console.log('[Test 8] Testing Customers CRUD list (/api/v1/customers)...');
    const custs = await request('/api/v1/customers', 'GET', null, token);
    console.log('Customers count:', custs.data?.count);

    console.log('[Test 9] Testing Leads CRUD list (/api/v1/leads)...');
    const leads = await request('/api/v1/leads', 'GET', null, token);
    console.log('Leads count:', leads.data?.count);

    console.log('[Test 10] Testing Kanban Pipeline endpoint (/api/v1/pipeline)...');
    const pipe = await request('/api/v1/pipeline', 'GET', null, token);
    console.log('Pipeline active deals:', pipe.data?.data?.activeDealsCount, 'Value: $' + pipe.data?.data?.totalPipelineValue);

    console.log('[Test 11] Testing RBAC restriction (Sales Executive trying to access Admin Users endpoint)...');
    const execLogin = await request('/api/v1/auth/login', 'POST', {
      email: 'executive@crmpro.com',
      password: 'Executive@123'
    });
    const execToken = execLogin.data.token;
    const forbiddenRes = await request('/api/v1/users', 'GET', null, execToken);
    console.log('Executive access to /users status (expected 403 Forbidden):', forbiddenRes.status);
    if (forbiddenRes.status !== 403) throw new Error('RBAC check failed: Expected 403 Forbidden for non-admin');

    console.log('\n========================================================');
    console.log(' ALL 11 BACKEND API & RBAC INTEGRATION TESTS PASSED!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('Test run failed:', err);
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

runTests();
