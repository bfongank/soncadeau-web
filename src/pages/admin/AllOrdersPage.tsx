import { useState, useEffect } from 'react';
import { database } from '../../firebase/firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, DocumentArrowDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AllOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editedOrder, setEditedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Filter out the "number of orders" item and transform the data
        const ordersArray = Object.entries(data)
          .filter(([key]) => key !== "number of orders" && key !== "0")
          .map(([key, value]) => ({
            id: key,
            ...(value as any),
            // Extract products from the order
            products: Object.entries(value as any)
              .filter(([k]) => !isNaN(Number(k)))
              .map(([k, v]) => ({ id: k, ...(v as any) }))
          }));
        setOrders(ordersArray);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEditOrder = (order: any) => {
    setEditingOrder(order.id);
    setEditedOrder({ ...order });
  };

  const handleSaveOrder = async () => {
    if (!editingOrder || !editedOrder) return;
    
    try {
      const orderRef = ref(database, `orders/${editingOrder}`);
      await update(orderRef, editedOrder);
      setEditingOrder(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
  };

  const handleDownloadInvoice = (order: any) => {
    // Placeholder for invoice download functionality
    console.log('Téléchargement de la facture pour la commande:', order.id);
    alert(`Facture pour la commande #${order.id} serait téléchargée`);
  };

  const statusOptions = [
    { value: 'En traitement', label: 'En traitement' },
    { value: 'Expédié', label: 'Expédié' },
    { value: 'Livré', label: 'Livré' },
    { value: 'Annulé', label: 'Annulé' },
    { value: 'Remboursé', label: 'Remboursé' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livré': return 'bg-green-100 text-green-800';
      case 'Annulé': return 'bg-red-100 text-red-800';
      case 'Expédié': return 'bg-blue-100 text-blue-800';
      case 'Remboursé': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
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

  return (
    <div className="p-6">
      <motion.h1 
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Toutes les Commandes
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Commande</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livraison</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={itemVariants}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.billing_name}</div>
                        <div className="text-sm text-gray-500">{order.billing_country || order.billing_country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {order.products?.map((product: any) => (
                            <motion.div 
                              key={product.id}
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
                            >
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="h-6 w-6 rounded-full object-cover"
                              />
                              <span className="text-xs">{product.name}</span>
                            </motion.div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.delivery_type}</div>
                        <div className="text-sm text-gray-500">{order.delivery_date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingOrder === order.id ? (
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={editedOrder?.status || 'En traitement'}
                            onChange={(e) => setEditedOrder({...editedOrder, status: e.target.value})}
                          >
                            {statusOptions.map((status) => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status || 'En traitement'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {editingOrder === order.id ? (
                          <>
                            <motion.button
                              onClick={handleSaveOrder}
                              className="text-green-600 hover:text-green-900 flex items-center"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <CheckIcon className="h-5 w-5 mr-1" />
                              <span className="hidden md:inline">Valider</span>
                            </motion.button>
                            <motion.button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-900 flex items-center"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <XMarkIcon className="h-5 w-5 mr-1" />
                              <span className="hidden md:inline">Annuler</span>
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button
                              onClick={() => handleEditOrder(order)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <PencilIcon className="h-5 w-5 mr-1" />
                              <span className="hidden md:inline">Modifier</span>
                            </motion.button>
                            <motion.button
                              onClick={() => handleDownloadInvoice(order)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                              <span className="hidden md:inline">Facture</span>
                            </motion.button>
                          </>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AllOrdersPage;