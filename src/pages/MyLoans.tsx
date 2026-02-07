import { motion } from 'framer-motion';
import {
  Wallet,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';

const loanDetails = {
  id: 'LN001',
  type: 'Personal Loan',
  amount: 50000,
  remainingAmount: 15000,
  emi: 5000,
  tenure: 10,
  remainingEmi: 3,
  startDate: '2023-08-01',
  status: 'active',
  interestRate: '0%',
  purpose: 'Personal needs',
};

const emiSchedule = [
  { month: 'August 2023', emi: 5000, principal: 5000, balance: 45000, status: 'paid' },
  { month: 'September 2023', emi: 5000, principal: 5000, balance: 40000, status: 'paid' },
  { month: 'October 2023', emi: 5000, principal: 5000, balance: 35000, status: 'paid' },
  { month: 'November 2023', emi: 5000, principal: 5000, balance: 30000, status: 'paid' },
  { month: 'December 2023', emi: 5000, principal: 5000, balance: 25000, status: 'paid' },
  { month: 'January 2024', emi: 5000, principal: 5000, balance: 20000, status: 'paid' },
  { month: 'February 2024', emi: 5000, principal: 5000, balance: 15000, status: 'paid' },
  { month: 'March 2024', emi: 5000, principal: 5000, balance: 10000, status: 'upcoming' },
  { month: 'April 2024', emi: 5000, principal: 5000, balance: 5000, status: 'upcoming' },
  { month: 'May 2024', emi: 5000, principal: 5000, balance: 0, status: 'upcoming' },
];

export const MyLoansPage = () => {
  const paidEMIs = emiSchedule.filter(e => e.status === 'paid').length;
  const progressPercentage = (paidEMIs / loanDetails.tenure) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Loans</h1>
        <p className="page-description">
          View your loan details and EMI schedule
        </p>
      </div>

      {/* Loan Summary Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary/10">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{loanDetails.type}</h2>
                  <Badge className="badge-info">
                    <Clock className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Loan ID: {loanDetails.id} • Started: {new Date(loanDetails.startDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">₹{loanDetails.amount.toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">₹{loanDetails.remainingAmount.toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground">Balance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly EMI</p>
                <p className="text-xl font-bold">₹{loanDetails.emi.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Tenure</p>
                <p className="text-xl font-bold">{loanDetails.tenure} months</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">EMIs Paid</p>
                <p className="text-xl font-bold">{paidEMIs} / {loanDetails.tenure}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-xl font-bold">{loanDetails.remainingEmi} EMIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Repayment Progress</CardTitle>
          <CardDescription>
            {progressPercentage.toFixed(0)}% of loan amount repaid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid: ₹{(loanDetails.amount - loanDetails.remainingAmount).toLocaleString('en-IN')}</span>
              <span className="font-medium">₹{loanDetails.amount.toLocaleString('en-IN')}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* EMI Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>EMI Schedule</CardTitle>
          <CardDescription>
            Monthly payment breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">EMI Amount</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emiSchedule.map((emi, index) => (
                <motion.tr
                  key={emi.month}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="table-row-hover"
                >
                  <TableCell className="font-medium">{emi.month}</TableCell>
                  <TableCell className="text-right">₹{emi.emi.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{emi.principal.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{emi.balance.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    {emi.status === 'paid' ? (
                      <Badge className="badge-success">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Paid
                      </Badge>
                    ) : (
                      <Badge className="badge-warning">
                        <Clock className="mr-1 h-3 w-3" />
                        Upcoming
                      </Badge>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
