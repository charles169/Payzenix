import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PayslipData {
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  month: string;
  year: number;
  basicSalary: number;
  hra: number;
  transport: number;
  medical: number;
  otherAllowances: number;
  pf: number;
  esi: number;
  tax: number;
  otherDeductions: number;
  grossSalary: number;
  netSalary: number;
}

export const generatePayslipPDF = (data: PayslipData) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PayZenix', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Payroll Management System', 105, 28, { align: 'center' });
  doc.text('www.payzenix.com | support@payzenix.com', 105, 35, { align: 'center' });
  
  // Payslip Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SALARY SLIP', 105, 55, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.month} ${data.year}`, 105, 62, { align: 'center' });
  
  // Employee Details
  const startY = 75;
  doc.setFontSize(10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Details:', 20, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${data.employeeName}`, 20, startY + 8);
  doc.text(`Employee ID: ${data.employeeId}`, 20, startY + 16);
  doc.text(`Designation: ${data.designation}`, 20, startY + 24);
  doc.text(`Department: ${data.department}`, 20, startY + 32);
  
  // Salary Breakdown Table
  const tableStartY = startY + 45;
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Earnings', 'Amount (₹)', 'Deductions', 'Amount (₹)']],
    body: [
      ['Basic Salary', data.basicSalary.toLocaleString('en-IN'), 'Provident Fund', data.pf.toLocaleString('en-IN')],
      ['HRA', data.hra.toLocaleString('en-IN'), 'ESI', data.esi.toLocaleString('en-IN')],
      ['Transport Allowance', data.transport.toLocaleString('en-IN'), 'Income Tax', data.tax.toLocaleString('en-IN')],
      ['Medical Allowance', data.medical.toLocaleString('en-IN'), 'Other Deductions', data.otherDeductions.toLocaleString('en-IN')],
      ['Other Allowances', data.otherAllowances.toLocaleString('en-IN'), '', ''],
    ],
    foot: [
      ['Total Earnings', data.grossSalary.toLocaleString('en-IN'), 'Total Deductions', (data.pf + data.esi + data.tax + data.otherDeductions).toLocaleString('en-IN')]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    footStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
    },
    columnStyles: {
      0: { fontStyle: 'normal' },
      1: { halign: 'right', fontStyle: 'bold' },
      2: { fontStyle: 'normal' },
      3: { halign: 'right', fontStyle: 'bold' },
    },
  });
  
  // Net Salary Box
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFillColor(220, 252, 231);
  doc.rect(20, finalY, 170, 20, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Salary:', 25, finalY + 13);
  doc.text(`₹${data.netSalary.toLocaleString('en-IN')}`, 185, finalY + 13, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated payslip and does not require a signature.', 105, finalY + 35, { align: 'center' });
  doc.text('For any queries, please contact HR department.', 105, finalY + 40, { align: 'center' });
  
  // Save PDF
  doc.save(`Payslip_${data.employeeId}_${data.month}_${data.year}.pdf`);
};

export const generateBulkPayslipsPDF = (payslips: PayslipData[]) => {
  payslips.forEach((payslip, index) => {
    setTimeout(() => {
      generatePayslipPDF(payslip);
    }, index * 500); // Delay to avoid browser blocking multiple downloads
  });
};
