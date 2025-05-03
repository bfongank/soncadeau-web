// src/pages/WishlistPage.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { database } from '../firebase/firebaseConfig';
import { ref, onValue, remove } from 'firebase/database';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const { currentUser } = useUser();
  const [wishlist, setWishlist] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const wishlistRef = ref(database, `users/${currentUser.uid}/wished products`);
    onValue(wishlistRef, (snapshot) => {
      const data = snapshot.val();
      setWishlist(data || {});
      setLoading(false);
    });
  }, [currentUser]);

  const removeFromWishlist = async (productId: string) => {
    if (!currentUser) return;
    
    try {
      const productRef = ref(database, `users/${currentUser.uid}/wished products/${productId}`);
      await remove(productRef);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-2xl font-bold mb-4"
        >
          Your Wishlist
        </motion.h2>
        <motion.p variants={itemVariants} className="mb-4">
          Please login to view your wishlist
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </motion.div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            transition: { duration: 1.5, repeat: Infinity }
          }}
        >
          Loading wishlist...
        </motion.div>
      </motion.div>
    );
  }

  const wishlistItems = Object.entries(wishlist).filter(([key]) => key !== 'number of wished products');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.h2 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-2xl font-bold mb-6"
      >
        Your Wishlist
      </motion.h2>
      
      <AnimatePresence>
        {wishlistItems.length === 0 ? (
          <motion.div
            key="empty-wishlist"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <motion.p className="mb-4">
              Your wishlist is empty
            </motion.p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/" className="btn btn-primary">Browse Products</Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {wishlistItems.map(([key, item]: [string, any]) => (
                <motion.div
                  key={key}
                  variants={itemVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ y: -5 }}
                  className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow"
                >
                  <Link to={`/product/${item.id}`}>
                    <motion.figure
                      whileHover={{ scale: 1.03 }}
                    >
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-48 w-full object-cover"
                      />
                    </motion.figure>
                    <div className="card-body p-4">
                      <h3 className="card-title">{item.name}</h3>
                      <p className="text-gray-600 line-clamp-2">{item.country}</p>
                      <div className="card-actions justify-between items-center mt-2">
                        <span className="font-bold text-pink-600">{item.price.toLocaleString()} FCFA</span>
                        <motion.button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFromWishlist(key);
                          }}
                          className="btn btn-xs btn-error"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Remove
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WishlistPage;