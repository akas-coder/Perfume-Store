import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { adminAPI } from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const STATUS_STYLES = {
  PENDING: 'status-pending', PROCESSING: 'status-processing', PACKED: 'status-packed',
  SHIPPED: 'status-shipped', DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled'
};

const StatCard = ({ icon: Icon, title, value, color, sub }) => (
  <div className="p-5 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
           style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={22} style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-bold mt-4" style={{ color: 'var(--color-cream)' }}>{value}</p>
    <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>{title}</p>
    {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {Array(4).fill(0).map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
      </div>
    </div>
  );

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1A1A', titleColor: '#D4AF37', bodyColor: '#F5F5F0' } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
    },
  };

  const lineData = {
    labels: data?.monthlySales?.map(m => m.month) || [],
    datasets: [{
      label: 'Revenue',
      data: data?.monthlySales?.map(m => m.revenue) || [],
      borderColor: '#D4AF37',
      backgroundColor: 'rgba(212,175,55,0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={FiDollarSign} title="Total Revenue" color="#D4AF37"
          value={`₹${data?.totalRevenue?.toLocaleString('en-IN') || 0}`}
          sub={`${data?.ordersToday || 0} orders today`} />
        <StatCard icon={FiShoppingBag} title="Total Orders" color="#60A5FA"
          value={data?.totalOrders?.toLocaleString() || 0} />
        <StatCard icon={FiUsers} title="Customers" color="#4ADE80"
          value={data?.totalCustomers?.toLocaleString() || 0} />
        <StatCard icon={FiPackage} title="Active Products" color="#A78BFA"
          value={data?.totalProducts?.toLocaleString() || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
          <h2 className="font-semibold mb-4" style={{ color: 'var(--color-cream)' }}>Monthly Revenue</h2>
          {data?.monthlySales?.length > 0
            ? <Line data={lineData} options={chartOptions} />
            : <p className="text-center py-10" style={{ color: 'var(--color-muted)' }}>No sales data yet</p>}
        </div>

        {/* Low Stock Alert */}
        <div className="p-6 rounded-2xl gold-border overflow-auto" style={{ background: 'var(--color-surface)', maxHeight: '340px' }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-cream)' }}>
            <FiAlertTriangle size={16} style={{ color: '#F59E0B' }} /> Low Stock Alert
          </h2>
          {data?.lowStockProducts?.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>All products are well-stocked</p>
          ) : (
            <div className="space-y-3">
              {data?.lowStockProducts?.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                       style={{ background: 'var(--color-surface-2)' }}>
                    {p.primaryImage ? <img src={p.primaryImage} alt="" className="w-full h-full object-cover" />
                                   : <div className="w-full h-full flex items-center justify-center">🌹</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1" style={{ color: 'var(--color-cream)' }}>{p.name}</p>
                    <p className="text-xs" style={{ color: '#F59E0B' }}>
                      {p.stockQuantity != null ? `${p.stockQuantity} left` : 'Low stock'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-6 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-cream)' }}>Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status'].map(h => (
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--color-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.map((order, i) => (
                <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                           style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="py-3 pr-4 font-mono font-bold" style={{ color: 'var(--color-gold)' }}>#{order.orderNumber}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--color-cream)' }}>{order.userName || 'User'}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--color-muted)' }}>{order.items?.length || 0}</td>
                  <td className="py-3 pr-4 font-medium" style={{ color: 'var(--color-cream)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4 text-xs" style={{ color: 'var(--color-muted)' }}>{order.paymentMethod}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {(!data?.recentOrders?.length) && (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--color-muted)' }}>No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
