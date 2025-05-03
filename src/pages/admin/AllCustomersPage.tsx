import { useState, useEffect } from 'react';
import { database } from '../../firebase/firebaseConfig';
import { ref, onValue, remove } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, TrashIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';

const AllCustomersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.entries(data).map(([key, value]) => {
          const userValue = value as {
            orders?: Record<string, unknown>;
            "wished products"?: {
              "number of wished products"?: number;
            };
            // Add other known properties here
            name?: string;
            surname?: string;
            email?: string;
            mobileNumber?: string;
            country?: string;
            // ... other properties from your user data structure
          };

          return {
            id: key,
            ...userValue,
            // Extract orders count
            ordersCount: userValue.orders ? Object.keys(userValue.orders).filter(k => k !== "number of orders").length : 0,
            // Extract wished products count
            wishedProductsCount: userValue["wished products"] ? userValue["wished products"]["number of wished products"] || 0 : 0
          };
        });
        setUsers(usersArray);
      }
      setLoading(false);
    });

    return () => unsubscribe();
}, []);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const userRef = ref(database, `users/${userId}`);
        await remove(userRef);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      }
    }
  };

  const toggleUserExpansion = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const formatCurrency = (amount: number, currency: string = 'FCFA') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  const expandVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="p-6">
      <motion.h1 
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Gestion des Clients
      </motion.h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordonnées</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commandes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liste de souhaits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={itemVariants}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white">
                            <UserIcon className="h-6 w-6" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{user.name} {user.surname}</div>
                            <div className="text-sm text-gray-500">{user.country}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {user.mobileNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.ordersCount} commande(s)</div>
                        {user.ordersCount > 0 && (
                          <button 
                            onClick={() => toggleUserExpansion(user.id)}
                            className="text-xs text-primary hover:underline mt-1"
                          >
                            {expandedUser === user.id ? 'Masquer les détails' : 'Voir les détails'}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.wishedProductsCount} produit(s)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <motion.button
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5 mr-1" />
                          <span className="hidden md:inline">Modifier</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5 mr-1" />
                          <span className="hidden md:inline">Supprimer</span>
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Expanded order details */}
          <AnimatePresence>
            {expandedUser && (
              <motion.div
                variants={expandVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-gray-50 p-6"
              >
                <h3 className="text-lg font-medium mb-4">Détails des Commandes</h3>
                {users.find(u => u.id === expandedUser)?.orders && (
                  <div className="space-y-6">
                    {Object.entries(users.find(u => u.id === expandedUser).orders)
                      .filter(([key]) => key !== "number of orders")
                      .map(([orderId, order]: [string, any]) => (
                        <motion.div 
                          key={orderId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white p-4 rounded-lg shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">Commande #{orderId}</h4>
                              <p className="text-sm text-gray-500">
                                Date: {order.delivery_date || 'Non spécifiée'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(order.total)}</p>
                              <p className="text-sm text-gray-500">
                                {order.order} produit(s)
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                Livraison
                              </h5>
                              <div className="text-sm">
                                <p>{order.delivery_name}</p>
                                <p>{order.delivery_street}</p>
                                <p>{order.delivery_zip_Town}</p>
                                <p>{order.delivery_country}</p>
                                <p className="mt-1">Type: {order.delivery_type}</p>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Produits</h5>
                              <div className="space-y-2">
                                {Object.entries(order)
                                  .filter(([key]) => !isNaN(Number(key)))
                                  .map(([productId, product]: [string, any]) => (
                                    <div key={productId} className="flex items-center space-x-3">
                                      <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="h-10 w-10 rounded object-cover"
                                      />
                                      <div>
                                        <p className="text-sm font-medium">{product.name}</p>
                                        <p className="text-xs text-gray-500">{formatCurrency(product.price)}</p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default AllCustomersPage;