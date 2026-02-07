const API_BASE_URL = 'http://localhost:3001/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'employee';
  employeeId?: string;
  token?: string;
}

export interface Employee {
  _id?: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  salary: number;
  location?: string;
  status?: 'active' | 'probation' | 'onleave' | 'inactive';
  joinDate?: Date;
}

export interface Loan {
  _id?: string;
  employee: string;
  loanType: 'personal' | 'advance' | 'emergency';
  amount: number;
  interestRate?: number;
  tenure: number;
  emiAmount: number;
  startDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  paidAmount?: number;
  remainingAmount: number;
  reason?: string;
}

export interface Payroll {
  _id?: string;
  employee: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: {
    hra: number;
    transport: number;
    medical: number;
    other: number;
  };
  deductions: {
    pf: number;
    esi: number;
    tax: number;
    other: number;
  };
  grossSalary: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  paymentDate?: Date;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<User> => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  register: async (userData: Partial<User> & { password: string }): Promise<User> => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  getMe: async (): Promise<User> => {
    return apiRequest('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// Employee API
export const employeeAPI = {
  getAll: async (): Promise<Employee[]> => {
    return apiRequest('/employees');
  },

  getById: async (id: string): Promise<Employee> => {
    return apiRequest(`/employees/${id}`);
  },

  create: async (employee: Partial<Employee>): Promise<Employee> => {
    return apiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  },

  update: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
    return apiRequest(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// Loan API
export const loanAPI = {
  getAll: async (): Promise<Loan[]> => {
    return apiRequest('/loans');
  },

  getMyLoans: async (): Promise<Loan[]> => {
    return apiRequest('/loans/my-loans');
  },

  create: async (loan: Partial<Loan>): Promise<Loan> => {
    return apiRequest('/loans', {
      method: 'POST',
      body: JSON.stringify(loan),
    });
  },

  approve: async (id: string, status: string, remarks?: string): Promise<Loan> => {
    return apiRequest(`/loans/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks }),
    });
  },
};

// Payroll API
export const payrollAPI = {
  getAll: async (filters?: { month?: number; year?: number }): Promise<Payroll[]> => {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    return apiRequest(`/payroll?${params.toString()}`);
  },

  getMyPayslips: async (): Promise<Payroll[]> => {
    return apiRequest('/payroll/my-payslips');
  },

  create: async (payroll: Partial<Payroll>): Promise<Payroll> => {
    return apiRequest('/payroll', {
      method: 'POST',
      body: JSON.stringify(payroll),
    });
  },

  update: async (id: string, payroll: Partial<Payroll>): Promise<Payroll> => {
    return apiRequest(`/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payroll),
    });
  },
};

// Attendance API
export interface Attendance {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'halfday';
  checkIn: string;
  checkOut: string;
  hours: string;
  date: string;
}

export const attendanceAPI = {
  getAll: async (): Promise<Attendance[]> => {
    return apiRequest('/attendance');
  },

  mark: async (data: Partial<Attendance>): Promise<any> => {
    return apiRequest('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Leave API
export interface Leave {
  id: string;
  employee: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const leaveAPI = {
  getAll: async (): Promise<Leave[]> => {
    return apiRequest('/leaves');
  },

  create: async (data: Partial<Leave>): Promise<any> => {
    return apiRequest('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, status: string): Promise<any> => {
    return apiRequest(`/leaves/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Reports API
export interface Report {
  name: string;
  date: string;
  type: string;
  size: string;
}

export const reportsAPI = {
  getAll: async (): Promise<Report[]> => {
    return apiRequest('/reports');
  },

  generate: async (type: string): Promise<any> => {
    return apiRequest('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },
};

// Audit Logs API
export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
  type: string;
}

export const auditLogsAPI = {
  getAll: async (): Promise<AuditLog[]> => {
    return apiRequest('/audit-logs');
  },
};
