import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Users,
  IndianRupee,
  Calendar,
  FileCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Download,
  Building2,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Mock data
const recentPayrolls = [
  { id: 1, month: 'January 2024', employees: 48, amount: '₹24,56,780', status: 'completed' },
  { id: 2, month: 'December 2023', employees: 46, amount: '₹23,89,450', status: 'completed' },
  { id: 3, month: 'November 2023', employees: 45, amount: '₹23,12,300', status: 'completed' },
];

const pendingActions = [
  { id: 1, title: 'Process February payroll', dueIn: '3 days', priority: 'high' },
  { id: 2, title: 'Submit PF challan', dueIn: '5 days', priority: 'medium' },
  { id: 3, title: 'Review new employee documents', dueIn: '1 week', priority: 'low' },
];

const employeeStats = {
  total: 52,
  active: 48,
  onLeave: 3,
  newJoinees: 5,
};

export const DashboardPage = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isHR = user.role === 'hr';
  const isEmployee = user.role === 'employee';

  // Employee dashboard view
  if (isEmployee) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="page-description">
            Here's an overview of your salary and benefits
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Net Salary (This Month)"
            value="₹52,450"
            subtitle="Credited on 1st Feb"
            icon={IndianRupee}
            variant="primary"
          />
          <StatCard
            title="PF Balance"
            value="₹1,24,560"
            subtitle="As of Jan 2024"
            icon={Building2}
            variant="info"
          />
          <StatCard
            title="Active Loan"
            value="₹15,000"
            subtitle="EMI: ₹5,000/month"
            icon={Wallet}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Salary Breakdown</CardTitle>
              <CardDescription>January 2024</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { label: 'Basic Salary', value: '₹35,000', type: 'earning' },
                  { label: 'HRA', value: '₹14,000', type: 'earning' },
                  { label: 'Special Allowance', value: '₹8,500', type: 'earning' },
                  { label: 'PF Deduction', value: '-₹4,200', type: 'deduction' },
                  { label: 'Professional Tax', value: '-₹200', type: 'deduction' },
                  { label: 'Loan EMI', value: '-₹5,000', type: 'deduction' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={cn(
                      'font-medium',
                      item.type === 'deduction' ? 'text-destructive' : 'text-foreground'
                    )}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-semibold">Net Pay</span>
                <span className="text-xl font-bold text-primary">₹52,450</span>
              </div>
              <Button className="w-full mt-4" onClick={() => {
                toast.success('Downloading payslip...');
                console.log('Download Payslip button clicked');
              }}>
                <Download className="mr-2 h-4 w-4" />
                Download Payslip
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>Personal Loan - Active</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium">₹35,000 / ₹50,000</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Monthly EMI</p>
                  <p className="text-xl font-bold">₹5,000</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-xl font-bold">₹15,000</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">EMIs Paid</p>
                  <p className="text-xl font-bold">7 / 10</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Next EMI</p>
                  <p className="text-xl font-bold">1st Feb</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin/HR dashboard view
  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Welcome back, {user.name}. Here's what's happening today.
          </p>
        </div>
        <Button onClick={() => {
          toast.info('Payroll processing feature coming soon!');
          console.log('Run Payroll button clicked');
        }}>
          <Calendar className="mr-2 h-4 w-4" />
          Run Payroll
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={employeeStats.total}
          subtitle={`${employeeStats.active} active`}
          icon={Users}
          trend={{ value: 8.2, label: 'vs last month' }}
        />
        <StatCard
          title="Payroll This Month"
          value="₹24.5L"
          subtitle="48 employees"
          icon={IndianRupee}
          variant="primary"
        />
        <StatCard
          title="Pending Approvals"
          value="5"
          subtitle="Requires attention"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Compliance Score"
          value="98%"
          subtitle="All filings up to date"
          icon={FileCheck}
          variant="success"
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Payroll */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Payroll Runs</CardTitle>
              <CardDescription>Last 3 months payroll summary</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              toast.info('Viewing all payrolls...');
              console.log('View All button clicked');
            }}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayrolls.map((payroll) => (
                  <TableRow key={payroll.id} className="table-row-hover">
                    <TableCell className="font-medium">{payroll.month}</TableCell>
                    <TableCell>{payroll.employees}</TableCell>
                    <TableCell>{payroll.amount}</TableCell>
                    <TableCell>
                      <Badge className="badge-success">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className={cn(
                  'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                  action.priority === 'high' ? 'bg-destructive' :
                  action.priority === 'medium' ? 'bg-warning' : 'bg-success'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{action.title}</p>
                  <p className="text-xs text-muted-foreground">Due in {action.dueIn}</p>
                </div>
              </motion.div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => {
              toast.info('Viewing all tasks...');
              console.log('View All Tasks button clicked');
            }}>
              View All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Employee Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{employeeStats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">On Leave</p>
              <p className="text-2xl font-bold">{employeeStats.onLeave}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Joinees</p>
              <p className="text-2xl font-bold">{employeeStats.newJoinees}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-info/10">
              <AlertCircle className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Probation</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
