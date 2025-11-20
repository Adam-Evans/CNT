import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { brokerAPI, orderAPI, configAPI } from '../api/client';
import EulaPopup from '../components/EulaPopup';

const Home = () => {
  const [brokers, setBrokers] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [nuggetPrice, setNuggetPrice] = useState(5.0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showEula, setShowEula] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBrokers();
    loadConfig();
  }, []);

  const loadBrokers = async () => {
    try {
      const response = await brokerAPI.getAllBrokers();
      setBrokers(response.data || []);
    } catch (error) {
      console.error('Failed to load brokers:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await configAPI.getConfig();
      if (response.data.nugget_price) {
        setNuggetPrice(parseFloat(response.data.nugget_price));
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await orderAPI.createOrder({
        customer_name: customerName,
        broker_id: selectedBroker.id,
        quantity: quantity,
      });
      setSuccess(true);
      setCustomerName('');
      setQuantity(1);
      setSelectedBroker(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = (quantity * nuggetPrice).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500">
      {showEula && <EulaPopup onAccept={() => setShowEula(false)} />}
      
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🍗 The Great Auto-Trail CNT
          </h1>
          <p className="text-2xl text-white drop-shadow">
            Chicken Nugget Tuesday - Choose Your Broker!
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-orange-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Broker Login
            </button>
          </div>
        </header>

        {success && (
          <div className="max-w-2xl mx-auto mb-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded animate-slide-up">
            Order placed successfully! 🎉
          </div>
        )}

        {!selectedBroker ? (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Choose Your Broker
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brokers.map((broker) => (
                <div
                  key={broker.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-2xl transition-shadow cursor-pointer animate-slide-up"
                  onClick={() => setSelectedBroker(broker)}
                >
                  {broker.profile?.profile_picture && (
                    <img
                      src={broker.profile.profile_picture}
                      alt={broker.profile?.name || broker.username}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                  )}
                  <h3 className="text-xl font-bold text-center mb-2">
                    {broker.profile?.name || broker.username}
                  </h3>
                  {broker.profile?.bio && (
                    <p className="text-gray-600 text-center mb-2">
                      {broker.profile.bio}
                    </p>
                  )}
                  {broker.profile?.mission_statement && (
                    <div className="bg-orange-50 p-3 rounded mt-3">
                      <p className="text-sm text-orange-800 italic">
                        "{broker.profile.mission_statement}"
                      </p>
                    </div>
                  )}
                  <button className="w-full mt-4 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                    Select Broker
                  </button>
                </div>
              ))}
            </div>
            {brokers.length === 0 && (
              <p className="text-white text-center text-xl">
                No brokers available yet. Check back soon!
              </p>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-8 animate-slide-up">
            <button
              onClick={() => setSelectedBroker(null)}
              className="text-orange-600 hover:text-orange-700 mb-4"
            >
              ← Back to Brokers
            </button>

            <h2 className="text-3xl font-bold text-center mb-6">
              Place Your Order
            </h2>

            <div className="bg-orange-50 p-4 rounded-lg mb-6">
              <p className="text-center">
                <span className="font-semibold">Broker:</span>{' '}
                {selectedBroker.profile?.name || selectedBroker.username}
              </p>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (20-pack boxes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Max 10 boxes per order
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg font-semibold text-center">
                  Total Cost: ${totalCost}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  ${nuggetPrice.toFixed(2)} per 20-pack box
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
