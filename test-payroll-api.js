// Test the payroll API endpoint
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQHBheXplbml4LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczODk5MjAwMCwiZXhwIjoxNzM5MDc4NDAwfQ.test'; // You'll need to get a real token

fetch('http://localhost:3001/api/payroll', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => {
    console.log('Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('Payroll data:', JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
