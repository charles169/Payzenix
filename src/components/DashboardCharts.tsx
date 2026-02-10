import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useThemeStore } from '@/stores/themeStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export const DashboardCharts = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)';
  const borderColor = isDark ? '#1e293b' : '#e2e8f0';

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
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#1e293b',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => `₹${(context.parsed.y / 100000).toFixed(2)}L`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          callback: (value: any) => `₹${(value / 100000).toFixed(1)}L`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
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
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f172a' : '#ffffff',
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
          color: textColor,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#1e293b',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
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
        borderRadius: 4,
      },
      {
        label: 'New Joiners',
        data: [2, 1, 3, 2, 1, 5],
        backgroundColor: '#4f46e5',
        borderRadius: 4,
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
          color: textColor,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#1e293b',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          stepSize: 10,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 mb-8">
      {/* Salary Trend Chart */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold m-0 mb-1 text-foreground">
            Payroll Trend
          </h3>
          <p className="text-sm text-muted-foreground m-0">
            Last 6 months salary distribution
          </p>
        </div>
        <div className="h-[280px]">
          <Line data={salaryTrendData} options={salaryTrendOptions} />
        </div>
      </div>

      {/* Department Distribution Chart */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold m-0 mb-1 text-foreground">
            Department Distribution
          </h3>
          <p className="text-sm text-muted-foreground m-0">
            Employee count by department
          </p>
        </div>
        <div className="h-[280px]">
          <Doughnut data={departmentData} options={departmentOptions} />
        </div>
      </div>

      {/* Employee Growth Chart */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm lg:col-span-2">
        <div className="mb-5">
          <h3 className="text-lg font-semibold m-0 mb-1 text-foreground">
            Employee Growth
          </h3>
          <p className="text-sm text-muted-foreground m-0">
            Active employees and new joiners over time
          </p>
        </div>
        <div className="h-[280px]">
          <Bar data={employeeGrowthData} options={employeeGrowthOptions} />
        </div>
      </div>
    </div>
  );
};
