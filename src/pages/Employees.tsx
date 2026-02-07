import { useState, useEffect } from 'react';
import { employeeAPI, Employee } from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Download, Edit, Trash2, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SimpleEmployeeForm } from '@/components/SimpleEmployeeForm';

export const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    console.log('🟢 Employees page loaded');
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      console.log('🟢 Loading employees...');
      setLoading(true);
      const data = await employeeAPI.getAll();
      console.log('✅ Loaded employees:', data);
      setEmployees(data);
      toast.success(`Loaded ${data.length} employees!`);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    console.log('🟢 ADD EMPLOYEE CLICKED!');
    setEditingEmployee(null);
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    console.log('🟢 EDIT CLICKED!', employee);
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
    try {
      if (editingEmployee && editingEmployee._id) {
        await employeeAPI.update(editingEmployee._id, employeeData);
        toast.success('Employee updated!');
      } else {
        await employeeAPI.create(employeeData);
        toast.success('Employee added!');
      }
      await loadEmployees();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
      throw error;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await employeeAPI.delete(id);
      toast.success('Employee deleted!');
      await loadEmployees();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleExport = () => {
    console.log('� Export clicked');
    toast.success('Exporting employees...');
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>Loading employees from backend...</p>
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
            <p style={{ color: '#666' }}>Manage your organization's workforce ({employees.length} employees)</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleExport}
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
              Export
            </button>
            <button 
              onClick={handleAddEmployee}
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
                gap: '8px'
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Add Employee
            </button>
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder="Search by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>Total Employees</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{employees.length}</p>
        </div>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>Active</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>
            {employees.filter(e => e.status === 'active').length}
          </p>
        </div>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>On Probation</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
            {employees.filter(e => e.status === 'probation').length}
          </p>
        </div>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>On Leave</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
            {employees.filter(e => e.status === 'onleave').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Employee</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Department</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Designation</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Location</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Salary</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>
                  <div>
                    <p style={{ fontWeight: '500' }}>{employee.name}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>{employee.employeeId}</p>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>{employee.department}</td>
                <td style={{ padding: '12px' }}>{employee.designation}</td>
                <td style={{ padding: '12px' }}>{employee.location || 'N/A'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: employee.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: employee.status === 'active' ? '#166534' : '#991b1b'
                  }}>
                    {employee.status || 'active'}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>
                  ₹{employee.salary.toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleEditEmployee(employee)}
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
                    <button
                      onClick={() => window.location.href = `mailto:${employee.email}`}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Email"
                    >
                      <Mail style={{ width: '16px', height: '16px' }} />
                    </button>
                    <button
                      onClick={() => employee._id && handleDelete(employee._id, employee.name)}
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No employees found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
