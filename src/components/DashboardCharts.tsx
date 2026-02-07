import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export const DashboardCharts = () => {
  // Salary Trend Chart Data
  const salaryTrendData = {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
    datasets: [
      {
        label: 'Total Payroll',
        data: [2150000, 2280000, 2310000, 2420000, 2389000, 2456000],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const salaryTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `₹${(context.parsed.y / 100000).toFixed(2)}L`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `₹${(value / 100000).toFixed(1)}L`,
        },
      },
    },
  };

  // Department Distribution Chart Data
  const departmentData = {
    labels: ['Engineering', 'Sales', 'HR', 'Marketing', 'Finance', 'Operations'],
    datasets: [
      {
        label: 'Employees',
        data: [18, 12, 5, 8, 4, 5],
        backgroundColor: [
          '#4f46e5',
          '#06b6d4',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
        ],
      },
    ],
  };

  const departmentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  // Employee Growth Chart Data
  const employeeGrowthData = {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
    datasets: [
      {
        label: 'Active Employees',
        data: [42, 43, 45, 46, 46, 48],
        backgroundColor: '#10b981',
      },
      {
        label: 'New Joiners',
        data: [2, 1, 3, 2, 1, 5],
        backgroundColor: '#4f46e5',
      },
    ],
  };

  const employeeGrowthOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
      {/* Salary Trend Chart */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
            Payroll Trend
          </h3>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Last 6 months salary distribution
          </p>
        </div>
        <div style={{ height: '280px' }}>
          <Line data={salaryTrendData} options={salaryTrendOptions} />
        </div>
      </div>

      {/* Department Distribution Chart */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
            Department Distribution
          </h3>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Employee count by department
          </p>
        </div>
        <div style={{ height: '280px' }}>
          <Doughnut data={departmentData} options={departmentOptions} />
        </div>
      </div>

      {/* Employee Growth Chart */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', gridColumn: 'span 2' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
            Employee Growth
          </h3>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Active employees and new joiners over time
          </p>
        </div>
        <div style={{ height: '280px' }}>
          <Bar data={employeeGrowthData} options={employeeGrowthOptions} />
        </div>
      </div>
    </div>
  );
};
