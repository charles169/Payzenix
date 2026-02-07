import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Wallet,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';
import { loanAPI, employeeAPI, Loan, Employee } from '@/services/api';
import { SimpleLoanForm } from '@/components/SimpleLoanForm';

export const LoansPage = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansData, employeesData] = await Promise.all([
        loanAPI.getAll(),
        employeeAPI.getAll()
      ]);
      setLoans(loansData);
      setEmployees(employeesData);
      toast.success('Loans loaded from backend!');
    } catch (error: any) {
      console.error('Failed to load loans:', error);
      toast.error(error.message || 'Failed to load loans from backend');
      setLoans([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoan = () => {
    console.log('Add Loan clicked!');
    setEditingLoan(null);
    setDialogOpen(true);
  };

  const handleSaveLoan = async (loanData: Partial<Loan>) => {
    try {
      await loanAPI.create(loanData);
      toast.success('Loan created successfully!');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save loan');
      throw error;
    }
  };

  const handleApproveLoan = async (id: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this loan?`)) return;
    try {
      await loanAPI.approve(id, status);
      toast.success(`Loan ${status} successfully!`);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} loan`);
    }
  };

  const getEmployeeName = (loan: Loan) => {
    if (typeof loan.employee === 'string') {
      const emp = employees.find(e => e._id === loan.employee);
      return emp ? emp.name : loan.employee;
    }
    return (loan.employee as any)?.name || 'Unknown';
  };

  const loanStats = {
    totalDisbursed: loans.reduce((sum, loan) => sum + loan.amount, 0),
    totalRecovered: loans.reduce((sum, loan) => sum + (loan.paidAmount || 0), 0),
    activeLoans: loans.filter(l => l.status === 'active').length,
    completedLoans: loans.filter(l => l.status === 'completed').length,
  };

  const filteredLoans = loans.filter((loan) => {
    const employeeName = getEmployeeName(loan);
    const loanId = loan._id || '';
    const matchesSearch =
      employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loanId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading loans from backend...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="badge-info"><Clock className="mr-1 h-3 w-3" />Active</Badge>;
      case 'completed':
        return <Badge className="badge-success"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
      case 'pending':
        return <Badge className="badge-warning"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge className="badge-success"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge className="badge-destructive"><AlertCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <SimpleLoanForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        loan={editingLoan}
        onSave={handleSaveLoan}
        employees={employees.map(e => ({ _id: e._id!, name: e.name, employeeId: e.employeeId }))}
      />

      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Loans & Advances</h1>
          <p className="page-description">
            Manage employee loans and salary advances
          </p>
        </div>
        <Button onClick={handleAddLoan}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Loan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Disbursed"
          value={`₹${(loanStats.totalDisbursed / 1000).toFixed(0)}K`}
          subtitle="All time"
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Total Recovered"
          value={`₹${(loanStats.totalRecovered / 1000).toFixed(0)}K`}
          subtitle="Via EMI deductions"
          icon={IndianRupee}
          variant="success"
        />
        <StatCard
          title="Active Loans"
          value={loanStats.activeLoans}
          subtitle="Currently running"
          icon={Clock}
          variant="info"
        />
        <StatCard
          title="Completed Loans"
          value={loanStats.completedLoans}
          subtitle="Fully repaid"
          icon={CheckCircle}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee name or loan ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button variant="outline" onClick={() => toast.success('Export coming soon!')}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Records</CardTitle>
          <CardDescription>
            View and manage all employee loans and advances
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">EMI</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan, index) => {
                const employeeName = getEmployeeName(loan);
                const loanId = loan._id || 'N/A';
                const paidAmount = loan.paidAmount || 0;
                const progress = loan.amount > 0 ? ((paidAmount / loan.amount) * 100) : 0;
                const remainingEMIs = Math.ceil(loan.remainingAmount / loan.emiAmount);
                
                return (
                  <motion.tr
                    key={loanId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row-hover"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{employeeName}</p>
                          <p className="text-xs text-muted-foreground">{loanId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{loan.loanType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">₹{loan.amount.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">
                          Balance: ₹{loan.remainingAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">₹{loan.emiAmount.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">
                          {remainingEMIs} EMIs left
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{Math.floor(progress)}%</span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {loan.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => loan._id && handleApproveLoan(loan._id, 'approved')}
                              style={{ background: '#10b981', color: 'white', padding: '4px 8px', fontSize: '12px' }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loan._id && handleApproveLoan(loan._id, 'rejected')}
                              style={{ color: '#dc2626', borderColor: '#dc2626', padding: '4px 8px', fontSize: '12px' }}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {loan.status !== 'pending' && (
                          <Button variant="ghost" size="icon" onClick={() => toast.success(`Viewing loan ${loanId}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
          {filteredLoans.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No loans found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
