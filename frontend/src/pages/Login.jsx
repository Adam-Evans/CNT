import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        if (!inviteCode) {
          setError('Invite code is required');
          setLoading(false);
          return;
        }
        await register(username, password, inviteCode);
      }
      navigate('/broker/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in border-4 border-white/20">
        <h1 className="text-4xl font-black text-center mb-2 text-amber-600 drop-shadow-sm">
          CNT
        </h1>
        <p className="text-center text-gray-600 mb-8 font-medium">
          Chicken Nugget Tuesday
        </p>

        <div className="mb-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center justify-center gap-1 mx-auto"
          >
            ← Return to Front Page
          </button>
        </div>

        <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-md transition-all font-semibold ${
              isLogin ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-md transition-all font-semibold ${
              !isLogin ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50"
              required
            />
          </div>

          {!isLogin && (
            <div className="animate-slide-up">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-gray-50"
                placeholder="Enter your invite code"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Join the Squad')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
