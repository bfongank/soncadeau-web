// src/pages/CartPage.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { database } from '../firebase/firebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { currentUser } = useUser();
  const [cart, setCart] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const cartRef = ref(database, `users/${currentUser.uid}/cart`);
    onValue(cartRef, (snapshot) => {
      const data = snapshot.val();
      setCart(data || {});
      setLoading(false);
    });
  }, [currentUser]);

  const removeFromCart = async (productId: string) => {
    if (!currentUser) return;
    
    try {
      const productRef = ref(database, `users/${currentUser.uid}/cart/${productId}`);
      await remove(productRef);
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!currentUser || quantity < 1) return;
    
    try {
      const productRef = ref(database, `users/${currentUser.uid}/cart/${productId}`);
      await update(productRef, { quantity });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
    }
  };

  // Variantes d'animation
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 10
      }
    },
    exit: { opacity: 0, x: -50 }
  };

  const loadingVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (!currentUser) {
    return (
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-8 text-center"
      >
        <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-4">Votre Panier</motion.h2>
        <motion.p variants={itemVariants} className="mb-4">Veuillez vous connecter pour voir votre panier</motion.p>
        <motion.div variants={itemVariants}>
          <Link to="/login" className="btn btn-primary">Connexion</Link>
        </motion.div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={loadingVariants}
        className="container mx-auto px-4 py-8 text-center"
      >
        Chargement du panier...
      </motion.div>
    );
  }

  const cartItems = Object.entries(cart).filter(([key]) => key !== 'number of products' && key !== 'total');
  const subtotal = cartItems.reduce((sum, [_, item]: [string, any]) => sum + (item.price * (item.quantity || 1)), 0);

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
        Votre Panier
      </motion.h2>
      
      <AnimatePresence>
        {cartItems.length === 0 ? (
          <motion.div
            key="empty-cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-10"
          >
            <motion.p 
              className="mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              Votre panier est vide
            </motion.p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/" className="btn btn-primary">Continuer vos achats</Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="cart-items"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Prix</th>
                      <th>Quantité</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {cartItems.map(([key, item]: [string, any]) => (
                        <motion.tr
                          key={key}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="hover:bg-base-100"
                          whileHover={{ scale: 1.01 }}
                        >
                          <td>
                            <div className="flex items-center gap-4">
                              <motion.img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-16 h-16 object-cover rounded"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                              />
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.country}</p>
                              </div>
                            </div>
                          </td>
                          <td>{item.price} FCFA</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <motion.button 
                                onClick={() => updateQuantity(key, (item.quantity || 1) - 1)}
                                className="btn btn-xs btn-square"
                                whileTap={{ scale: 0.8 }}
                              >
                                -
                              </motion.button>
                              <motion.span
                                key={`quantity-${item.quantity}`}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                              >
                                {item.quantity || 1}
                              </motion.span>
                              <motion.button 
                                onClick={() => updateQuantity(key, (item.quantity || 1) + 1)}
                                className="btn btn-xs btn-square"
                                whileTap={{ scale: 0.8 }}
                              >
                                +
                              </motion.button>
                            </div>
                          </td>
                          <td>{(item.price * (item.quantity || 1))} FCFA</td>
                          <td>
                            <motion.button 
                              onClick={() => removeFromCart(key)}
                              className="btn btn-xs btn-error"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Supprimer
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-base-200 p-6 rounded-lg"
            >
              <h3 className="text-xl font-bold mb-4">Récapitulatif de commande</h3>
              <div className="space-y-2 mb-6">
                <motion.div 
                  className="flex justify-between"
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span>Sous-total</span>
                  <span>{subtotal} FCFA</span>
                </motion.div>
                <motion.div 
                  className="flex justify-between"
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span>Frais de livraison estimés</span>
                  <span>5 000 FCFA</span>
                </motion.div>
                <div className="divider"></div>
                <motion.div 
                  className="flex justify-between font-bold text-lg"
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span>Total</span>
                  <span>{(subtotal + 5000)} FCFA</span>
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/checkout" className="btn btn-primary w-full">Passer la commande</Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CartPage;