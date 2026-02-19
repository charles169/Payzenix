import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  Calendar,
  Eye,
  X,
  Mail,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

const payslips = [
  { month: 'January 2026', gross: 75000, deduction: 11400, net: 52450 },
  { month: 'December 2025', gross: 75000, deduction: 11400, net: 52450 },
  { month: 'November 2025', gross: 72000, deduction: 10944, net: 50400 },
];

export const MyPayslipsPage = () => {
  const [year, setYear] = useState('2026');
  const [activePayslip, setActivePayslip] = useState<any>(null);

  return (
    <div className="relative flex">

      {/* MAIN CONTENT */}
      <div className={`flex-1 space-y-6 transition-all ${activePayslip ? 'mr-[420px]' : ''}`}>

        <h1 className="text-2xl font-bold">My Payslips</h1>

        <Card>
          <CardContent className="pt-6">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payslip History</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {payslips.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {p.month}
                    </TableCell>

                    <TableCell className="text-right font-bold">
                      ₹{p.net.toLocaleString('en-IN')}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActivePayslip(p)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 🔥 RIGHT DRAWER */}
      <AnimatePresence>
        {activePayslip && (
          <motion.div
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-[420px] bg-background border-l shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="font-bold">{activePayslip.month}</h2>
                <p className="text-sm text-muted-foreground">
                  Net Pay ₹{activePayslip.net.toLocaleString('en-IN')}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setActivePayslip(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Summary */}
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Gross Salary</span>
                <span>₹{activePayslip.gross.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-destructive">
                <span>Deductions</span>
                <span>-₹{activePayslip.deduction.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-primary">
                <span>Net Pay</span>
                <span>₹{activePayslip.net.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="flex-1 px-4 py-3 overflow-y-auto space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Earnings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span>₹{(activePayslip.gross * 0.5).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA</span>
                    <span>₹{(activePayslip.gross * 0.3).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Special Allowance</span>
                    <span>₹{(activePayslip.gross * 0.15).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Allowances</span>
                    <span>₹{(activePayslip.gross * 0.05).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total Earnings</span>
                    <span>₹{activePayslip.gross.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Deductions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>PF (Employee)</span>
                    <span>₹{(activePayslip.deduction * 0.5).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Tax</span>
                    <span>₹{(activePayslip.deduction * 0.15).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TDS</span>
                    <span>₹{(activePayslip.deduction * 0.35).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t text-destructive">
                    <span>Total Deductions</span>
                    <span>-₹{activePayslip.deduction.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Net Payable</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{activePayslip.net.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount credited to your account
                </p>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Payment Date:</strong> 1st of the month</p>
                <p><strong>Payment Mode:</strong> Bank Transfer</p>
                <p><strong>Bank Account:</strong> XXXX XXXX XXXX 1234</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 border-t flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => {
                  // Generate PDF content
                  const content = `
PAYSLIP - ${activePayslip.month}
================================

EARNINGS:
Basic Salary:        ₹${(activePayslip.gross * 0.5).toLocaleString('en-IN')}
HRA:                 ₹${(activePayslip.gross * 0.3).toLocaleString('en-IN')}
Special Allowance:   ₹${(activePayslip.gross * 0.15).toLocaleString('en-IN')}
Other Allowances:    ₹${(activePayslip.gross * 0.05).toLocaleString('en-IN')}
--------------------------------
Total Earnings:      ₹${activePayslip.gross.toLocaleString('en-IN')}

DEDUCTIONS:
PF (Employee):       ₹${(activePayslip.deduction * 0.5).toLocaleString('en-IN')}
Professional Tax:    ₹${(activePayslip.deduction * 0.15).toLocaleString('en-IN')}
TDS:                 ₹${(activePayslip.deduction * 0.35).toLocaleString('en-IN')}
--------------------------------
Total Deductions:    ₹${activePayslip.deduction.toLocaleString('en-IN')}

NET PAYABLE:         ₹${activePayslip.net.toLocaleString('en-IN')}

Payment Date: 1st of the month
Payment Mode: Bank Transfer
Bank Account: XXXX XXXX XXXX 1234
                  `;
                  
                  // Create blob and download
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Payslip_${activePayslip.month.replace(' ', '_')}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  const subject = `Payslip - ${activePayslip.month}`;
                  const body = `Please find attached my payslip for ${activePayslip.month}`;
                  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
