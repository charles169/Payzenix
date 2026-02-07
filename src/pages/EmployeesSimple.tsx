import { useState, useEffect } from 'react';
import { employeeAPI, Employee } from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Download, Edit, Trash2, Mail, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleEmployeeForm } from '@/components/SimpleEmployeeForm';

export const EmployeesSimplePage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll();
      setEmployees(data);
      toast.success(`Loaded ${data.length} employees from backend!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    console.log('Add Employee clicked!');
    setEditingEmployee(null);
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    console.log('Edit employee:', employee);
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
    try {
      if (editingEmployee && editingEmployee._id) {
        await employeeAPI.update(editingEmployee._id, employeeData);
        toast.success('Employee updated successfully!');
      } else {
        await employeeAPI.create(employeeData);
        toast.success('Employee added successfully!');
      }
      await loadEmployees();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save employee');
      throw error;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await employeeAPI.delete(id);
      toast.success('Employee deleted successfully!');
      await loadEmployees();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete employee');
    }
  };

  const handleExport = () => {
    console.log('Export clicked!');
    toast.success('Exporting employees data...');
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px' }}>Loading employees from backend...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      <SimpleEmployeeForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        employee={editingEmployee}
        onSave={handleSaveEmployee}
      />

      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Employees</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Manage your organization's workforce ({employees.length} employees)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleAddEmployee}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#999' }} />
          <Input
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Total Employees</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{employees.length}</p>
        </div>
        <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '8px', border: '1px solid #86efac' }}>
          <p style={{ color: '#166534', fontSize: '14px', marginBottom: '8px' }}>Active</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#166534', margin: 0 }}>
            {employees.filter(e => e.status === 'active').length}
          </p>
        </div>
        <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
          <p style={{ color: '#92400e', fontSize: '14px', marginBottom: '8px' }}>On Probation</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
            {employees.filter(e => e.status === 'probation').length}
          </p>
        </div>
        <div style={{ padding: '20px', background: '#dbeafe', borderRadius: '8px', border: '1px solid #93c5fd' }}>
          <p style={{ color: '#1e40af', fontSize: '14px', marginBottom: '8px' }}>On Leave</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>
            {employees.filter(e => e.status === 'onleave').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
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
            {filteredEmployees.map((employee) => (
              <tr key={employee._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div>
                    <p style={{ fontWeight: '500', margin: 0, marginBottom: '4px' }}>{employee.name}</p>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{employee.employeeId}</p>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>{employee.department}</td>
                <td style={{ padding: '12px 16px' }}>{employee.designation}</td>
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
                  ₹{employee.salary.toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditEmployee(employee)}
                      title="Edit Employee"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `mailto:${employee.email}`}
                      title="Send Email"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => employee._id && handleDelete(employee._id, employee.name)}
                      title="Delete Employee"
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
              {searchQuery ? 'No employees found matching your search.' : 'No employees in the database.'}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddEmployee} style={{ marginTop: '20px' }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Employee
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
