import { useState } from 'react';

const EulaPopup = ({ onAccept }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onAccept();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border-4 border-orange-500 overflow-hidden">
        <div className="bg-orange-500 p-3 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">
            🍗 Terms & Conditions
          </h2>
          <button 
            onClick={handleClose}
            className="text-white hover:text-orange-200 font-bold text-xl"
          >
            &times;
          </button>
        </div>
        
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="space-y-3 text-sm text-gray-700">
            <p className="font-semibold">
              Welcome to The Great Auto-Trail CNT!
            </p>

            <p>
              By using this site, you agree to our terms.
            </p>

            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <h3 className="font-semibold text-xs mb-1">Cookie Policy</h3>
              <p className="text-xs">
                We use cookies. By continuing, you accept this.
              </p>
            </div>

            <div style={{ fontSize: '0.25rem' }} className="">
              <h3 className="font-semibold mb-1 text-orange-800">⚠️ The Adam Clause</h3>
              <p className="text-orange-900">
                All nugget orders are subject to involuntary surrender to Adam. You can have the nuggets but your orders belong to Adam.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="mt-4 w-full bg-orange-500 text-white py-2 rounded font-bold hover:bg-orange-600 transition-colors"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default EulaPopup;
