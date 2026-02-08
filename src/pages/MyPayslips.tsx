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

            {/* PDF */}
            <div className="flex-1 px-3">
              <iframe
                src="/sample-payslip.pdf"
                className="w-full h-full rounded-md border"
              />
            </div>

            {/* Actions */}
            <div className="p-3 border-t flex gap-2">
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button variant="outline" size="icon">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
