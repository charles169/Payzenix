import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Download Compliance Challans as PDF (with calculated data from payroll)
export const downloadComplianceChallans = async (payrolls: any[]) => {
  // Calculate totals from actual payroll data
  const totalPF = payrolls.reduce((sum, p) => sum + (p.deductions?.pf || 0), 0);
  const totalESI = payrolls.reduce((sum, p) => sum + (p.deductions?.esi || 0), 0);
  const totalTDS = payrolls.reduce((sum, p) => sum + (p.deductions?.tax || 0), 0);
  const totalPT = payrolls.reduce((sum, p) => sum + (p.deductions?.pt || 0), 0);
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // PF Challan
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PayZenix Payroll System', 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Provident Fund (PF) Challan', 105, 25, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${currentMonth}`, 20, 35);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);
  
  autoTable(doc, {
    startY: 50,
    head: [['Component', 'Employer Share', 'Employee Share', 'Total Amount']],
    body: [
      ['PF Contribution (12%)', `₹${(totalPF / 2).toLocaleString('en-IN')}`, `₹${(totalPF / 2).toLocaleString('en-IN')}`, `₹${totalPF.toLocaleString('en-IN')}`],
      ['Admin Charges (0.5%)', `₹${Math.round(totalPF * 0.005).toLocaleString('en-IN')}`, '-', `₹${Math.round(totalPF * 0.005).toLocaleString('en-IN')}`],
      ['EDLI (0.5%)', `₹${Math.round(totalPF * 0.005).toLocaleString('en-IN')}`, '-', `₹${Math.round(totalPF * 0.005).toLocaleString('en-IN')}`],
      ['Total Payable', '', '', `₹${Math.round(totalPF * 1.01).toLocaleString('en-IN')}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }
  });
  
  doc.text(`Total Employees: ${payrolls.length}`, 20, 120);
  doc.text('Due Date: 15th of next month', 20, 125);
  doc.save(`PF_Challan_${currentMonth.replace(' ', '_')}.pdf`);
  
  // ESI Challan
  setTimeout(() => {
    const doc2 = new jsPDF();
    doc2.setFontSize(20);
    doc2.setFont('helvetica', 'bold');
    doc2.text('PayZenix Payroll System', 105, 15, { align: 'center' });
    doc2.setFontSize(16);
    doc2.text('ESI Challan', 105, 25, { align: 'center' });
    doc2.setFontSize(10);
    doc2.setFont('helvetica', 'normal');
    doc2.text(`Period: ${currentMonth}`, 20, 35);
    doc2.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);
    
    autoTable(doc2, {
      startY: 50,
      head: [['Component', 'Employer Share (3.25%)', 'Employee Share (0.75%)', 'Total Amount']],
      body: [
        ['ESI Contribution', `₹${Math.round(totalESI * 0.8125).toLocaleString('en-IN')}`, `₹${Math.round(totalESI * 0.1875).toLocaleString('en-IN')}`, `₹${totalESI.toLocaleString('en-IN')}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    doc2.text(`Total Employees: ${payrolls.length}`, 20, 100);
    doc2.text('Due Date: 15th of next month', 20, 105);
    doc2.save(`ESI_Challan_${currentMonth.replace(' ', '_')}.pdf`);
  }, 500);
  
  // TDS Challan
  setTimeout(() => {
    const doc3 = new jsPDF();
    doc3.setFontSize(20);
    doc3.setFont('helvetica', 'bold');
    doc3.text('PayZenix Payroll System', 105, 15, { align: 'center' });
    doc3.setFontSize(16);
    doc3.text('TDS Challan (Form 24Q)', 105, 25, { align: 'center' });
    doc3.setFontSize(10);
    doc3.setFont('helvetica', 'normal');
    doc3.text(`Period: ${currentMonth}`, 20, 35);
    doc3.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);
    
    autoTable(doc3, {
      startY: 50,
      head: [['Component', 'Amount']],
      body: [
        ['TDS on Salary (Section 192)', `₹${totalTDS.toLocaleString('en-IN')}`],
        ['Surcharge', `₹${Math.round(totalTDS * 0.1).toLocaleString('en-IN')}`],
        ['Total TDS Payable', `₹${Math.round(totalTDS * 1.1).toLocaleString('en-IN')}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    doc3.text(`Total Employees: ${payrolls.length}`, 20, 110);
    doc3.text('Due Date: 7th of next month', 20, 115);
    doc3.save(`TDS_Challan_${currentMonth.replace(' ', '_')}.pdf`);
  }, 1000);
  
  // PT Challan
  setTimeout(() => {
    const doc4 = new jsPDF();
    doc4.setFontSize(20);
    doc4.setFont('helvetica', 'bold');
    doc4.text('PayZenix Payroll System', 105, 15, { align: 'center' });
    doc4.setFontSize(16);
    doc4.text('Professional Tax Challan', 105, 25, { align: 'center' });
    doc4.setFontSize(10);
    doc4.setFont('helvetica', 'normal');
    doc4.text(`Period: ${currentMonth}`, 20, 35);
    doc4.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);
    
    autoTable(doc4, {
      startY: 50,
      head: [['Component', 'Amount']],
      body: [
        ['Professional Tax', `₹${totalPT.toLocaleString('en-IN')}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    doc4.text(`Total Employees: ${payrolls.length}`, 20, 90);
    doc4.text('Due Date: 20th of next month', 20, 95);
    doc4.save(`PT_Challan_${currentMonth.replace(' ', '_')}.pdf`);
  }, 1500);
};

// Download Employees as PDF
export const downloadEmployeesPDF = (employees: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PayZenix - Employee Directory', 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
  doc.text(`Total Employees: ${employees.length}`, 105, 27, { align: 'center' });
  
  const tableData = employees.map(emp => [
    emp.employeeId || 'N/A',
    emp.name || 'N/A',
    emp.department || 'N/A',
    emp.designation || 'N/A',
    emp.location || 'N/A',
    `₹${(emp.salary || 0).toLocaleString('en-IN')}`,
    emp.status || 'N/A'
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Name', 'Department', 'Designation', 'Location', 'Salary', 'Status']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'grid'
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('PayZenix Payroll System - Confidential', 105, 290, { align: 'center' });
  }
  
  doc.save(`Employees_${new Date().toISOString().split('T')[0]}.pdf`);
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
  const doc = new jsPDF('landscape');
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PayZenix - Payroll Report', 148, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 148, 22, { align: 'center' });
  doc.text(`Total Records: ${payrolls.length}`, 148, 27, { align: 'center' });
  
  // Calculate totals
  const totalGross = payrolls.reduce((sum, p) => sum + (p.grossSalary || p.basicSalary || 0), 0);
  const totalDeductions = payrolls.reduce((sum, p) => {
    if (p.totalDeductions) return sum + p.totalDeductions;
    if (p.deductions) {
      return sum + (p.deductions.pf || 0) + (p.deductions.esi || 0) + (p.deductions.tax || 0) + (p.deductions.other || 0);
    }
    return sum;
  }, 0);
  const totalNet = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  
  const tableData = payrolls.map(p => {
    const deductions = p.totalDeductions || 
      ((p.deductions?.pf || 0) + (p.deductions?.esi || 0) + (p.deductions?.tax || 0) + (p.deductions?.other || 0));
    
    return [
      p.employee || p.employeeId || 'N/A',
      `${p.month || ''} ${p.year || ''}`,
      `₹${(p.grossSalary || p.basicSalary || 0).toLocaleString('en-IN')}`,
      `₹${deductions.toLocaleString('en-IN')}`,
      `₹${(p.netSalary || 0).toLocaleString('en-IN')}`,
      p.status || 'N/A'
    ];
  });
  
  // Add totals row
  tableData.push([
    'TOTAL',
    '',
    `₹${totalGross.toLocaleString('en-IN')}`,
    `₹${totalDeductions.toLocaleString('en-IN')}`,
    `₹${totalNet.toLocaleString('en-IN')}`,
    ''
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [['Employee', 'Period', 'Gross Salary', 'Deductions', 'Net Pay', 'Status']],
    body: tableData,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'grid',
    foot: [[`Total: ${payrolls.length} records`, '', `₹${totalGross.toLocaleString('en-IN')}`, `₹${totalDeductions.toLocaleString('en-IN')}`, `₹${totalNet.toLocaleString('en-IN')}`, '']],
    footStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 148, 200, { align: 'center' });
    doc.text('PayZenix Payroll System - Confidential', 148, 205, { align: 'center' });
  }
  
  doc.save(`Payroll_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Download Loans as PDF
export const downloadLoansPDF = (loans: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PayZenix - Loan Records', 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
  doc.text(`Total Loans: ${loans.length}`, 105, 27, { align: 'center' });
  
  // Calculate totals
  const totalAmount = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const totalEMI = loans.reduce((sum, loan) => sum + (loan.emi || 0), 0);
  const approvedLoans = loans.filter(l => l.status === 'approved').length;
  const pendingLoans = loans.filter(l => l.status === 'pending').length;
  
  // Summary box
  doc.setFillColor(245, 247, 250);
  doc.rect(15, 32, 180, 20, 'F');
  doc.setFontSize(9);
  doc.text(`Total Loan Amount: ₹${totalAmount.toLocaleString('en-IN')}`, 20, 38);
  doc.text(`Total Monthly EMI: ₹${totalEMI.toLocaleString('en-IN')}`, 20, 43);
  doc.text(`Approved: ${approvedLoans}`, 20, 48);
  doc.text(`Pending: ${pendingLoans}`, 70, 48);
  
  const tableData = loans.map(loan => [
    loan.employee || loan.employeeId || 'N/A',
    loan.loanType || 'N/A',
    `₹${(loan.amount || 0).toLocaleString('en-IN')}`,
    `${loan.tenure || 0} months`,
    `₹${(loan.emi || 0).toLocaleString('en-IN')}`,
    loan.status || 'N/A',
    new Date(loan.appliedDate || loan.createdAt).toLocaleDateString()
  ]);
  
  autoTable(doc, {
    startY: 58,
    head: [['Employee', 'Type', 'Amount', 'Tenure', 'EMI', 'Status', 'Applied Date']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 },
      6: { cellWidth: 30 }
    }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('PayZenix Payroll System - Confidential', 105, 290, { align: 'center' });
  }
  
  doc.save(`Loan_Records_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Download Audit Logs as PDF
export const downloadAuditLogsPDF = (logs: any[]) => {
  const doc = new jsPDF('landscape');
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PayZenix - Audit Trail Report', 148, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 148, 22, { align: 'center' });
  doc.text(`Total Logs: ${logs.length}`, 148, 27, { align: 'center' });
  
  // Summary
  const modules = [...new Set(logs.map(l => l.module))];
  const actions = [...new Set(logs.map(l => l.action))];
  
  doc.setFontSize(9);
  doc.text(`Modules: ${modules.join(', ')}`, 20, 35);
  doc.text(`Actions: ${actions.length} types`, 20, 40);
  
  const tableData = logs.map(log => [
    new Date(log.createdAt || log.timestamp).toLocaleString(),
    log.user || 'N/A',
    log.action || 'N/A',
    log.module || 'N/A',
    (log.details || 'N/A').substring(0, 50) + (log.details?.length > 50 ? '...' : '')
  ]);
  
  autoTable(doc, {
    startY: 48,
    head: [['Timestamp', 'User', 'Action', 'Module', 'Details']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 120 }
    }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 148, 200, { align: 'center' });
    doc.text('PayZenix Payroll System - Audit Trail - Confidential', 148, 205, { align: 'center' });
  }
  
  doc.save(`Audit_Logs_${new Date().toISOString().split('T')[0]}.pdf`);
};
