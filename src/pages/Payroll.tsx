import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Play,
  Lock,
  Unlock,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  IndianRupee,
  Users,
  FileText,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/ui/stat-card';
import { useAuthStore, hasPermission } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const months = [
  'January 2024',
  'February 2024',
  'March 2024',
  'April 2024',
];

const payrollData = {
  month: 'February 2024',
  status: 'draft',
  totalEmployees: 48,
  processedEmployees: 0,
  grossSalary: 2456780,
  totalDeductions: 345890,
  netPayable: 2110890,
  pfContribution: 156780,
  esiContribution: 23456,
  tdsDeduction: 98765,
  ptDeduction: 9600,
};

const employeeSalaries = [
  { id: 'EMP001', name: 'Rajesh Kumar', department: 'Engineering', gross: 85000, deductions: 12450, net: 72550, status: 'pending' },
  { id: 'EMP002', name: 'Priya Sharma', department: 'Human Resources', gross: 72000, deductions: 10560, net: 61440, status: 'pending' },
  { id: 'EMP003', name: 'Amit Patel', department: 'Engineering', gross: 125000, deductions: 18375, net: 106625, status: 'pending' },
  { id: 'EMP004', name: 'Sneha Reddy', department: 'Design', gross: 68000, deductions: 9976, net: 58024, status: 'pending' },
  { id: 'EMP005', name: 'Vikram Singh', department: 'Sales', gross: 45000, deductions: 6600, net: 38400, status: 'pending' },
];

export const PayrollPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('February 2024');
  const { user } = useAuthStore();

  const canLock = user && hasPermission(user.role, 'canLockPayroll');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="badge-success"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
      case 'processing':
        return <Badge className="badge-warning"><Clock className="mr-1 h-3 w-3" />Processing</Badge>;
      case 'draft':
        return <Badge className="badge-info"><FileText className="mr-1 h-3 w-3" />Draft</Badge>;
      case 'locked':
        return <Badge variant="secondary"><Lock className="mr-1 h-3 w-3" />Locked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Payroll Processing</h1>
          <p className="page-description">
            Run and manage monthly payroll for your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payroll Status Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary/10">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{selectedMonth} Payroll</h2>
                  {getStatusBadge(payrollData.status)}
                </div>
                <p className="text-muted-foreground mt-1">
                  {payrollData.totalEmployees} employees • Last updated: Today at 10:30 AM
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                <Play className="mr-2 h-4 w-4" />
                Run Payroll
              </Button>
              {canLock && (
                <Button>
                  <Lock className="mr-2 h-4 w-4" />
                  Lock & Finalize
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gross Salary"
          value={`₹${(payrollData.grossSalary / 100000).toFixed(2)}L`}
          subtitle={`${payrollData.totalEmployees} employees`}
          icon={IndianRupee}
          variant="primary"
        />
        <StatCard
          title="Total Deductions"
          value={`₹${(payrollData.totalDeductions / 1000).toFixed(1)}K`}
          subtitle="PF + ESI + TDS + PT"
          icon={Calculator}
          variant="warning"
        />
        <StatCard
          title="Net Payable"
          value={`₹${(payrollData.netPayable / 100000).toFixed(2)}L`}
          subtitle="After all deductions"
          icon={IndianRupee}
          variant="success"
        />
        <StatCard
          title="Compliance"
          value="4 Filings"
          subtitle="PF, ESI, TDS, PT"
          icon={FileText}
          variant="info"
        />
      </div>

      {/* Deductions Breakdown */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'PF Contribution', value: payrollData.pfContribution, color: 'bg-primary' },
          { label: 'ESI Contribution', value: payrollData.esiContribution, color: 'bg-info' },
          { label: 'TDS Deduction', value: payrollData.tdsDeduction, color: 'bg-warning' },
          { label: 'Professional Tax', value: payrollData.ptDeduction, color: 'bg-success' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={cn('w-3 h-3 rounded-full', item.color)} />
              </div>
              <p className="text-2xl font-bold">₹{item.value.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Salary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Salary Breakdown</CardTitle>
          <CardDescription>
            Review individual salary calculations before finalizing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeSalaries.map((emp, index) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-row-hover"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{emp.gross.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    -₹{emp.deductions.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    ₹{emp.net.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Processing Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Steps</CardTitle>
          <CardDescription>Complete all steps to finalize the payroll</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Calculate Salaries', description: 'Auto-calculate based on attendance and components', status: 'completed' },
              { step: 2, title: 'Apply Deductions', description: 'PF, ESI, TDS, PT, and loan EMIs', status: 'completed' },
              { step: 3, title: 'Review & Verify', description: 'Check individual calculations for accuracy', status: 'current' },
              { step: 4, title: 'Lock Payroll', description: 'Lock to prevent further changes', status: 'pending' },
              { step: 5, title: 'Generate Payslips', description: 'Create and distribute payslips', status: 'pending' },
              { step: 6, title: 'Process Payout', description: 'Transfer salaries to employee accounts', status: 'pending' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg transition-colors',
                  item.status === 'current' && 'bg-primary/5 border border-primary/20',
                  item.status === 'completed' && 'bg-success-soft',
                  item.status === 'pending' && 'bg-muted/50'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                  item.status === 'completed' && 'bg-success text-success-foreground',
                  item.status === 'current' && 'bg-primary text-primary-foreground',
                  item.status === 'pending' && 'bg-muted text-muted-foreground'
                )}>
                  {item.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : item.step}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    'font-medium',
                    item.status === 'pending' && 'text-muted-foreground'
                  )}>
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {item.status === 'current' && (
                  <Button size="sm">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
