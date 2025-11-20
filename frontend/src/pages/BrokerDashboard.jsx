import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { brokerAPI, orderAPI } from '../api/client';

const BrokerDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [propaganda, setPropaganda] = useState('');
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
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
    try {
      await brokerAPI.updateMyProfile(formData);
      setEditing(false);
      loadProfile();
      loadPropaganda(); // Refresh propaganda after profile update
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.cost, 0);
  const paidRevenue = orders.filter(o => o.is_paid).reduce((sum, order) => sum + order.cost, 0);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-orange-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🍗 Broker Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span>Welcome, {user.username}!</span>
            <button
              onClick={logout}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    Profile Picture URL
                  </label>
                  <input
                    type="text"
                    value={formData.profile_picture}
                    onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com/image.jpg"
                  />
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
          <div className="bg-gradient-to-br from-red-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🎭 AI Propaganda</h2>
            <p className="text-sm mb-4 opacity-90">
              See what the AI thinks about your profile...
            </p>
            {propaganda ? (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-lg italic">"{propaganda}"</p>
              </div>
            ) : (
              <p className="text-center opacity-75">
                Update your profile to generate propaganda!
              </p>
            )}
          </div>
        </div>

        {/* Orders Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">My Orders</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Paid Revenue</p>
              <p className="text-2xl font-bold text-purple-600">${paidRevenue.toFixed(2)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Cost</th>
                  <th className="px-4 py-2 text-left">Paid</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{order.customer_name}</td>
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

export default BrokerDashboard;
