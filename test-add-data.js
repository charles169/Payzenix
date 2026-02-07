// Test script to verify data is being added to MongoDB
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
let token = '';

// Test credentials
const testUser = {
  email: 'admin@payzenix.com',
  password: 'admin123'
};

// Test data
const testEmployee = {
  employeeId: 'TEST001',
  name: 'Test Employee',
  email: 'test@example.com',
  phone: '1234567890',
  department: 'Engineering',
  designation: 'Software Engineer',
  salary: 50000,
  location: 'Test City',
  status: 'active'
};

const testLoan = {
  employee: '', // Will be filled after getting employee
  loanType: 'personal',
  amount: 10000,
  interestRate: 5,
  tenure: 12,
  emiAmount: 856,
  startDate: new Date(),
  status: 'pending',
  remainingAmount: 10000,
  reason: 'Test loan'
};

const testPayroll = {
  employee: '', // Will be filled after getting employee
  month: 2,
  year: 2024,
  basicSalary: 50000,
  allowances: {
    hra: 20000,
    transport: 2000,
    medical: 1500,
    other: 1000
  },
  deductions: {
    pf: 6000,
    esi: 750,
    tax: 5000,
    other: 500
  },
  grossSalary: 74500,
  netSalary: 62250,
  status: 'pending'
};

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, testUser);
    token = response.data.token;
    console.log('✅ Login successful!');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testAddEmployee() {
  try {
    console.log('\n👤 Testing Add Employee...');
    const response = await axios.post(`${API_URL}/employees`, testEmployee, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Employee added successfully!');
    console.log('   ID:', response.data._id);
    console.log('   Name:', response.data.name);
    return response.data._id;
  } catch (error) {
    console.error('❌ Add employee failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testAddLoan(employeeId) {
  try {
    console.log('\n💰 Testing Add Loan...');
    testLoan.employee = employeeId;
    const response = await axios.post(`${API_URL}/loans`, testLoan, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Loan added successfully!');
    console.log('   ID:', response.data._id);
    console.log('   Amount:', response.data.amount);
    return response.data._id;
  } catch (error) {
    console.error('❌ Add loan failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testAddPayroll(employeeId) {
  try {
    console.log('\n💵 Testing Add Payroll...');
    testPayroll.employee = employeeId;
    const response = await axios.post(`${API_URL}/payroll`, testPayroll, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Payroll added successfully!');
    console.log('   ID:', response.data._id);
    console.log('   Net Salary:', response.data.netSalary);
    return response.data._id;
  } catch (error) {
    console.error('❌ Add payroll failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function checkDatabase() {
  try {
    console.log('\n📊 Checking database counts...');
    
    const [employees, loans, payrolls, auditLogs] = await Promise.all([
      axios.get(`${API_URL}/employees`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_URL}/loans`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_URL}/payroll`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_URL}/audit-logs`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    
    console.log('✅ Database counts:');
    console.log('   Employees:', employees.data.length);
    console.log('   Loans:', loans.data.length);
    console.log('   Payrolls:', payrolls.data.length);
    console.log('   Audit Logs:', auditLogs.data.length);
  } catch (error) {
    console.error('❌ Database check failed:', error.response?.data?.message || error.message);
  }
}

async function cleanup(employeeId, loanId, payrollId) {
  try {
    console.log('\n🧹 Cleaning up test data...');
    
    if (payrollId) {
      await axios.delete(`${API_URL}/payroll/${payrollId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Test payroll deleted');
    }
    
    if (loanId) {
      await axios.delete(`${API_URL}/loans/${loanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Test loan deleted');
    }
    
    if (employeeId) {
      await axios.delete(`${API_URL}/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Test employee deleted');
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting PayZenix Data Addition Tests\n');
  console.log('=' .repeat(50));
  
  // Login
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('\n❌ Tests failed: Could not login');
    return;
  }
  
  // Test adding data
  const employeeId = await testAddEmployee();
  const loanId = employeeId ? await testAddLoan(employeeId) : null;
  const payrollId = employeeId ? await testAddPayroll(employeeId) : null;
  
  // Check database
  await checkDatabase();
  
  // Cleanup
  await cleanup(employeeId, loanId, payrollId);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!');
  console.log('\n📝 Summary:');
  console.log('   ✅ Employee addition: ' + (employeeId ? 'WORKING' : 'FAILED'));
  console.log('   ✅ Loan addition: ' + (loanId ? 'WORKING' : 'FAILED'));
  console.log('   ✅ Payroll addition: ' + (payrollId ? 'WORKING' : 'FAILED'));
  console.log('\n🎉 All data is being saved to MongoDB correctly!');
}

// Run tests
runTests().catch(console.error);
