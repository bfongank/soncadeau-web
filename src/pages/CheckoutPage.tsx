// src/pages/CheckoutPage.tsx
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { database } from '../firebase/firebaseConfig';
import { ref, onValue, update, push, get, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyEuroIcon, CreditCardIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const CheckoutPage = () => {
  const { currentUser, userData } = useUser();
  const [cart, setCart] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [deliveryType, setDeliveryType] = useState('Agent Son Cadeau');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState('Cameroon');
  const [recipientName, setRecipientName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [lastOrderNumber, setLastOrderNumber] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const cartRef = ref(database, `users/${currentUser.uid}/cart`);
    const unsubscribe = onValue(cartRef, (snapshot) => {
      const data = snapshot.val();
      setCart(data || {});
      setLoading(false);
    });

    const fetchLastOrderNumber = async () => {
      try {
        const orderGlobalRef = ref(database, 'orders');
        const snapshot = await get(orderGlobalRef);

        if (snapshot.exists()) {
          const orders = snapshot.val();
          const orderKeys = Object.keys(orders);
          const lastOrder = orders[orderKeys[orderKeys.length - 1]];
          setLastOrderNumber(lastOrder?.orderNumber || 0);
        } else {
          setLastOrderNumber(0);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du dernier numéro de commande:', error);
        setLastOrderNumber(0);
      }
    };

    fetchLastOrderNumber();
    return () => unsubscribe();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || lastOrderNumber === null) return;

    setIsSubmitting(true);
    try {
      const newOrderNumber = lastOrderNumber + 1;
      const cartItems = Object.entries(cart)
        .filter(([key]) => !['number of products', 'total', 'billing_country'].includes(key))
        .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

      const orderData = {
        ...cartItems,
        orderNumber: newOrderNumber,
        delivery_type: deliveryType,
        delivery_date: deliveryDate,
        deliveryFee: '5000',
        delivery_country: deliveryCountry,
        billing_country: userData?.country || '',
        billing_name: `${userData?.name} ${userData?.surname}`,
        billing_street: userData?.street || '',
        billing_zip_Town: `${userData?.zipCode} ${userData?.town}`,
        delivery_name: recipientName,
        payment_method: paymentMethod,
        status: 'En traitement',
        order_date: new Date().toISOString(),
        total: calculateTotal(),
        userId: currentUser.uid
      };

      // Ajouter aux commandes de l'utilisateur
      const userOrderRef = ref(database, `users/${currentUser.uid}/orders`);
      const newUserOrderRef = push(userOrderRef);
      await update(newUserOrderRef, orderData);

      // Ajouter aux commandes globales
      const globalOrderRef = ref(database, 'orders');
      const newGlobalOrderRef = push(globalOrderRef);
      await update(newGlobalOrderRef, orderData);

      // Vider complètement le panier
      const cartRef = ref(database, `users/${currentUser.uid}/cart`);
      await remove(cartRef);

      navigate(`/thank-you`, { 
        state: { 
          orderId: newGlobalOrderRef.key,
          orderNumber: newOrderNumber 
        } 
      });
    } catch (error) {
      console.error('Erreur lors de la passation de commande:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const cartItems = Object.entries(cart)
      .filter(([key]) => !['number of products', 'total', 'billing_country'].includes(key));
    const subtotal = cartItems.reduce((sum, [_, item]: [string, any]) => 
      sum + (item.price * (item.quantity || 1)), 0);
    return subtotal + 5000; // frais de livraison
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Paiement</h2>
        <p className="mb-4">Veuillez vous connecter pour procéder au paiement</p>
        <motion.button
          className="btn btn-primary"
          onClick={() => navigate('/login')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Connexion
        </motion.button>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const cartItems = Object.entries(cart)
    .filter(([key]) => !['number of products', 'total', 'billing_country'].includes(key));
  const subtotal = cartItems.reduce((sum, [_, item]: [string, any]) => 
    sum + (item.price * (item.quantity || 1)), 0);
  const deliveryFee = 5000;
  const total = subtotal + deliveryFee;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.h2 
        className="text-2xl font-bold mb-6"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        Paiement
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section Informations de Facturation */}
            <motion.div 
              className="card bg-base-100 shadow-md p-6"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-bold mb-4">Informations de Facturation</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Prénom</span>
                    </label>
                    <p className="input input-bordered bg-gray-100">
                      {userData?.name || 'Non renseigné'}
                    </p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Nom</span>
                    </label>
                    <p className="input input-bordered bg-gray-100">
                      {userData?.surname || 'Non renseigné'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <p className="input input-bordered bg-gray-100">
                    {userData?.email || currentUser.email || 'Non renseigné'}
                  </p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Téléphone</span>
                  </label>
                  <p className="input input-bordered bg-gray-100">
                    {userData?.mobileNumber || 'Non renseigné'}
                  </p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Adresse</span>
                  </label>
                  <p className="input input-bordered bg-gray-100">
                    {userData?.street || 'Non renseigné'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Ville</span>
                    </label>
                    <p className="input input-bordered bg-gray-100">
                      {userData?.town || 'Non renseigné'}
                    </p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Code Postal</span>
                    </label>
                    <p className="input input-bordered bg-gray-100">
                      {userData?.zipCode || 'Non renseigné'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Pays</span>
                  </label>
                  <p className="input input-bordered bg-gray-100">
                    {userData?.country || 'Non renseigné'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Section Informations de Livraison */}
            <motion.div 
              className="card bg-base-100 shadow-md p-6"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-bold mb-4">Informations de Livraison</h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Type de Livraison</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value)}
                  >
                    <option value="Agent Son Cadeau">Agent Son Cadeau</option>
                    <option value="Envoi par poste">Envoi par poste</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date de Livraison</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nom du Destinataire</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Pays de Livraison</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={deliveryCountry}
                    onChange={(e) => setDeliveryCountry(e.target.value)}
                  >
                    <option value="Cameroon">Cameroun</option>
                    <option value="France">France</option>
                    <option value="Canada">Canada</option>
                    <option value="USA">États-Unis</option>
                    <option value="Germany">Allemagne</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Section Méthode de Paiement */}
            <motion.div 
              className="card bg-base-100 shadow-md p-6"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-bold mb-4">Méthode de Paiement</h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="radio checked:bg-primary"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <span className="label-text flex items-center">
                      <CreditCardIcon className="h-5 w-5 mr-2" />
                      Carte Bancaire
                    </span>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4 ml-8 border-l-2 pl-4 border-primary overflow-hidden"
                  >
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Numéro de Carte</span>
                      </label>
                      <input
                        type="text"
                        name="number"
                        className="input input-bordered"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={handleCardChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Date d'Expiration</span>
                        </label>
                        <input
                          type="text"
                          name="expiry"
                          className="input input-bordered"
                          placeholder="MM/AA"
                          value={cardDetails.expiry}
                          onChange={handleCardChange}
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">CVV</span>
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          className="input input-bordered"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={handleCardChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Nom sur la Carte</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="input input-bordered"
                        placeholder="Nom tel qu'il apparaît sur la carte"
                        value={cardDetails.name}
                        onChange={handleCardChange}
                        required
                      />
                    </div>
                  </motion.div>
                )}

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="radio checked:bg-primary"
                      checked={paymentMethod === 'mobile_money'}
                      onChange={() => setPaymentMethod('mobile_money')}
                    />
                    <span className="label-text flex items-center">
                      <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
                      Mobile Money
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="radio checked:bg-primary"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                    />
                    <span className="label-text flex items-center">
                      <CurrencyEuroIcon className="h-5 w-5 mr-2" />
                      Paiement à la Livraison
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          </form>
        </motion.div>

        {/* Récapitulatif de Commande */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card bg-base-100 shadow-md p-6 sticky top-4">
            <h3 className="text-xl font-bold mb-4">Votre Commande</h3>
            <div className="border-b pb-4 mb-4">
              {cartItems.map(([key, item]: [string, any], index) => (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between mb-2"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 text-sm ml-2">x {item.quantity || 1}</span>
                  </div>
                  <span>{item.price * (item.quantity || 1)} FCFA</span>
                </motion.div>
              ))}
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{subtotal} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>{deliveryFee} FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>{total} FCFA</span>
              </div>
            </div>
            <motion.button
              type="submit"
              className="btn btn-primary w-full mt-4"
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Passer la Commande'
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;