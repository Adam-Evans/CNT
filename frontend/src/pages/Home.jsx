import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { brokerAPI, orderAPI, configAPI, authAPI } from '../api/client';
import EulaPopup from '../components/EulaPopup';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/nuggets-hero.webp';
import ceremonyImage from '../assets/nuggets-ceremony.webp';

const Toast = ({ message }) => (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
    <div className="bg-amber-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-lg border-4 border-white">
      <span className="text-2xl">🍗</span>
      {message}
    </div>
  </div>
);

const Podium = ({ brokers }) => {
  const sortedBrokers = [...brokers].sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
  const [gold, silver, bronze] = sortedBrokers;
  const loser = sortedBrokers[sortedBrokers.length - 1];

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{
      backgroundImage: `url('https://c.tenor.com/BzTSwWeFTXkAAAAC/tenor.gif')`,
      backgroundSize: '30% 50%',      
      backgroundRepeat: 'repeat',
    }}>
      
      {/* Top Row - Podium */}
      <div
        className="flex-grow flex items-end justify-center w-full relative"
      
      >
        {/* Silver */}
        <div className="w-1/4 h-3/4 bg-gray-100 border-t-8 border-r-8 border-gray-400 flex flex-col items-center justify-end pb-8 relative">
          <div className="text-6xl mb-4">🥈</div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-400 mb-4 bg-gray-200">
             {silver?.profile?.profile_picture ? (
                <img src={silver.profile.profile_picture} className="w-full h-full object-cover" />
             ) : <span className="text-4xl flex items-center justify-center h-full">👤</span>}
          </div>
          <h2 className="text-2xl font-bold text-gray-700">{silver?.profile?.name || silver?.username || 'Silver'}</h2>
          <p className="text-xl font-mono mt-2">{silver?.total_sold*20 || 0} Nuggets</p>
        </div>

        {/* Gold */}
        <div className="w-1/2 h-full bg-yellow-50 border-t-8 border-x-8 border-yellow-500 flex flex-col items-center justify-end pb-12 relative z-10 shadow-2xl">
          <div className="text-8xl mb-6 animate-bounce">👑</div>
          <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-yellow-500 mb-6 bg-yellow-200 shadow-lg">
             {gold?.profile?.profile_picture ? (
                <img src={gold.profile.profile_picture} className="w-full h-full object-cover" />
             ) : <span className="text-6xl flex items-center justify-center h-full">👤</span>}
          </div>
          <h1 className="text-5xl font-black text-yellow-600 mb-2">{gold?.profile?.name || gold?.username || 'Gold'}</h1>
          <p className="text-3xl font-mono font-bold text-yellow-800">{gold?.total_sold*20 || 0} Nuggets</p>
          <div className="absolute top-10 text-yellow-500/20 text-9xl font-black select-none">WINNER</div>
        </div>

        {/* Bronze */}
        <div className="w-1/4 h-1/2 bg-orange-50 border-t-8 border-l-8 border-orange-400 flex flex-col items-center justify-end pb-8 relative">
          <div className="text-6xl mb-4">🥉</div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-400 mb-4 bg-orange-200">
             {bronze?.profile?.profile_picture ? (
                <img src={bronze.profile.profile_picture} className="w-full h-full object-cover" />
             ) : <span className="text-4xl flex items-center justify-center h-full">👤</span>}
          </div>
          <h2 className="text-2xl font-bold text-orange-800">{bronze?.profile?.name || bronze?.username || 'Bronze'}</h2>
          <p className="text-xl font-mono mt-2">{bronze?.total_sold*20 || 0} Nuggets</p>
        </div>
      </div>

      {/* Bottom Row - Loser */}
      <div className="h-48 bg-gray-200 flex flex-col items-center justify-center border-t-4 border-gray-300">
        <p className="text-gray-500 font-mono text-sm mb-2">Loser</p>
        <div className="flex items-center gap-4 opacity-50 grayscale">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300">
             {loser?.profile?.profile_picture ? (
                <img src={loser.profile.profile_picture} className="w-full h-full object-cover" />
             ) : <span className="text-2xl flex items-center justify-center h-full">💩</span>}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-600">{loser?.profile?.name || loser?.username || 'Loser'}</h3>
            <p className="text-sm">{loser?.total_sold*20 || 0} Nuggets</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center py-12 animate-pulse">
      <h2 className="text-4xl font-black text-amber-600 mb-6 uppercase tracking-widest">Orders Closed</h2>
      <p className="text-xl text-gray-600 mb-8 font-bold">Counting down to the main event...</p>
      <div className="flex justify-center gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-32 border-4 border-amber-400">
          <div className="text-5xl font-black text-gray-800">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-2">Hours</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl w-32 border-4 border-amber-400">
          <div className="text-5xl font-black text-gray-800">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-2">Minutes</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl w-32 border-4 border-amber-400">
          <div className="text-5xl font-black text-gray-800">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-2">Seconds</div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [brokers, setBrokers] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [nuggetPrice, setNuggetPrice] = useState(5.0);
  const [eventEndDate, setEventEndDate] = useState(null);
  const [ordersClosingDate, setOrdersClosingDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEula, setShowEula] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [showAIContent, setShowAIContent] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

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
      if (response.data.event_end_date) {
        setEventEndDate(new Date(response.data.event_end_date));
      }
      if (response.data.orders_closing_date) {
        setOrdersClosingDate(new Date(response.data.orders_closing_date));
      }
      if (response.data.show_ai_content) {
        setShowAIContent(response.data.show_ai_content === 'true');
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
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FCD34D', '#ffffff'] // Gold, Light Gold, White
      });
      
      setToastMessage('Order Placed Successfully! 🍗');
      setTimeout(() => setToastMessage(null), 4000);

      setCustomerName('');
      setQuantity(1);
      setSelectedBroker(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const isEventEnded = (eventEndDate && new Date() > eventEndDate) || searchParams.get('preview') === 'scores';
  const isOrdersClosed = ordersClosingDate && new Date() > ordersClosingDate;

  if (isEventEnded) {
    return <Podium brokers={brokers} />;
  }

  const totalCost = (quantity * nuggetPrice).toFixed(2);

  return (
    <div className="min-h-screen bg-amber-50">
      {toastMessage && <Toast message={toastMessage} />}
      {showEula && <EulaPopup onAccept={() => setShowEula(false)} />}
      
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src={heroImage} 
          alt="Golden Chicken Nuggets" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight">
            <span className="text-amber-400">CNT</span>
          </h1>
          <p className="text-2xl md:text-4xl text-white font-bold drop-shadow-lg mb-8">
            The Great Chicken Nugget Tuesday
          </p>
          <button
            onClick={() => navigate(user ? '/broker/dashboard' : '/login')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-115 shadow-lg border-2 border-white/20"
          >
            {user ? 'Enter Broker Area' : 'Broker Login'}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-20 relative z-30">
        {isOrdersClosed ? (
          <div className="max-w-4xl mx-auto">
             {eventEndDate && <Countdown targetDate={eventEndDate} />}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
                Select Your Nugget Broker
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {brokers.map((broker) => {
                  const isSelected = selectedBroker?.id === broker.id;
                  return (
                    <div
                      key={broker.id}
                      onClick={() => !isSelected && setSelectedBroker(broker)}
                      className={`group bg-amber-50 rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all border-2 ${isSelected ? 'border-amber-500 col-span-2 ring-4 ring-amber-200' : 'border-transparent hover:border-amber-400'} flex flex-col overflow-hidden relative`}
                    >
                      <div className="flex items-center gap-6 mb-4">
                        <div className={`${isSelected ? 'w-48 h-48' : 'w-24 h-24'} flex-shrink-0 rounded-full bg-amber-200 flex items-center justify-center text-4xl shadow-inner overflow-hidden border-4 border-white`}>
                          {broker.profile?.profile_picture ? (
                            <img
                              src={broker.profile.profile_picture}
                              alt={broker.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            '👔'
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">
                            {broker.profile?.name || broker.username}
                          </h3>
                          <p className="text-amber-600 font-medium">Nugget Broker</p>
                        </div>
                      </div>
                      
                      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSelected ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pt-4 border-t border-amber-200 space-y-4">
                          {/* Content Logic: Show AI if enabled and user is NOT super admin (or logged out), otherwise show real profile */}
                          {showAIContent && (!user || !user.is_super_admin) ? (
                             // AI Content
                             <div className="text-sm text-gray-600">
                               {broker.propaganda ? (
                                 <div 
                                   dangerouslySetInnerHTML={{ 
                                     __html: broker.propaganda.replace(/```html|```/g, '') 
                                   }} 
                                 />
                               ) : (
                                 <p className="italic text-center text-gray-400">AI Propaganda generating...</p>
                               )}
                             </div>
                          ) : (
                             // User Content
                             <div className="text-sm text-gray-600 space-y-4">
                               {broker.profile?.mission_statement && (
                                 <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                                   <h4 className="font-bold text-amber-800 mb-1">Mission Statement</h4>
                                   <p className="italic">"{broker.profile.mission_statement}"</p>
                                 </div>
                               )}
                               
                               {broker.profile?.bio && (
                                 <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                                   <h4 className="font-bold text-amber-800 mb-1">About</h4>
                                   <p>{broker.profile.bio}</p>
                                 </div>
                               )}

                               {broker.profile?.testimonials && (
                                 <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
                                   <h4 className="font-bold text-amber-900 mb-2">Testimonials</h4>
                                   <div className="space-y-2">
                                     {broker.profile.testimonials.split(',').map((t, i) => (
                                       t.trim() && (
                                         <div key={i} className="flex gap-2">
                                           <span className="text-amber-500">❝</span>
                                           <p className="italic text-amber-900">{t.trim()}</p>
                                         </div>
                                       )
                                     ))}
                                   </div>
                                 </div>
                               )}
                             </div>
                          )}

                          {/* Order Form inside the card */}
                          <div className="mt-6 bg-white rounded-xl p-6 shadow-lg border-2 border-amber-100">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <span className="text-2xl">🍗</span> Place Order
                            </h4>
                            <form onSubmit={handleOrderSubmit} className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Name</label>
                                <input
                                  type="text"
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
                                  placeholder="e.g. Hungry Harry"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity (Max 10)</label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                  />
                                  <span className="text-xl font-bold text-amber-600 w-8 text-center">{quantity}</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-500 font-medium">Total: <span className="text-gray-800 font-bold">£{totalCost}</span></span>
                                <button
                                  type="submit"
                                  disabled={loading}
                                  className="bg-amber-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-600 transition-colors shadow-md disabled:opacity-50"
                                >
                                  {loading ? '...' : 'Order'}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                      
                      {!isSelected && (
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 font-bold text-sm flex items-center gap-1">
                          Select Broker →
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <footer className="mt-16 text-center text-gray-400 text-xs">
          <p>© 2025 CNT. All rights reserved.</p>
          <p className="mt-2 opacity-20 hover:opacity-50 transition-opacity cursor-default">
            *Adam reserves the right to claim any nuggets at any time.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
