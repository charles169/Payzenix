import { useState, useEffect } from 'react';
import { employeeAPI, Employee } from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Download, Edit, Trash2, Mail, Search, FileText } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/utils/rbac';
import { downloadEmployeesPDF, downloadEmployeesCSV } from '@/utils/downloadUtils';

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
          style={{ 
            marginLeft: sidebarCollapsed ? '80px' : '280px',
            transition: 'margin-left 0.3s ease-in-out'
          }}
        >
          <Header />
          <main className="p-6">
            <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>
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
        style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '280px',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <Header />
        <main className="p-6 animate-fadeIn">
          <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            {/* Error Display */}
            {renderError && (
              <div style={{
                padding: '16px',
                background: '#fee2e2',
                border: '1px solid #dc2626',
                borderRadius: '8px',
                marginBottom: '20px',
                color: '#991b1b'
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Render Error Detected</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>{renderError.message}</p>
                <button
                  onClick={() => {
                    setRenderError(null);
                    window.location.reload();
                  }}
                  style={{
                    marginTop: '12px',
                    padding: '8px 16px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Reload Page
                </button>
              </div>
            )}
            
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Employees</h1>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    Manage your organization's workforce ({employees.length} employees)
                  </p>
                  {/* TEST BUTTON - Remove after testing */}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      console.log('🔄 Manual refresh clicked');
                      setUpdateKey(prev => prev + 1);
                    }}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    🔄 Refresh Data
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
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <FileText style={{ width: '16px', height: '16px' }} />
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
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Download style={{ width: '16px', height: '16px' }} />
                        CSV
                      </button>
                    </>
                  )}
                  {canAdd && (
                    <button
                      onClick={handleAddClick}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        background: '#4f46e5',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500'
                      }}
                    >
                      <Plus style={{ width: '16px', height: '16px' }} />
                      Add Employee
                    </button>
                  )}
                  {!canAdd && !canExport && (
                    <div style={{
                      padding: '8px 16px',
                      background: '#f3f4f6',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      View Only Mode
                    </div>
                  )}
                </div>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', maxWidth: '400px' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#999' }} />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div className="stat-card animate-slideUp stagger-1" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Total Employees</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{employees.length}</p>
              </div>
              <div className="stat-card animate-slideUp stagger-2" style={{ padding: '20px', background: '#dcfce7', borderRadius: '8px', border: '1px solid #86efac' }}>
                <p style={{ color: '#166534', fontSize: '14px', marginBottom: '8px' }}>Active</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#166534', margin: 0 }}>
                  {employees.filter(e => e?.status === 'active').length}
                </p>
              </div>
              <div className="stat-card animate-slideUp stagger-3" style={{ padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                <p style={{ color: '#92400e', fontSize: '14px', marginBottom: '8px' }}>On Probation</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
                  {employees.filter(e => e?.status === 'probation').length}
                </p>
              </div>
              <div className="stat-card animate-slideUp stagger-4" style={{ padding: '20px', background: '#dbeafe', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                <p style={{ color: '#1e40af', fontSize: '14px', marginBottom: '8px' }}>On Leave</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>
                  {employees.filter(e => e?.status === 'onleave').length}
                </p>
              </div>
            </div>

            {/* Table */}
            <div key={`employees-table-${updateKey}`} className="animate-slideUp" style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Employee</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Department</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Designation</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Location</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Salary</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => {
                    // Extra safety check
                    if (!employee || !employee._id || !employee.name) {
                      console.warn('Skipping invalid employee:', employee);
                      return null;
                    }
                    
                    return (
                    <tr key={employee._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <p style={{ fontWeight: '500', margin: 0, marginBottom: '4px' }}>{employee.name}</p>
                          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{employee.employeeId || 'N/A'}</p>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{employee.department || 'N/A'}</td>
                      <td style={{ padding: '12px 16px' }}>{employee.designation || 'N/A'}</td>
                      <td style={{ padding: '12px 16px' }}>{employee.location || 'N/A'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: employee.status === 'active' ? '#dcfce7' : employee.status === 'probation' ? '#fef3c7' : employee.status === 'onleave' ? '#dbeafe' : '#fee2e2',
                          color: employee.status === 'active' ? '#166534' : employee.status === 'probation' ? '#92400e' : employee.status === 'onleave' ? '#1e40af' : '#991b1b'
                        }}>
                          {employee.status || 'active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>
                        ₹{(employee.salary || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {canEdit && (
                            <button
                              onClick={() => handleEditClick(employee)}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                background: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Edit"
                            >
                              <Edit style={{ width: '16px', height: '16px' }} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // Copy email to clipboard
                              navigator.clipboard.writeText(employee.email).then(() => {
                                toast.success(`Email copied: ${employee.email}`);
                              }).catch(() => {
                                // Fallback: show email in alert
                                alert(`Employee Email: ${employee.email}\n\nClick OK to copy manually.`);
                              });
                            }}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              background: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Copy Email"
                          >
                            <Mail style={{ width: '16px', height: '16px' }} />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => {
                                if (!employee || !employee._id || !employee.name) {
                                  console.error('Cannot delete: Invalid employee data', employee);
                                  toast.error('Cannot delete: Invalid employee data');
                                  return;
                                }
                                handleDelete(employee._id, employee.name);
                              }}
                              style={{
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                background: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#dc2626'
                              }}
                              title="Delete"
                            >
                              <Trash2 style={{ width: '16px', height: '16px' }} />
                            </button>
                          )}
                          {!canEdit && !canDelete && (
                            <span style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              color: '#666',
                              fontStyle: 'italic'
                            }}>
                              View Only
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  }).filter(Boolean)}
                </tbody>
              </table>

              {filteredEmployees.length === 0 && (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                    {searchQuery ? 'No employees found matching your search.' : 'No employees in the database.'}
                  </p>
                </div>
              )}
            </div>

            {/* Form Modal */}
            {showForm && (
              <div className="modal-backdrop" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: '20px'
              }}>
                <div className="modal-content animate-zoomIn" style={{
                  background: 'white',
                  borderRadius: '12px',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  padding: '30px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                  </h2>

                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Employee ID *</label>
                        <input type="text" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Full Name *</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email *</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Phone</label>
                        <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Department *</label>
                        <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
                          <option value="Engineering">Engineering</option>
                          <option value="Human Resources">Human Resources</option>
                          <option value="Design">Design</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Designation *</label>
                        <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Monthly Salary (₹) *</label>
                        <input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Location</label>
                        <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Status *</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
                          <option value="active">Active</option>
                          <option value="probation">Probation</option>
                          <option value="onleave">On Leave</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '14px' }}>
                        Cancel
                      </button>
                      <button type="submit" style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#4f46e5', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                        {editingEmployee ? 'Update Employee' : 'Add Employee'}
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
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="modal-content animate-zoomIn" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            minWidth: '400px',
            maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Delete Employee
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Are you sure you want to delete <strong>{deleteModal.employee?.name}</strong>? This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteModal({ show: false, employee: null })}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#dc2626',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
