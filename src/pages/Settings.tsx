import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Building2,
  Users,
  IndianRupee,
  FileText,
  Shield,
  Bell,
  Palette,
  Save,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const salaryComponents = [
  { id: 1, name: 'Basic Salary', type: 'earning', calculation: 'Fixed', taxable: true, active: true },
  { id: 2, name: 'HRA', type: 'earning', calculation: '40% of Basic', taxable: true, active: true },
  { id: 3, name: 'Special Allowance', type: 'earning', calculation: 'Fixed', taxable: true, active: true },
  { id: 4, name: 'Conveyance Allowance', type: 'earning', calculation: 'Fixed', taxable: false, active: true },
  { id: 5, name: 'Medical Allowance', type: 'earning', calculation: 'Fixed', taxable: false, active: true },
  { id: 6, name: 'PF Deduction', type: 'deduction', calculation: '12% of Basic', taxable: false, active: true },
  { id: 7, name: 'Professional Tax', type: 'deduction', calculation: 'State Rules', taxable: false, active: true },
  { id: 8, name: 'TDS', type: 'deduction', calculation: 'As per slab', taxable: false, active: true },
];

export const SettingsPage = () => {
  const { user } = useAuthStore();
  const [companyName, setCompanyName] = useState('PayZenix Technologies Pvt. Ltd.');
  const [pfEnabled, setPfEnabled] = useState(true);
  const [esiEnabled, setEsiEnabled] = useState(true);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page. Only administrators can view settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">
          Manage company settings, salary components, and policies
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-4 md:inline-flex">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            <span className="hidden sm:inline">Salary</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic company details used across the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNo">Registration Number</Label>
                  <Input id="registrationNo" defaultValue="CIN: U72200KA2020PTC123456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">Company PAN</Label>
                  <Input id="pan" defaultValue="ABCDE1234F" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tan">TAN Number</Label>
                  <Input id="tan" defaultValue="BLRA12345F" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Registered Address</Label>
                  <Input id="address" defaultValue="123, Tech Park, Whitefield, Bangalore - 560066" />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statutory Details</CardTitle>
              <CardDescription>
                PF, ESI, and other statutory registration details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pfNo">PF Registration Number</Label>
                  <Input id="pfNo" defaultValue="BGBNG1234567000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esiNo">ESI Registration Number</Label>
                  <Input id="esiNo" defaultValue="12345678901234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ptNo">PT Registration Number</Label>
                  <Input id="ptNo" defaultValue="PTKA/BLR/12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNo">GST Number</Label>
                  <Input id="gstNo" defaultValue="29ABCDE1234F1Z5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Components */}
        <TabsContent value="salary" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Salary Components</CardTitle>
                <CardDescription>
                  Configure earnings and deductions for salary calculation
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Component
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Taxable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryComponents.map((component, index) => (
                    <motion.tr
                      key={component.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="table-row-hover"
                    >
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>
                        <Badge className={component.type === 'earning' ? 'badge-success' : 'badge-destructive'}>
                          {component.type === 'earning' ? 'Earning' : 'Deduction'}
                        </Badge>
                      </TableCell>
                      <TableCell>{component.calculation}</TableCell>
                      <TableCell>
                        {component.taxable ? (
                          <Badge variant="outline">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch checked={component.active} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Settings */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Provident Fund (PF)
                </CardTitle>
                <CardDescription>
                  Configure PF contribution settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pf-enabled">Enable PF Deduction</Label>
                  <Switch id="pf-enabled" checked={pfEnabled} onCheckedChange={setPfEnabled} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-rate">Employee Contribution Rate</Label>
                  <Input id="pf-rate" defaultValue="12%" disabled={!pfEnabled} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-employer">Employer Contribution Rate</Label>
                  <Input id="pf-employer" defaultValue="12%" disabled={!pfEnabled} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-limit">Wage Ceiling Limit</Label>
                  <Input id="pf-limit" defaultValue="₹15,000" disabled={!pfEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-info" />
                  ESI (Employee State Insurance)
                </CardTitle>
                <CardDescription>
                  Configure ESI contribution settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="esi-enabled">Enable ESI Deduction</Label>
                  <Switch id="esi-enabled" checked={esiEnabled} onCheckedChange={setEsiEnabled} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esi-employee">Employee Contribution</Label>
                  <Input id="esi-employee" defaultValue="0.75%" disabled={!esiEnabled} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esi-employer">Employer Contribution</Label>
                  <Input id="esi-employer" defaultValue="3.25%" disabled={!esiEnabled} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esi-limit">Gross Salary Limit</Label>
                  <Input id="esi-limit" defaultValue="₹21,000" disabled={!esiEnabled} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when to send email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Payroll processed notification', description: 'Send email when monthly payroll is processed', enabled: true },
                { label: 'Payslip available', description: 'Notify employees when their payslip is generated', enabled: true },
                { label: 'Compliance due reminders', description: 'Send reminders before compliance filing deadlines', enabled: true },
                { label: 'New employee onboarded', description: 'Notify HR team when a new employee is added', enabled: false },
                { label: 'Loan application updates', description: 'Notify employees about loan application status', enabled: true },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={item.enabled} />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
