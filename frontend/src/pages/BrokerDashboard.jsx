// Simple loading modal
const LoadingModal = () => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center">
      <svg className="animate-spin h-10 w-10 text-orange-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <span className="font-bold text-orange-600 text-lg">Saving changes...</span>
    </div>
  </div>
);
import { useState, useEffect } from 'react';
// Toast component (same style as Home.jsx)
const Toast = ({ message }) => (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
    <div className="bg-amber-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-lg border-4 border-white">
      <span className="text-2xl">🍗</span>
      {message}
    </div>
  </div>
);
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { brokerAPI, orderAPI } from '../api/client';

const BrokerDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [propaganda, setPropaganda] = useState('');
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    mission_statement: '',
    testimonials: '',
    profile_picture: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.is_super_admin) {
      navigate('/admin');
      return;
    }
    loadProfile();
    loadPropaganda();
    loadOrders();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      const response = await brokerAPI.getMyProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        bio: response.data.bio || '',
        mission_statement: response.data.mission_statement || '',
        testimonials: response.data.testimonials || '',
        profile_picture: response.data.profile_picture || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadPropaganda = async () => {
    try {
      const response = await brokerAPI.getMyPropaganda();
      setPropaganda(response.data.content);
    } catch (error) {
      console.error('Failed to load propaganda:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await brokerAPI.updateMyProfile(formData);
      setEditing(false);
      await loadProfile();
      await loadPropaganda(); // Refresh propaganda after profile update
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTogglePaid = async (orderId, currentStatus) => {
    try {
      await orderAPI.updateMyOrder(orderId, { is_paid: !currentStatus });
      loadOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update order');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderAPI.deleteMyOrder(orderId);
        loadOrders();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete order');
      }
    }
  };

  const handleCopyChase = (order) => {
    const message = `Hey ${order.customer_name}! Just a reminder that you owe £${order.cost.toFixed(2)} for your ${order.quantity * 20} nuggets order. Please pay up! 🍗`;
    navigator.clipboard.writeText(message);
    setToastMessage('Chase message copied to clipboard!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Revenue tracking - available for future use
  const _totalRevenue = orders.reduce((sum, order) => sum + order.cost, 0);
  const _paidRevenue = orders.filter(o => o.is_paid).reduce((sum, order) => sum + order.cost, 0);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {saving && <LoadingModal />}
      {toastMessage && <Toast message={toastMessage} />}
      <nav className="bg-orange-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 onClick={() => { location.href = "/"; }} className="text-2xl font-bold cursor-pointer">🍗 Broker Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span>Welcome, {user.username}!</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Profile</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mission Statement
                  </label>
                  <textarea
                    value={formData.mission_statement}
                    onChange={(e) => setFormData({ ...formData, mission_statement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Testimonials
                  </label>
                  <textarea
                    value={formData.testimonials}
                    onChange={(e) => setFormData({ ...formData, testimonials: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.profile_picture}
                      onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">OR Upload:</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600"
                >
                  Save Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.profile_picture && (
                  <img
                    src={profile.profile_picture}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-700">Name:</p>
                  <p>{profile.name}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Bio:</p>
                  <p>{profile.bio || 'No bio yet'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Mission Statement:</p>
                  <p className="italic">{profile.mission_statement || 'No mission statement yet'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Testimonials:</p>
                  <p>{profile.testimonials || 'No testimonials yet'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Propaganda Section */}
          <div className="bg-gradient-to-br from-red-500 to-purple-600 hidden text-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🎭 AI Propaganda</h2>
            <p className="text-sm mb-4 opacity-90">
              See what the AI thinks about your profile...
            </p>
            {propaganda ? (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-lg text-black italic">"{propaganda}"</p>
              </div>
            ) : (
              <p className="text-center opacity-75">
                Update your profile to generate propaganda!
              </p>
            )}
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Your Orders</h2>
          </div>
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🕸️</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Nothing here (yet)</h3>
              <p className="text-gray-500">
                Once hungry customers place orders with you, they will appear right here.
                <br />
                Make sure your profile is enticing!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{order.customer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">£{order.cost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {order.is_paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleTogglePaid(order.id, order.is_paid)}
                          className={`text-indigo-600 hover:text-indigo-900 ${order.is_paid ? 'opacity-50' : ''}`}
                        >
                          {order.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                        <button
                          onClick={() => handleCopyChase(order)}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          Chase
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
          )}
        </div>
      </div>
      <button
        onClick={logout}
        className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );
};

export default BrokerDashboard;
