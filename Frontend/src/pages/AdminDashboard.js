import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import API from "../axios.js";
import "../styles/admin.css";
import { toast } from "react-toastify";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [chartType, setChartType] = useState('pie');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    leavesByMonth: {},
    highestMonth: "",
    lowestMonth: "",
    leavesByType: {},
    monthlyStats: {},
    years: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
    } else {
      fetchStats();
    }
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Admin token not found");
      }
      const response = await API.get('admins/leave-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        // Transform backend stats to frontend format
        const backend = response.data;
        const total = backend.totalLeaves;
        let approved = 0, rejected = 0, pending = 0;
        backend.byStatus.forEach(item => {
          if (item._id.toLowerCase() === 'approved') approved = item.count;
          if (item._id.toLowerCase() === 'rejected') rejected = item.count;
          if (item._id.toLowerCase() === 'pending') pending = item.count;
        });
        // Group leaves by month and year
        const leavesByMonth = {};
        const monthlyStats = {};
        const years = new Set();
        backend.monthlyTrends.forEach(item => {
          const month = months[item._id.month - 1];
          const year = item._id.year;
          const key = `${month}-${year}`;
          years.add(year);
          leavesByMonth[key] = item.count;
          // For monthly stats, we only have total count, so set pending/approved/rejected = 0 for now
          if (!monthlyStats[key]) {
            monthlyStats[key] = { total: 0, approved: 0, rejected: 0, pending: 0 };
          }
          monthlyStats[key].total = item.count;
        });
        // Group leaves by month and year and status from backend.monthlyStatusTrends
        if (Array.isArray(backend.monthlyStatusTrends)) {
          backend.monthlyStatusTrends.forEach(item => {
            const month = months[item._id.month - 1];
            const year = item._id.year;
            const key = `${month}-${year}`;
            if (!monthlyStats[key]) {
              monthlyStats[key] = { total: 0, approved: 0, rejected: 0, pending: 0 };
            }
            monthlyStats[key][item._id.status.toLowerCase()] = item.count;
            monthlyStats[key].total += item.count;
            years.add(year);
          });
        }
        // Group leaves by type
        const leavesByType = {};
        backend.byType.forEach(item => {
          leavesByType[item._id] = item.count;
        });
        // Find highest and lowest months
        const monthKeys = Object.keys(leavesByMonth);
        const monthData = Object.values(leavesByMonth);
        const highestMonthKey = monthKeys[monthData.indexOf(Math.max(...monthData))] || 'No data';
        const lowestMonthKey = monthKeys[monthData.indexOf(Math.min(...monthData))] || 'No data';
        setStats({
          total,
          approved,
          rejected,
          pending,
          leavesByMonth,
          highestMonth: highestMonthKey.split('-')[0],
          lowestMonth: lowestMonthKey.split('-')[0],
          leavesByType,
          monthlyStats,
          years: Array.from(years).sort((a, b) => b - a)
        });
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to fetch leave statistics";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const leaveStatusData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        label: 'Leave Status',
        data: [stats.pending, stats.approved, stats.rejected],
        backgroundColor: ['#FFD700', '#32CD32', '#FF6347'],
        borderColor: ['#FFD700', '#32CD32', '#FF6347'],
        borderWidth: 1,
      },
    ],
  };

  const leaveTypeData = {
    labels: Object.keys(stats.leavesByType),
    datasets: [
      {
        label: 'Leave Types',
        data: Object.values(stats.leavesByType),
        backgroundColor: [
          '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A',
          '#33AA99', '#9933AA', '#FF9999'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    } : {},
  };

  const getAllMonthsData = (year) => {
    const labels = months;
    const values = months.map(month => {
      const key = `${month}-${year}`;
      return stats.monthlyStats[key]?.total || 0;
    });
    return {
      labels,
      datasets: [{
        label: `Leaves per Month in ${year}`,
        data: values,
        backgroundColor: '#0088FE',
        borderColor: '#0088FE',
        borderWidth: 1,
      }]
    };
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="btn btn-primary ms-3" onClick={fetchStats}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Welcome to Admin Panel</h2>
      </div>
      <div className="chart-controls" style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => setChartType('pie')}
          className={`btn ${chartType === 'pie' ? 'btn-primary' : 'btn-outline-primary'}`}
          style={{ minWidth: 120 }}
        >
          <i className="fas fa-chart-pie"></i> Pie Chart
        </button>
        <button
          onClick={() => setChartType('bar')}
          className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
          style={{ minWidth: 120 }}
        >
          <i className="fas fa-chart-bar"></i> Bar Chart
        </button>
      </div>
      {/* Place Leave Status and Leave Types side by side, Monthly below */}
      <div className="chart-row" style={{ display: 'flex', flexWrap: 'nowrap', gap: '48px', justifyContent: 'center', alignItems: 'flex-start', margin: '32px 0' }}>
        <div style={{ width: 600, height: 440, background: '#fff', borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ marginBottom: 12, fontSize: 28, fontWeight: 800, color: '#1e293b', fontFamily: 'Montserrat, Arial, sans-serif', letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            Leave Status Distribution
          </div>
          {chartType === 'pie' ? 
            <Pie data={leaveStatusData} options={options} width={520} height={340} /> : 
            <Bar data={leaveStatusData} options={options} width={520} height={340} />
          }
        </div>
        <div style={{ width: 600, height: 440, background: '#fff', borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ marginBottom: 12, fontSize: 28, fontWeight: 800, color: '#1e293b', fontFamily: 'Montserrat, Arial, sans-serif', letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            Leave Types Distribution
          </div>
          {chartType === 'pie' ? 
            <Pie data={leaveTypeData} options={options} width={520} height={340} /> : 
            <Bar data={leaveTypeData} options={options} width={520} height={340} />
          }
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
        <div style={{ width: 600, height: 440, background: '#fff', borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ marginBottom: 12, fontSize: 28, fontWeight: 800, color: '#1e293b', fontFamily: 'Montserrat, Arial, sans-serif', letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            Monthly Leave Distribution
          </div>
          <div className="month-selector" style={{ marginBottom: 10 }}>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ marginRight: 8, padding: 4, borderRadius: 4 }}
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ padding: 4, borderRadius: 4 }}
            >
              {stats.years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <Bar data={getAllMonthsData(selectedYear)} options={options} width={520} height={340} />
        </div>
      </div>
      {/* Monthly Leave Summary - Now as a big container with styled heading and stats below */}
      <div className="monthly-summary-main" style={{
        width: '100%',
        maxWidth: 900,
        margin: '40px auto',
        background: '#fff',
        borderRadius: 32,
        boxShadow: '0 6px 32px rgba(0,0,0,0.10)',
        padding: '48px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: 1,
          marginBottom: 32,
          color: '#2a2a2a',
          fontFamily: 'Montserrat, Arial, sans-serif',
          textAlign: 'center',
          textShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          Leave Statistics Summary - {selectedMonth} {selectedYear}
        </div>
        <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <div style={{ background: '#f5f6fa', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32, minWidth: 180, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26, color: '#222' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Total Leaves</div>
            <span>{stats.monthlyStats[`${selectedMonth}-${selectedYear}`]?.total || 0}</span>
          </div>
          <div style={{ background: '#e6f4ea', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32, minWidth: 180, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26, color: '#1e7e34' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Approved</div>
            <span>{stats.monthlyStats[`${selectedMonth}-${selectedYear}`]?.approved || 0}</span>
          </div>
          <div style={{ background: '#fff3cd', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32, minWidth: 180, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26, color: '#856404' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Pending</div>
            <span>{stats.monthlyStats[`${selectedMonth}-${selectedYear}`]?.pending || 0}</span>
          </div>
          <div style={{ background: '#f8d7da', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32, minWidth: 180, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26, color: '#721c24' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Rejected</div>
            <span>{stats.monthlyStats[`${selectedMonth}-${selectedYear}`]?.rejected || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;