import { motion } from 'framer-motion';
import {
  Building2,
  FileText,
  IndianRupee,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
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
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';

const complianceData = {
  pf: {
    name: 'Provident Fund (PF)',
    description: 'Employee Provident Fund contribution',
    rate: '12%',
    employer: 156780,
    employee: 156780,
    total: 313560,
    dueDate: '15th Feb 2024',
    status: 'pending',
    filedMonths: 11,
    totalMonths: 12,
  },
  esi: {
    name: 'ESI',
    description: 'Employee State Insurance',
    rate: '0.75% + 3.25%',
    employer: 23456,
    employee: 5400,
    total: 28856,
    dueDate: '15th Feb 2024',
    status: 'pending',
    filedMonths: 11,
    totalMonths: 12,
  },
  tds: {
    name: 'TDS',
    description: 'Tax Deducted at Source',
    rate: 'As per slab',
    employer: 0,
    employee: 98765,
    total: 98765,
    dueDate: '7th Feb 2024',
    status: 'due_soon',
    filedMonths: 10,
    totalMonths: 12,
  },
  pt: {
    name: 'Professional Tax',
    description: 'State Professional Tax',
    rate: '₹200/month',
    employer: 0,
    employee: 9600,
    total: 9600,
    dueDate: '20th Feb 2024',
    status: 'filed',
    filedMonths: 12,
    totalMonths: 12,
  },
};

const filingHistory = [
  { month: 'January 2024', pf: 'filed', esi: 'filed', tds: 'filed', pt: 'filed' },
  { month: 'December 2023', pf: 'filed', esi: 'filed', tds: 'filed', pt: 'filed' },
  { month: 'November 2023', pf: 'filed', esi: 'filed', tds: 'filed', pt: 'filed' },
  { month: 'October 2023', pf: 'filed', esi: 'filed', tds: 'filed', pt: 'filed' },
];

export const CompliancePage = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'filed':
        return <Badge className="badge-success"><CheckCircle className="mr-1 h-3 w-3" />Filed</Badge>;
      case 'pending':
        return <Badge className="badge-warning"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'due_soon':
        return <Badge className="badge-destructive"><AlertCircle className="mr-1 h-3 w-3" />Due Soon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Statutory Compliance</h1>
          <p className="page-description">
            Manage PF, ESI, TDS, and Professional Tax filings
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download All Challans
        </Button>
      </div>

      {/* Compliance Score */}
      <Card className="border-l-4 border-l-success">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Compliance Score</h2>
              <p className="text-muted-foreground">FY 2023-24 (April - March)</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-success">98%</p>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              <div className="h-16 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold">44/45</p>
                <p className="text-sm text-muted-foreground">Filings Complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(complianceData).map(([key, data], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {data.name}
                    </CardTitle>
                    <CardDescription>{data.description}</CardDescription>
                  </div>
                  {getStatusBadge(data.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Employer</p>
                    <p className="text-lg font-bold">₹{data.employer.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Employee</p>
                    <p className="text-lg font-bold">₹{data.employee.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-primary">₹{data.total.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Filings Completed</span>
                    <span className="font-medium">{data.filedMonths}/{data.totalMonths} months</span>
                  </div>
                  <Progress value={(data.filedMonths / data.totalMonths) * 100} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Due:</span>
                    <span className={cn(
                      'font-medium',
                      data.status === 'due_soon' && 'text-destructive'
                    )}>
                      {data.dueDate}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Challan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filing History */}
      <Card>
        <CardHeader>
          <CardTitle>Filing History</CardTitle>
          <CardDescription>Track your compliance filings across all categories</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-center">PF</TableHead>
                <TableHead className="text-center">ESI</TableHead>
                <TableHead className="text-center">TDS</TableHead>
                <TableHead className="text-center">PT</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filingHistory.map((row, index) => (
                <motion.tr
                  key={row.month}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-row-hover"
                >
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(row.pf)}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(row.esi)}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(row.tds)}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(row.pt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'EPFO Portal', url: 'https://www.epfindia.gov.in', icon: Building2 },
          { label: 'ESIC Portal', url: 'https://www.esic.nic.in', icon: Building2 },
          { label: 'Income Tax Portal', url: 'https://www.incometax.gov.in', icon: IndianRupee },
          { label: 'GST Portal', url: 'https://www.gst.gov.in', icon: FileText },
        ].map((link) => (
          <Card key={link.label} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <link.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{link.label}</span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
