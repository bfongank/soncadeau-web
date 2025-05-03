import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database } from '../firebase/firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, XMarkIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<any>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;

    const orderRef = ref(database, `orders/${id}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOrder({ ...data, id });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleEditField = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditedValue(currentValue);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditedValue('');
  };

  const saveEdit = async () => {
    if (!id || !editingField) return;

    setIsUpdating(true);
    try {
      const orderRef = ref(database, `orders/${id}`);
      await update(orderRef, { [editingField]: editedValue });
      
      // Also update in user's orders if needed
      if (order?.userId) {
        const userOrderRef = ref(database, `users/${order.userId}/orders/${id}`);
        await update(userOrderRef, { [editingField]: editedValue });
      }

      setEditingField(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la commande:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Commande non trouvée</h2>
        <motion.button
          onClick={() => navigate('/orders')}
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Retour aux commandes
        </motion.button>
      </motion.div>
    );
  }

  // Extract order items
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

  const hasCustomFields = orderItems.some((item: any) => 
    item.size || item.customText || item.customPhoto || item.deliveryDate
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h2 className="text-2xl font-bold">Détails de la commande #{order.orderNumber}</h2>
        <motion.button
          onClick={() => navigate('/orders')}
          className="btn btn-ghost"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Retour
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-xl font-bold mb-4">Résumé de la commande</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className={`font-medium ${
                order.status === 'Delivered' ? 'text-green-600' : 
                order.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {order.status === 'Delivered' ? 'Livré' : 
                 order.status === 'Cancelled' ? 'Annulé' : 'En traitement'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date de commande:</span>
              <span>{new Date(order.order_date).toLocaleDateString('fr-FR')}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Méthode de paiement:</span>
              <span>
                {order.payment_method === 'card' ? 'Carte bancaire' : 
                 order.payment_method === 'mobile_money' ? 'Mobile Money' : 
                 'Paiement à la livraison'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold">{order.total} FCFA</span>
            </div>
          </div>

          <h3 className="text-xl font-bold mt-6 mb-4">Livraison</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span>{order.delivery_type}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date prévue:</span>
              {editingField === 'delivery_date' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    className="input input-sm input-bordered"
                  />
                  <button onClick={saveEdit} className="btn btn-sm btn-success" disabled={isUpdating}>
                    {isUpdating ? '...' : <CheckIcon className="h-4 w-4" />}
                  </button>
                  <button onClick={cancelEdit} className="btn btn-sm btn-error">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{order.delivery_date || 'Non spécifiée'}</span>
                  <button 
                    onClick={() => handleEditField('delivery_date', order.delivery_date)}
                    className="btn btn-xs btn-ghost"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Destinataire:</span>
              <span>{order.recipient}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Pays:</span>
              <span>{order.delivery_country}</span>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-xl font-bold mb-4">Articles ({orderItems.length})</h3>
          
          <div className="space-y-6">
            {orderItems.map((item: any, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b pb-4 last:border-b-0"
              >
                <div className="flex justify-between">
                  <div className="flex items-start space-x-4">
                    <motion.img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded"
                      whileHover={{ scale: 1.05 }}
                    />
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-gray-500 text-sm">Quantité: {item.quantity || 1}</p>
                      <p className="font-medium mt-1">
                        {(item.price * (item.quantity || 1)).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                {(item.size || item.customText || item.customPhoto || item.deliveryDate) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pl-4 border-l-2 border-primary"
                  >
                    <h5 className="text-sm font-semibold mb-2">Personnalisation:</h5>
                    <div className="space-y-2">
                      {item.size && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Taille:</span>
                          {editingField === `${index}-size` ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                className="select select-sm select-bordered"
                              >
                                {['S', 'M', 'L', 'XL'].map(size => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                              <button onClick={saveEdit} className="btn btn-sm btn-success" disabled={isUpdating}>
                                {isUpdating ? '...' : <CheckIcon className="h-4 w-4" />}
                              </button>
                              <button onClick={cancelEdit} className="btn btn-sm btn-error">
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{item.size}</span>
                              <button 
                                onClick={() => handleEditField(`${index}-size`, item.size)}
                                className="btn btn-xs btn-ghost"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {item.customText && (
                        <div className="flex items-start">
                          <span className="text-sm text-gray-600 mr-2">Texte:</span>
                          {editingField === `${index}-customText` ? (
                            <div className="flex flex-col gap-2 w-full">
                              <textarea
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                className="textarea textarea-sm textarea-bordered w-full"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button onClick={saveEdit} className="btn btn-sm btn-success" disabled={isUpdating}>
                                  {isUpdating ? '...' : <CheckIcon className="h-4 w-4" />}
                                </button>
                                <button onClick={cancelEdit} className="btn btn-sm btn-error">
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <span className="flex-1">{item.customText}</span>
                              <button 
                                onClick={() => handleEditField(`${index}-customText`, item.customText)}
                                className="btn btn-xs btn-ghost"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {item.customPhoto && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Photo:</span>
                          <div className="relative">
                            <img 
                              src={item.customPhoto} 
                              alt="Photo personnalisée" 
                              className="w-12 h-12 object-cover rounded"
                            />
                          </div>
                        </div>
                      )}

                      {item.deliveryDate && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Date:</span>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span>{item.deliveryDate}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrderDetailsPage;