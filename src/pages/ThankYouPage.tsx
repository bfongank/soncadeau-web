import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ThankYouPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.orderNumber) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.orderNumber) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-50"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex justify-center mb-6"
        >
          <CheckCircleIcon className="h-16 w-16 text-green-500" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-6">
          Your order #{state.orderNumber} has been placed successfully. We've sent a confirmation to your email.
        </p>

        <div className="space-y-4">
          <motion.button
            onClick={() => navigate('/orders')}
            className="btn btn-primary w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Order Details
          </motion.button>

          <motion.button
            onClick={() => navigate('/products')}
            className="btn btn-ghost w-full flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Continue Shopping
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThankYouPage;