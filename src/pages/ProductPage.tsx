import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { database } from '../firebase/firebaseConfig';
import { ref, onValue, push, set, get } from 'firebase/database';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, HeartIcon as HeartOutline, CalendarIcon, CameraIcon, PencilIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { currentUser } = useUser();
  const [cartStatus, setCartStatus] = useState<'idle' | 'adding' | 'added'>('idle');
  const [wishlistStatus, setWishlistStatus] = useState<'idle' | 'adding' | 'added'>('idle');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Check if product is in wishlist
  useEffect(() => {
    if (!currentUser || !product) return;

    const wishlistRef = ref(database, `users/${currentUser.uid}/wished products`);
    onValue(wishlistRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const isInWishlist = Object.values(data).some(
          (item: any) => item.id === product.id
        );
        setWishlistStatus(isInWishlist ? 'added' : 'idle');
      }
    });
  }, [currentUser, product]);

  useEffect(() => {
    const productRef = ref(database, `products/${id}`);
    onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      setProduct({ ...data, id: id });
      setLoading(false);
    });
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const addToCart = async () => {
    if (!currentUser || !product) return;
    
    setCartStatus('adding');
    try {
      const cartRef = ref(database, `users/${currentUser.uid}/cart`);
      const cartItem: any = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images ? product.images[selectedImage] : product.image,
        country: product.country
      };

      // Add customization options if they exist
      if (product.hasSize && selectedSize) {
        cartItem.size = selectedSize;
      }
      if (product.hasDate && selectedDate) {
        cartItem.customDate = selectedDate;
      }
      if (product.hasText && customText) {
        cartItem.customText = customText;
      }
      if (product.hasPhoto && previewImage) {
        cartItem.customPhoto = previewImage; // In a real app, you'd upload this to storage
      }

      await push(cartRef, cartItem);
      setCartStatus('added');
      setTimeout(() => setCartStatus('idle'), 2000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setCartStatus('idle');
    }
  };

  const toggleWishlist = async () => {
    if (!currentUser || !product) return;

    setWishlistStatus('adding');
    try {
      const wishlistRef = ref(database, `users/${currentUser.uid}/wished products`);
      
      if (wishlistStatus === 'added') {
        // Find and remove from wishlist
        const snapshot = await get(wishlistRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const entry = Object.entries(data).find(
            ([_, item]: [string, any]) => item.id === product.id
          );
          if (entry) {
            const [key] = entry;
            const itemRef = ref(database, `users/${currentUser.uid}/wished products/${key}`);
            await set(itemRef, null);
          }
        }
        setWishlistStatus('idle');
      } else {
        // Add to wishlist
        await push(wishlistRef, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images ? product.images[selectedImage] : product.image,
          country: product.country
        });
        setWishlistStatus('added');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la liste de souhaits:', error);
      setWishlistStatus(wishlistStatus === 'added' ? 'added' : 'idle');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-10">Produit non trouvé</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <motion.div 
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <img 
              src={product.images ? product.images[selectedImage] : product.image} 
              alt={product.name} 
              className="w-full h-96 object-contain rounded-lg"
            />
          </motion.div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img: string, index: number) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 flex-shrink-0 ${selectedImage === index ? 'ring-2 ring-pink-500' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-pink-600 font-bold mb-4">{product.price} FCFA</p>
          
          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Customization Sections */}
          <div className="space-y-4 mb-6">
            {product.hasSize && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h3 className="font-medium">Taille</h3>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md ${selectedSize === size ? 'bg-pink-100 border-pink-500' : 'border-gray-300'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {product.hasDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h3 className="font-medium">Date de livraison</h3>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 input input-bordered w-full"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </motion.div>
            )}

            {product.hasText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h3 className="font-medium">Texte personnalisé</h3>
                <div className="relative">
                  <PencilIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="pl-10 input input-bordered w-full min-h-[100px]"
                    placeholder="Entrez votre texte personnalisé ici"
                    maxLength={100}
                  />
                </div>
              </motion.div>
            )}

            {product.hasPhoto && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h3 className="font-medium">Photo personnalisée</h3>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-pink-500 transition">
                  <CameraIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {previewImage ? 'Photo sélectionnée' : 'Cliquez pour télécharger une photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {previewImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2"
                  >
                    <img 
                      src={previewImage} 
                      alt="Aperçu de la photo personnalisée" 
                      className="h-24 w-24 object-cover rounded-md" 
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          <div className="flex gap-4">
            <motion.button 
              onClick={addToCart}
              className="btn btn-primary flex-1 relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={cartStatus !== 'idle'}
            >
              <AnimatePresence mode="wait">
                {cartStatus === 'idle' && (
                  <motion.span
                    key="add-to-cart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Ajouter au panier
                  </motion.span>
                )}
                {cartStatus === 'adding' && (
                  <motion.span
                    key="adding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Ajout en cours...
                  </motion.span>
                )}
                {cartStatus === 'added' && (
                  <motion.div
                    key="added"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="h-5 w-5" />
                    <span>Ajouté!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {currentUser && (
              <motion.button 
                onClick={toggleWishlist}
                className={`btn btn-primary flex-1 gap-2 ${wishlistStatus === 'added' ? '!bg-pink-50' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={wishlistStatus === 'adding'}
              >
                <AnimatePresence mode="wait">
                  {wishlistStatus === 'adding' ? (
                    <motion.span
                      key="wishlist-adding"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Traitement...
                    </motion.span>
                  ) : wishlistStatus === 'added' ? (
                    <motion.div
                      key="wishlist-added"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-pink-600"
                    >
                      <HeartSolid className="h-5 w-5" />
                      <span>Dans la liste</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="wishlist-idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <HeartOutline className="h-5 w-5" />
                      <span>Liste de souhaits</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductPage;