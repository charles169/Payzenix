import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Download Compliance Challans as PDF
export const downloadComplianceChallans = () => {
  const doc = new jsPDF();
  
  // PF Challan
  doc.setFontSize(18);
  doc.text('Provident Fund (PF) Challan', 20, 20);
  doc.setFontSize(10);
  doc.text('Month: February 2024', 20, 30);
  doc.text('Due Date: 15th Feb 2024', 20, 35);
  
  autoTable(doc, {
    startY: 45,
    head: [['Component', 'Employer', 'Employee', 'Total']],
    body: [
      ['PF Contribution', '₹1,56,780', '₹1,56,780', '₹3,13,560'],
      ['Admin Charges', '₹1,200', '-', '₹1,200'],
      ['EDLI', '₹800', '-', '₹800'],
      ['Total', '₹1,58,780', '₹1,56,780', '₹3,15,560']
    ]
  });
  
  doc.save('PF_Challan_Feb2024.pdf');
  
  // ESI Challan
  setTimeout(() => {
    const doc2 = new jsPDF();
    doc2.setFontSize(18);
    doc2.text('ESI Challan', 20, 20);
    doc2.setFontSize(10);
    doc2.text('Month: February 2024', 20, 30);
    doc2.text('Due Date: 15th Feb 2024', 20, 35);
    
    autoTable(doc2, {
      startY: 45,
      head: [['Component', 'Employer', 'Employee', 'Total']],
      body: [
        ['ESI Contribution', '₹23,456', '₹5,400', '₹28,856']
      ]
    });
    
    doc2.save('ESI_Challan_Feb2024.pdf');
  }, 500);
  
  // TDS Challan
  setTimeout(() => {
    const doc3 = new jsPDF();
    doc3.setFontSize(18);
    doc3.text('TDS Challan', 20, 20);
    doc3.setFontSize(10);
    doc3.text('Month: February 2024', 20, 30);
    doc3.text('Due Date: 7th Feb 2024', 20, 35);
    
    autoTable(doc3, {
      startY: 45,
      head: [['Component', 'Amount']],
      body: [
        ['TDS on Salary', '₹98,765']
      ]
    });
    
    doc3.save('TDS_Challan_Feb2024.pdf');
  }, 1000);
  
  // PT Challan
  setTimeout(() => {
    const doc4 = new jsPDF();
    doc4.setFontSize(18);
    doc4.text('Professional Tax Challan', 20, 20);
    doc4.setFontSize(10);
    doc4.text('Month: February 2024', 20, 30);
    doc4.text('Due Date: 20th Feb 2024', 20, 35);
    
    autoTable(doc4, {
      startY: 45,
      head: [['Component', 'Amount']],
      body: [
        ['Professional Tax', '₹9,600']
      ]
    });
    
    doc4.save('PT_Challan_Feb2024.pdf');
  }, 1500);
};

// Download Employees as PDF
export const downloadEmployeesPDF = (employees: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('PayZenix - Employee List', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 28);
  
  const tableData = employees.map(emp => [
    emp.employeeId || 'N/A',
    emp.name || 'N/A',
    emp.department || 'N/A',
    emp.designation || 'N/A',
    emp.location || 'N/A',
    `₹${(emp.salary || 0).toLocaleString('en-IN')}`
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Name', 'Department', 'Designation', 'Location', 'Salary']],
    body: tableData,
    styles: { fontSize: 8 }
  });
  
  doc.save('Employees_List.pdf');
};

// Download Employees as CSV
export const downloadEmployeesCSV = (employees: any[]) => {
  const headers = ['Employee ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Location', 'Salary', 'Status'];
  const rows = employees.map(emp => [
    emp.employeeId || '',
    emp.name || '',
    emp.email || '',
    emp.phone || '',
    emp.department || '',
    emp.designation || '',
    emp.location || '',
    emp.salary || 0,
    emp.status || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Employees_List.csv';
  link.click();
};

// Download Payroll as PDF
export const downloadPayrollPDF = (payrolls: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('PayZenix - Payroll Records', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 28);
  
  const tableData = payrolls.map(p => [
    p.employee || 'N/A',
    `${p.month || ''} ${p.year || ''}`,
    `₹${(p.basicSalary || 0).toLocaleString('en-IN')}`,
    `₹${(p.totalDeductions || 0).toLocaleString('en-IN')}`,
    `₹${(p.netSalary || 0).toLocaleString('en-IN')}`,
    p.status || 'N/A'
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [['Employee', 'Period', 'Basic', 'Deductions', 'Net Pay', 'Status']],
    body: tableData,
    styles: { fontSize: 8 }
  });
  
  doc.save('Payroll_Records.pdf');
};

// Download Loans as PDF
export const downloadLoansPDF = (loans: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('PayZenix - Loan Records', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 28);
  
  const tableData = loans.map(loan => [
    loan.employee || 'N/A',
    loan.loanType || 'N/A',
    `₹${(loan.amount || 0).toLocaleString('en-IN')}`,
    `${loan.tenure || 0} months`,
    `₹${(loan.emi || 0).toLocaleString('en-IN')}`,
    loan.status || 'N/A'
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [['Employee', 'Type', 'Amount', 'Tenure', 'EMI', 'Status']],
    body: tableData,
    styles: { fontSize: 8 }
  });
  
  doc.save('Loan_Records.pdf');
};

// Download Audit Logs as PDF
export const downloadAuditLogsPDF = (logs: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('PayZenix - Audit Logs', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 28);
  
  const tableData = logs.map(log => [
    new Date(log.createdAt).toLocaleString(),
    log.user || 'N/A',
    log.action || 'N/A',
    log.module || 'N/A',
    log.details || 'N/A'
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [['Timestamp', 'User', 'Action', 'Module', 'Details']],
    body: tableData,
    styles: { fontSize: 7 },
    columnStyles: {
      4: { cellWidth: 60 }
    }
  });
  
  doc.save('Audit_Logs.pdf');
};
