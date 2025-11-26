import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, configAPI } from '../api/client';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState({ nugget_price: '5.00', event_end_date: '', orders_closing_date: '', show_ai_content: 'false' });
  const [editing, setEditing] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [inviteExpiry, setInviteExpiry] = useState(null);
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
        orders_closing_date: response.data.orders_closing_date || '',
        show_ai_content: response.data.show_ai_content || 'false',
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

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
    try {
      await adminAPI.deleteOrder(orderId);
      loadOrders();
      loadStats();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete order');
    }
  };

  const handleGenerateInvite = async () => {
    try {
      const response = await adminAPI.generateInvite();
      setInviteCode(response.data.code);
      setInviteExpiry(new Date(response.data.expires_at).toLocaleTimeString());
    } catch (error) {
      alert('Failed to generate invite');
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
        
        {/* Invite Generator */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-purple-500">
          <h2 className="text-2xl font-bold mb-4">Broker Invitations</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerateInvite}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Generate One-Time Invite Link
            </button>
            {inviteCode && (
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg flex items-center gap-4">
                <div>
                  <span className="text-sm text-gray-500 block">Invite Code:</span>
                  <code className="text-lg font-mono font-bold text-purple-800 select-all">{inviteCode}</code>
                </div>
                <div className="border-l border-purple-200 pl-4">
                  <span className="text-sm text-gray-500 block">Expires at:</span>
                  <span className="font-medium">{inviteExpiry}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">System Configuration</h2>
            <button
              onClick={() => editing ? handleSaveConfig() : setEditing(true)}
              className={`px-6 py-2 rounded-lg font-bold ${
                editing 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {editing ? 'Save Changes' : 'Edit Config'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nugget Price (£)
              </label>
              <input
                type="number"
                step="0.01"
                disabled={!editing}
                value={config.nugget_price}
                onChange={(e) => setConfig({...config, nugget_price: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orders Closing Date
              </label>
              <input
                type="datetime-local"
                disabled={!editing}
                value={config.orders_closing_date}
                onChange={(e) => setConfig({...config, orders_closing_date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event End Date (Final Scores)
              </label>
              <input
                type="datetime-local"
                disabled={!editing}
                value={config.event_end_date}
                onChange={(e) => setConfig({...config, event_end_date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Show AI Content
                </label>
                <p className="text-xs text-gray-500">
                  {config.show_ai_content === 'true' ? 'Public sees AI Propaganda' : 'Public sees Real Profiles'}
                </p>
              </div>
              <button
                disabled={!editing}
                onClick={() => setConfig({...config, show_ai_content: config.show_ai_content === 'true' ? 'false' : 'true'})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  config.show_ai_content === 'true' ? 'bg-purple-600' : 'bg-gray-200'
                } ${!editing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.show_ai_content === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <button
              onClick={() => window.open('/?preview=scores', '_blank')}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-600 transition-colors"
            >
              Preview Final Scores Page
            </button>
          </div>

          {editing && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-gray-500 font-medium mb-2">Current Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-gray-500 font-medium">Nugget Price</h3>
                  <p className="text-xl font-bold">£{config.nugget_price}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 font-medium">Event End Date</h3>
                  <p className="text-xl font-bold">{config.event_end_date ? new Date(config.event_end_date).toLocaleString() : 'Not set'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 font-medium">Orders Close</h3>
                  <p className="text-xl font-bold">{config.orders_closing_date ? new Date(config.orders_closing_date).toLocaleString() : 'Not set'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 font-medium">AI Content</h3>
                  <p className={`text-xl font-bold ${config.show_ai_content === 'true' ? 'text-green-600' : 'text-gray-600'}`}>
                    {config.show_ai_content === 'true' ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-500 font-medium mb-2">Total Orders</h3>
            <p className="text-4xl font-bold text-blue-600">{totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-500 font-medium mb-2">Total Revenue</h3>
            <p className="text-4xl font-bold text-green-600">£{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-500 font-medium mb-2">Paid Revenue</h3>
            <p className="text-4xl font-bold text-purple-600">£{paidRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{order.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        const broker = stats.find(s => s.broker_id === order.broker_id);
                        return broker?.name || broker?.username || 'Unknown';
                      })()}
                      <div className="mt-1">
                        <select
                          className="text-xs border rounded px-2 py-1 mt-1"
                          value={order.broker_id}
                          onChange={async (e) => {
                            const newBrokerId = parseInt(e.target.value);
                            if (newBrokerId !== order.broker_id) {
                              try {
                                await adminAPI.updateOrder(order.id, { broker_id: newBrokerId });
                                loadOrders();
                              } catch (err) {
                                alert('Failed to transfer order');
                              }
                            }
                          }}
                        >
                          {stats.map(broker => (
                            <option key={broker.broker_id} value={broker.broker_id}>
                              {broker.name || broker.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">£{order.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {order.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleTogglePaid(order.id, order.is_paid)}
                        className={`text-indigo-600 hover:text-indigo-900 mr-4 ${
                          order.is_paid ? 'opacity-50' : ''
                        }`}
                      >
                        {order.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
