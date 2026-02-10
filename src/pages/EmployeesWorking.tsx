import { useState, useEffect } from 'react';
import { employeeAPI, Employee } from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Download, Edit, Trash2, Mail, Search, FileText, Users, CheckCircle, Clock, User, RefreshCw } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/utils/rbac';
import { downloadEmployeesPDF, downloadEmployeesCSV } from '@/utils/downloadUtils';
import { cn } from '@/lib/utils';

export const EmployeesWorkingPage = () => {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [updateKey, setUpdateKey] = useState(0); // Force re-render
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; employee: { id: string; name: string } | null }>({
    show: false,
    employee: null
  });
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    salary: '',
    location: '',
    status: 'active' as 'active' | 'probation' | 'onleave' | 'inactive',
  });

  const [renderError, setRenderError] = useState<Error | null>(null);

  // useEffect MUST be before any early returns!
  useEffect(() => {
    if (user) {
      loadEmployees();
    }
  }, [updateKey, user]); // Reload when updateKey changes

  if (!user) return null;

  const canAdd = hasPermission(user.role, 'canAddEmployee');
  const canEdit = hasPermission(user.role, 'canEditEmployee');
  const canDelete = hasPermission(user.role, 'canDeleteEmployee');
  const canExport = hasPermission(user.role, 'canExportData');

  const loadEmployees = async () => {
    try {
      console.log('🔄 loadEmployees called, updateKey:', updateKey);
      setLoading(true);
      const data = await employeeAPI.getAll();
      console.log('📦 Received from API:', data.length, 'employees');
      const validEmployees = data.filter(emp => emp && emp._id && emp.name);
      console.log('✅ Setting', validEmployees.length, 'valid employees');
      setEmployees(validEmployees);
    } catch (error: any) {
      console.error('❌ Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    console.log('🟢 ADD CLICKED!');
    setEditingEmployee(null);
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      department: 'Engineering',
      designation: '',
      salary: '',
      location: '',
      status: 'active',
    });
    setShowForm(true);
  };

  const handleEditClick = (employee: Employee) => {
    console.log('🟢 EDIT CLICKED!', employee);

    // Extra safety check
    if (!employee || !employee._id || !employee.name) {
      console.error('Invalid employee data for edit:', employee);
      toast.error('Cannot edit invalid employee data');
      return;
    }

    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId || '',
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department || 'Engineering',
      designation: employee.designation || '',
      salary: employee.salary?.toString() || '',
      location: employee.location || '',
      status: employee.status || 'active',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.employeeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const saveData = {
      ...formData,
      salary: Number(formData.salary),
    };

    const wasEditing = !!editingEmployee;
    const editingId = editingEmployee?._id;

    try {
      console.log('🔄 Starting API call...', wasEditing ? 'UPDATE' : 'CREATE');

      if (wasEditing && editingId) {
        const result = await employeeAPI.update(editingId, saveData);
        console.log('✅ API UPDATE SUCCESS:', result);
        toast.success('Employee updated!', { duration: 3000, icon: '✅' });
      } else {
        const result = await employeeAPI.create(saveData);
        console.log('✅ API CREATE SUCCESS:', result);
        toast.success('Employee added!', { duration: 3000, icon: '✅' });
      }

      // Close form AFTER successful API call
      setShowForm(false);
      setEditingEmployee(null);

      // Reload data immediately
      console.log('🔄 Reloading employees data...');
      await loadEmployees();

    } catch (error: any) {
      console.error('❌ API CALL FAILED:', error);
      toast.error(error.message || 'Failed to save employee');
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.employee) return;

    const employeeId = deleteModal.employee.id;

    try {
      await employeeAPI.delete(employeeId);

      // Close modal AFTER successful delete
      setDeleteModal({ show: false, employee: null });

      toast.success('Employee deleted!', { duration: 3000, icon: '✅' });

      // Reload data immediately
      console.log('🔄 Reloading employees after delete...');
      await loadEmployees();

    } catch (error: any) {
      console.error('Delete error:', error);
      setDeleteModal({ show: false, employee: null });
      toast.error(error.message || 'Failed to delete employee');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!id || !name) {
      console.warn('Invalid employee data for delete:', { id, name });
      toast.error('Cannot delete: Invalid employee data');
      return;
    }
    setDeleteModal({ show: true, employee: { id, name } });
  };

  const filteredEmployees = employees.filter((emp) => {
    // Safety check - skip invalid employees
    if (!emp || !emp._id || !emp.name) {
      return false;
    }

    try {
      const searchLower = searchQuery.toLowerCase();
      return (
        (emp.name || '').toLowerCase().includes(searchLower) ||
        (emp.email || '').toLowerCase().includes(searchLower) ||
        (emp.employeeId || '').toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error filtering employee:', error, emp);
      return false;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div
          onMouseEnter={() => setSidebarCollapsed(false)}
          onMouseLeave={() => setSidebarCollapsed(true)}
        >
          <Sidebar />
        </div>
        <div
          className={cn(
            "transition-all duration-300",
            sidebarCollapsed ? "ml-[80px]" : "ml-[280px]"
          )}
        >
          <Header />
          <main className="p-6">
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading employees...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
      >
        <Sidebar />
      </div>
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-[80px]" : "ml-[280px]"
        )}
      >
        <Header />
        <main className="p-6">
          <div className="max-w-[1400px] mx-auto relative">
            {/* Error Display */}
            {renderError && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-6 text-destructive">
                <h3 className="m-0 font-bold mb-2">Render Error Detected</h3>
                <p className="m-0 text-sm">{renderError.message}</p>
                <button
                  onClick={() => {
                    setRenderError(null);
                    window.location.reload();
                  }}
                  className="mt-3 px-4 py-2 bg-destructive text-destructive-foreground border-none rounded-md cursor-pointer text-sm hover:bg-destructive/90 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            )}

            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-1.5 text-foreground text-gradient">Employees</h1>
                  <p className="text-muted-foreground text-sm">
                    Manage your organization's workforce ({employees.length} employees)
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      console.log('🔄 Manual refresh clicked');
                      setUpdateKey(prev => prev + 1);
                    }}
                    className="px-4 py-2 border border-border rounded-lg bg-card text-card-foreground cursor-pointer text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                  {canExport && (
                    <>
                      <button
                        onClick={async () => {
                          try {
                            toast.loading('Generating PDF...', { id: 'emp-pdf' });
                            await downloadEmployeesPDF(filteredEmployees);
                            toast.success('Employee PDF downloaded!', { id: 'emp-pdf' });
                          } catch (error) {
                            toast.error('Failed to download PDF', { id: 'emp-pdf' });
                          }
                        }}
                        className="px-4 py-2 border border-border rounded-lg bg-card text-card-foreground cursor-pointer text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors shadow-sm"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            toast.loading('Generating CSV...', { id: 'emp-csv' });
                            await downloadEmployeesCSV(filteredEmployees);
                            toast.success('Employee CSV downloaded!', { id: 'emp-csv' });
                          } catch (error) {
                            toast.error('Failed to download CSV', { id: 'emp-csv' });
                          }
                        }}
                        className="px-4 py-2 border border-border rounded-lg bg-card text-card-foreground cursor-pointer text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        CSV
                      </button>
                    </>
                  )}
                  {canAdd && (
                    <button
                      onClick={handleAddClick}
                      className="px-4 py-2 border-none rounded-lg bg-primary text-primary-foreground cursor-pointer text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      Add Employee
                    </button>
                  )}
                  {!canAdd && !canExport && (
                    <div className="px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground font-medium">
                      View Only Mode
                    </div>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 opacity-90" />
                  <p className="text-sm font-medium opacity-90 m-0">Total Employees</p>
                </div>
                <p className="text-4xl font-bold m-0">{employees.length}</p>
                <p className="text-xs opacity-75 mt-2">Organization workforce</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 opacity-90" />
                  <p className="text-sm font-medium opacity-90 m-0">Active</p>
                </div>
                <p className="text-4xl font-bold m-0">
                  {employees.filter(e => e?.status === 'active').length}
                </p>
                <p className="text-xs opacity-75 mt-2">Currently working</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 opacity-90" />
                  <p className="text-sm font-medium opacity-90 m-0">On Probation</p>
                </div>
                <p className="text-4xl font-bold m-0">
                  {employees.filter(e => e?.status === 'probation').length}
                </p>
                <p className="text-xs opacity-75 mt-2">Trial period</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-6 h-6 opacity-90" />
                  <p className="text-sm font-medium opacity-90 m-0">On Leave</p>
                </div>
                <p className="text-4xl font-bold m-0">
                  {employees.filter(e => e?.status === 'onleave').length}
                </p>
                <p className="text-xs opacity-75 mt-2">Away from office</p>
              </div>
            </div>

            {/* Table */}
            <div key={`employees-table-${updateKey}`} className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-4 text-left font-semibold text-sm">Employee</th>
                      <th className="px-6 py-4 text-left font-semibold text-sm">Department</th>
                      <th className="px-6 py-4 text-left font-semibold text-sm">Designation</th>
                      <th className="px-6 py-4 text-left font-semibold text-sm">Location</th>
                      <th className="px-6 py-4 text-left font-semibold text-sm">Status</th>
                      <th className="px-6 py-4 text-right font-semibold text-sm">Salary</th>
                      <th className="px-6 py-4 text-right font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredEmployees.map((employee) => {
                      if (!employee || !employee._id || !employee.name?.toString().trim()) {
                        return null;
                      }

                      const statusStyles = {
                        active: "bg-emerald-500/10 text-emerald-500",
                        probation: "bg-amber-500/10 text-amber-500",
                        onleave: "bg-blue-500/10 text-blue-500",
                        inactive: "bg-rose-500/10 text-rose-500"
                      };

                      return (
                        <tr key={employee._id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{employee.name || 'Unknown Name'}</span>
                              <span className="text-xs text-muted-foreground mt-0.5">{employee.employeeId || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">{employee.department || 'Not Assigned'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{employee.designation || 'Staff'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{employee.location || 'Remote'}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                              statusStyles[employee.status] || statusStyles.active
                            )}>
                              {employee.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-sm text-foreground">
                            ₹{(employee.salary || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-end">
                              {canEdit && (
                                <button
                                  onClick={() => handleEditClick(employee)}
                                  className="p-2 bg-card text-card-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(employee.email).then(() => {
                                    toast.success(`Email copied: ${employee.email}`);
                                  });
                                }}
                                className="p-2 bg-card text-card-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                title="Copy Email"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(employee._id, employee.name)}
                                  className="p-2 bg-card text-destructive border border-border rounded-lg hover:bg-destructive/10 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredEmployees.length === 0 && (
                <div className="py-20 text-center">
                  <Users className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No employees found matching your search.' : 'No employees in the database.'}
                  </p>
                </div>
              )}
            </div>

            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-card text-card-foreground rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shadow-inner text-white">
                        {editingEmployee ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="m-0 text-white text-xl font-bold">
                          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                        </h3>
                        <p className="m-0 text-white/80 text-xs mt-0.5">Fill in the details below</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors border-none cursor-pointer"
                    >
                      <Plus className="w-5 h-5 rotate-45" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/80">Employee ID *</label>
                        <input type="text" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} required className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" placeholder="EMP001" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/80">Full Name *</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/80">Email *</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" placeholder="john@example.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/80">Phone</label>
                        <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" placeholder="+91 9876543210" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/80">Department *</label>
                        <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground cursor-pointer appearance-none">
                          <option value="Engineering">Engineering</option>
                          <option value="Human Resources">Human Resources</option>
                          <option value="Design">Design</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/80">Designation *</label>
                        <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} required className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" placeholder="Software Engineer" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/80">Monthly Salary (₹) *</label>
                        <input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} required className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" placeholder="50000" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground/80">Location</label>
                        <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" placeholder="New York" />
                      </div>
                      <div className="space-y-2 col-span-full">
                        <label className="text-sm font-semibold text-foreground/80">Status *</label>
                        <div className="flex flex-wrap gap-3">
                          {['active', 'probation', 'onleave', 'inactive'].map((status) => (
                            <label key={status} className={cn(
                              "flex-1 min-w-[120px] px-4 py-2.5 rounded-xl border border-border cursor-pointer flex items-center justify-center gap-2 transition-all",
                              formData.status === status
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                            )}>
                              <input
                                type="radio"
                                name="status"
                                value={status}
                                checked={formData.status === status}
                                onChange={() => setFormData({ ...formData, status: status as any })}
                                className="hidden"
                              />
                              <span className="capitalize text-sm font-medium">{status}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-10 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-6 py-2.5 border border-border rounded-xl bg-card text-card-foreground cursor-pointer text-sm font-bold hover:bg-muted transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-2.5 border-none rounded-xl bg-primary text-primary-foreground cursor-pointer text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 active:scale-95 transition-all"
                      >
                        {editingEmployee ? 'Update Employee' : 'Create Employee'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Advanced Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shadow-inner text-white">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="m-0 text-white text-xl font-bold">Delete Employee</h3>
                <p className="m-0 text-white/80 text-xs mt-0.5">Confirmation required</p>
              </div>
            </div>
            <div className="p-8">
              <p className="text-base leading-relaxed text-foreground/90">
                Are you sure you want to delete <strong>{deleteModal.employee?.name}</strong>? This action cannot be undone and all associated records will be permanently removed.
              </p>
            </div>
            <div className="p-5 bg-muted/30 flex justify-end gap-3 border-t border-border">
              <button
                onClick={() => setDeleteModal({ show: false, employee: null })}
                className="px-6 py-2.5 border border-border rounded-xl bg-card text-card-foreground cursor-pointer text-sm font-bold hover:bg-muted transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-8 py-2.5 bg-gradient-to-br from-rose-500 to-rose-700 text-white border-none rounded-xl cursor-pointer text-sm font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 active:scale-95 transition-all"
              >
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
