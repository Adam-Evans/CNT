import { useState } from 'react';

const EulaPopup = ({ onAccept }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-4 text-orange-600">
            🍗 Terms & Conditions
          </h2>

          <div className="space-y-4 text-sm text-gray-700 mb-6">
            <p className="font-semibold">
              Welcome to The Great Auto-Trail CNT (Chicken Nugget Tuesday)!
            </p>

            <p>
              By accessing and using this website, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above, please
              do not use this service.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">Cookie Policy</h3>
              <p>
                We use cookies to enhance your experience. By clicking "I Accept," you consent to
                our use of cookies in accordance with our Cookie Policy.
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold mb-2 text-orange-800">⚠️ The Adam Clause</h3>
              <p className="text-orange-900">
                By using this website and placing orders, you hereby agree that all chicken nugget
                orders placed through this platform are subject to voluntary surrender to Adam at
                his sole discretion. Adam reserves the right to claim any and all nugget orders
                without prior notice or compensation. This clause is non-negotiable and supersedes
                all other terms.
              </p>
              <p className="text-sm mt-2 italic text-orange-700">
                (You've been warned! 🍗👑)
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Privacy & Data</h3>
              <p>
                We respect your privacy. Your personal information will only be used for the
                purposes of this event and will not be shared with third parties without your
                consent.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Liability</h3>
              <p>
                This is a fun event for chicken nugget enthusiasts. We are not responsible for
                any nugget-related incidents, disagreements, or excessive nugget consumption.
              </p>
            </div>

            <p className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-start mb-4">
            <input
              type="checkbox"
              id="accept-terms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 mr-3 h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="accept-terms" className="text-sm cursor-pointer">
              I have read and agree to the Terms & Conditions, Cookie Policy, and most
              importantly, the <span className="font-bold text-orange-600">Adam Clause</span>.
              I understand that my nuggets may be claimed by Adam at any time.
            </label>
          </div>

          <button
            onClick={handleAccept}
            disabled={!accepted}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            I Accept (Nuggets are mine... for now)
          </button>
        </div>
      </div>
    </div>
  );
};

export default EulaPopup;
