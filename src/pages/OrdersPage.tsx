import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { database } from '../firebase/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const OrdersPage = () => {
  const { currentUser } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentUser) return;

    const ordersRef = ref(database, `users/${currentUser.uid}/orders`);
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.entries(data)
          .filter(([_, order]) => order !== null)
          .map(([key, order]) => ({ 
            id: key, 
            ...(order as object)
          }));
        setOrders(ordersArray);
        
        const initialExpandedState = ordersArray.reduce((acc, order) => {
          acc[order.id] = false;
          return acc;
        }, {} as Record<string, boolean>);
        setExpandedOrders(initialExpandedState);
      } else {
        setOrders([]);
        setExpandedOrders({});
      }
      setLoading(false);
    });
  }, [currentUser]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const expandVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { 
      height: "auto", 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-4">
          Vos Commandes
        </motion.h2>
        <motion.p variants={itemVariants} className="mb-4">
          Veuillez vous connecter pour voir vos commandes
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link to="/login" className="btn btn-primary">Connexion</Link>
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
          Chargement des commandes...
        </motion.div>
      </motion.div>
    );
  }

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
        Vos Commandes
      </motion.h2>
      
      <AnimatePresence>
        {orders.length === 0 ? (
          <motion.div
            key="empty-orders"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <motion.p className="mb-4">
              Vous n'avez passé aucune commande
            </motion.p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/" className="btn btn-primary">Commencer vos achats</Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {orders.map((order) => {
              const orderItems = Object.entries(order)
                .filter(([key]) => ![
                  'id',
                  'userId',
                  'country',
                  'quantity',
                  'billing_country', 
                  'billing_zip_town',
                  'billing_name',
                  'billing_street',
                  'recipient',
                  'status',
                  'total',
                  'order_date',
                  'orderNumber',
                  'number of products',
                  'payment_method',
                  'delivery_date',
                  'delivery_country',
                  'deliveryFee',
                  'delivery_type'
                ].includes(key))
                .map(([_, item]) => item);

              const isExpanded = expandedOrders[order.id] || false;

              return (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  layout
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  whileHover={{ y: -2 }}
                >
                  {/* En-tête de la commande */}
                  <motion.div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrderExpansion(order.id)}
                    layout
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold">Commande #{order.orderNumber}</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {new Date(order.order_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <motion.div
                          animate={{
                            scale: isExpanded ? 1.05 : 1,
                            transition: { type: "spring", stiffness: 300 }
                          }}
                        >
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status === 'Delivered' ? 'Livré' : 
                             order.status === 'Cancelled' ? 'Annulé' : 'En traitement'}
                          </span>
                        </motion.div>
                        <motion.button 
                          className="text-gray-500 hover:text-gray-700"
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                        >
                          <ChevronDownIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500">Destinataire</h4>
                        <p>{order.recipient || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500">Pays</h4>
                        <p>{order.delivery_country || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500">Total</h4>
                        <p className="font-bold">{order.total || '0'} FCFA</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Détails de la commande */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={expandVariants}
                        className="border-t px-6 overflow-hidden"
                      >
                        <div className="py-4">
                          <h4 className="font-semibold mb-3">Articles ({orderItems.length})</h4>
                          <div className="space-y-4">
                            {orderItems.map((item: any, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-start justify-between py-2"
                              >
                                <div className="flex items-center space-x-4">
                                  <motion.img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-12 h-12 object-cover rounded"
                                    whileHover={{ scale: 1.05 }}
                                  />
                                  <div>
                                    <h5 className="font-medium">{item.name}</h5>
                                    <p className="text-sm text-gray-500">Quantité: {item.quantity || 1}</p>
                                    {item.size && <p className="text-sm text-gray-500">Taille: {item.size}</p>}
                                    {item.customText && <p className="text-sm text-gray-500">Texte: {item.customText}</p>}
                                  </div>
                                </div>
                                <p className="font-medium">
                                  {(item.price * (item.quantity || 1)).toLocaleString('fr-FR')} FCFA
                                </p>
                              </motion.div>
                            ))}
                          </div>

                          <motion.div 
                            className="mt-4 flex justify-end"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Link 
                              to={`/orders/${order.id}`} 
                              className="text-sm text-primary hover:underline"
                            >
                              Voir les détails complets
                            </Link>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrdersPage;