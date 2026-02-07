import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  IndianRupee,
  CreditCard,
  Shield,
  Edit,
  Download,
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
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const employeeProfile = {
  id: 'EMP003',
  name: 'Amit Patel',
  email: 'amit@payzenix.com',
  phone: '+91 98765 43212',
  department: 'Engineering',
  designation: 'Senior Developer',
  location: 'Bangalore',
  joinDate: '2019-09-20',
  status: 'active',
  
  // Bank details
  bankName: 'HDFC Bank',
  accountNumber: '****4521',
  ifsc: 'HDFC0001234',
  
  // Statutory
  pan: 'ABCDE1234F',
  uan: '101234567890',
  esiNumber: '1234567890',
  
  // Salary
  basic: 45000,
  hra: 18000,
  specialAllowance: 12000,
  grossSalary: 75000,
};

export const ProfilePage = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-muted-foreground min-w-[100px]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-description">
            View your personal and employment details
          </p>
        </div>
        {user.role !== 'employee' && (
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {employeeProfile.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-4">{employeeProfile.name}</h2>
              <p className="text-muted-foreground">{employeeProfile.designation}</p>
              <Badge className="mt-2 badge-success">Active</Badge>
            </div>
            <Separator orientation="vertical" className="hidden md:block" />
            <div className="flex-1 grid md:grid-cols-2 gap-4">
              <InfoRow icon={Mail} label="Email" value={employeeProfile.email} />
              <InfoRow icon={Phone} label="Phone" value={employeeProfile.phone} />
              <InfoRow icon={Building2} label="Department" value={employeeProfile.department} />
              <InfoRow icon={MapPin} label="Location" value={employeeProfile.location} />
              <InfoRow icon={Calendar} label="Joined" value={new Date(employeeProfile.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
              <InfoRow icon={User} label="Employee ID" value={employeeProfile.id} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Bank Details
            </CardTitle>
            <CardDescription>Your salary account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Bank Name</span>
              <span className="font-medium">{employeeProfile.bankName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Account Number</span>
              <span className="font-medium">{employeeProfile.accountNumber}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">IFSC Code</span>
              <span className="font-medium">{employeeProfile.ifsc}</span>
            </div>
          </CardContent>
        </Card>

        {/* Statutory Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-info" />
              Statutory Details
            </CardTitle>
            <CardDescription>PF, ESI, and tax information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">PAN Number</span>
              <span className="font-medium">{employeeProfile.pan}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">UAN (PF)</span>
              <span className="font-medium">{employeeProfile.uan}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">ESI Number</span>
              <span className="font-medium">{employeeProfile.esiNumber}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-success" />
            Salary Structure
          </CardTitle>
          <CardDescription>Your current salary breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">Basic Salary</p>
              <p className="text-2xl font-bold">₹{employeeProfile.basic.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">HRA</p>
              <p className="text-2xl font-bold">₹{employeeProfile.hra.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">Special Allowance</p>
              <p className="text-2xl font-bold">₹{employeeProfile.specialAllowance.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 text-center">
              <p className="text-sm text-muted-foreground">Gross Salary</p>
              <p className="text-2xl font-bold text-primary">₹{employeeProfile.grossSalary.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            * For detailed salary breakdown, please check your latest payslip
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
