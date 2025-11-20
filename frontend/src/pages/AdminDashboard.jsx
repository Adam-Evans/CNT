import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, configAPI } from '../api/client';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState({ nugget_price: '5.00', event_end_date: '' });
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.is_super_admin) {
      navigate('/login');
      return;
    }
    loadStats();
    loadOrders();
    loadConfig();
  }, [user, navigate]);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getBrokerStats();
      setStats(response.data || []);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await adminAPI.getAllOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await configAPI.getConfig();
      setConfig({
        nugget_price: response.data.nugget_price || '5.00',
        event_end_date: response.data.event_end_date || '',
      });
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await adminAPI.updateConfig(config);
      setEditing(false);
      alert('Configuration updated successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update configuration');
    }
  };

  const handleTogglePaid = async (orderId, currentStatus) => {
    try {
      await adminAPI.updateOrder(orderId, { is_paid: !currentStatus });
      loadOrders();
      loadStats();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update order');
    }
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.cost, 0);
  const paidRevenue = orders.filter(o => o.is_paid).reduce((sum, order) => sum + order.cost, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">👑 Super Admin Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span>Welcome, {user.username}!</span>
            <button
              onClick={logout}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Configuration Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">System Configuration</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nugget Price (per 20-pack)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.nugget_price}
                  onChange={(e) => setConfig({ ...config, nugget_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event End Date
                </label>
                <input
                  type="datetime-local"
                  value={config.event_end_date ? new Date(config.event_end_date).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setConfig({ ...config, event_end_date: new Date(e.target.value).toISOString() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600"
              >
                Save Configuration
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Nugget Price</p>
                <p className="text-2xl font-bold text-green-600">${config.nugget_price}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Event End Date</p>
                <p className="text-lg font-bold text-blue-600">
                  {config.event_end_date ? new Date(config.event_end_date).toLocaleString() : 'Not set'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Paid Revenue</p>
            <p className="text-3xl font-bold text-purple-600">${paidRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Broker Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Broker Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Rank</th>
                  <th className="px-4 py-2 text-left">Broker</th>
                  <th className="px-4 py-2 text-left">Orders</th>
                  <th className="px-4 py-2 text-left">Total Revenue</th>
                  <th className="px-4 py-2 text-left">Paid Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, index) => (
                  <tr key={stat.broker_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <span className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : ''}`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div>
                        <p className="font-semibold">{stat.name}</p>
                        <p className="text-sm text-gray-600">@{stat.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2">{stat.order_count}</td>
                    <td className="px-4 py-2 font-semibold text-green-600">${stat.total_revenue.toFixed(2)}</td>
                    <td className="px-4 py-2">${stat.paid_revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.length === 0 && (
              <p className="text-center text-gray-500 py-8">No brokers yet</p>
            )}
          </div>
        </div>

        {/* All Orders */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">All Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Broker</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Cost</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">#{order.id}</td>
                    <td className="px-4 py-2">{order.customer_name}</td>
                    <td className="px-4 py-2">@{order.broker_username}</td>
                    <td className="px-4 py-2">{order.quantity}</td>
                    <td className="px-4 py-2">${order.cost.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${order.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.is_paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleTogglePaid(order.id, order.is_paid)}
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          order.is_paid
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {order.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
