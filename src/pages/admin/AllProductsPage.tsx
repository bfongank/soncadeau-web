import { useState, useEffect } from 'react';
import { database, storage } from '../../firebase/firebaseConfig';
import { ref as dbRef, onValue, push, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const AllProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'edit'>('view');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'packs',
    category_country: 'packs_Cameroun',
    country: 'Cameroun',
    color: [0.976, 0.512, 0.583],
    favorite: false,
    hasDate: false,
    hasPhoto: false,
    hasSize: false,
    hasText: false,
    image: '',
    images: [],
    inCart: false,
    isWished: false,
    starred: false
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const productsRef = dbRef(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as any)
        }));
        setProducts(productsArray);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return '';

    setUploading(true);
    try {
      const fileRef = storageRef(storage, `products/${Date.now()}_${selectedFile.name}`);
      const snapshot = await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      return '';
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageUrl = await uploadImage();
    
    const productToAdd = {
      ...newProduct,
      image: imageUrl,
      images: imageUrl ? [imageUrl] : []
    };

    try {
      const productsRef = dbRef(database, 'products');
      await push(productsRef, productToAdd);
      resetForm();
      setActiveTab('view');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = editingProduct.image;
    
    if (selectedFile) {
      imageUrl = await uploadImage();
    }

    const productToUpdate = {
      ...editingProduct,
      image: imageUrl,
      images: imageUrl ? [imageUrl, ...editingProduct.images.filter((img: string) => img !== imageUrl)] : editingProduct.images
    };

    try {
      const productRef = dbRef(database, `products/${editingProduct.id}`);
      await update(productRef, productToUpdate);
      resetForm();
      setActiveTab('view');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const productRef = dbRef(database, `products/${productId}`);
        await remove(productRef);
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
      }
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      category: 'packs',
      category_country: 'packs_Cameroun',
      country: 'Cameroun',
      color: [0.976, 0.512, 0.583],
      favorite: false,
      hasDate: false,
      hasPhoto: false,
      hasSize: false,
      hasText: false,
      image: '',
      images: [],
      inCart: false,
      isWished: false,
      starred: false
    });
    setSelectedFile(null);
    setEditingProduct(null);
  };

  const startEditing = (product: any) => {
    setEditingProduct(product);
    setActiveTab('edit');
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
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
        Tous les Produits
      </motion.h1>
      
      <div className="flex mb-6 border-b">
        <motion.button
          className={`px-4 py-2 font-medium ${activeTab === 'view' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('view')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Voir les Produits
        </motion.button>
        <motion.button
          className={`px-4 py-2 font-medium ${activeTab === 'add' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => {
            resetForm();
            setActiveTab('add');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Ajouter un Produit
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'view' ? (
          <motion.div
            key="view"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product, i) => (
                    <motion.tr 
                      key={product.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={itemVariants}
                      whileHover={{ backgroundColor: 'rgba(243, 244, 246, 1)' }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={product.image} alt={product.name} className="h-10 w-10 rounded-full object-cover" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.price} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <motion.button 
                          className="text-indigo-600 hover:text-indigo-900 mr-4 flex items-center"
                          onClick={() => startEditing(product)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5 mr-1" />
                          Modifier
                        </motion.button>
                        <motion.button 
                          className="text-red-600 hover:text-red-900 flex items-center"
                          onClick={() => handleDeleteProduct(product.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5 mr-1" />
                          Supprimer
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-xl font-bold mb-4">
              {activeTab === 'add' ? 'Ajouter un Nouveau Produit' : 'Modifier le Produit'}
            </h2>
            <form onSubmit={activeTab === 'add' ? handleAddProduct : handleUpdateProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Produit</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={activeTab === 'add' ? newProduct.name : editingProduct?.name}
                    onChange={(e) => activeTab === 'add' 
                      ? setNewProduct({...newProduct, name: e.target.value}) 
                      : setEditingProduct({...editingProduct, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={activeTab === 'add' ? newProduct.price : editingProduct?.price}
                    onChange={(e) => activeTab === 'add' 
                      ? setNewProduct({...newProduct, price: Number(e.target.value)}) 
                      : setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={activeTab === 'add' ? newProduct.category : editingProduct?.category}
                    onChange={(e) => activeTab === 'add' 
                      ? setNewProduct({...newProduct, category: e.target.value}) 
                      : setEditingProduct({...editingProduct, category: e.target.value})}
                    required
                  >
                    <option value="packs">Packs</option>
                    <option value="cartes">Cartes</option>
                    <option value="autres">Autres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={activeTab === 'add' ? newProduct.country : editingProduct?.country}
                    onChange={(e) => activeTab === 'add' 
                      ? setNewProduct({...newProduct, country: e.target.value}) 
                      : setEditingProduct({...editingProduct, country: e.target.value})}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={activeTab === 'add' ? newProduct.description : editingProduct?.description}
                    onChange={(e) => activeTab === 'add' 
                      ? setNewProduct({...newProduct, description: e.target.value}) 
                      : setEditingProduct({...editingProduct, description: e.target.value})}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image du Produit
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {uploading && <p className="text-sm text-gray-500 mt-1">Téléchargement en cours...</p>}
                  {activeTab === 'edit' && editingProduct?.image && !selectedFile && (
                    <div className="mt-2">
                      <img 
                        src={editingProduct.image} 
                        alt="Current product" 
                        className="h-20 w-20 object-cover rounded"
                      />
                      <p className="text-sm text-gray-500 mt-1">Image actuelle</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary"
                      checked={activeTab === 'add' ? newProduct.favorite : editingProduct?.favorite}
                      onChange={(e) => activeTab === 'add' 
                        ? setNewProduct({...newProduct, favorite: e.target.checked}) 
                        : setEditingProduct({...editingProduct, favorite: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Favori</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary"
                      checked={activeTab === 'add' ? newProduct.hasDate : editingProduct?.hasDate}
                      onChange={(e) => activeTab === 'add' 
                        ? setNewProduct({...newProduct, hasDate: e.target.checked}) 
                        : setEditingProduct({...editingProduct, hasDate: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Avec Date</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary"
                      checked={activeTab === 'add' ? newProduct.hasPhoto : editingProduct?.hasPhoto}
                      onChange={(e) => activeTab === 'add' 
                        ? setNewProduct({...newProduct, hasPhoto: e.target.checked}) 
                        : setEditingProduct({...editingProduct, hasPhoto: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Avec Photo</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary"
                      checked={activeTab === 'add' ? newProduct.hasSize : editingProduct?.hasSize}
                      onChange={(e) => activeTab === 'add' 
                        ? setNewProduct({...newProduct, hasSize: e.target.checked}) 
                        : setEditingProduct({...editingProduct, hasSize: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Avec Taille</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary"
                      checked={activeTab === 'add' ? newProduct.hasText : editingProduct?.hasText}
                      onChange={(e) => activeTab === 'add' 
                        ? setNewProduct({...newProduct, hasText: e.target.checked}) 
                        : setEditingProduct({...editingProduct, hasText: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Avec Texte</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary"
                      checked={activeTab === 'add' ? newProduct.starred : editingProduct?.starred}
                      onChange={(e) => activeTab === 'add' 
                        ? setNewProduct({...newProduct, starred: e.target.checked}) 
                        : setEditingProduct({...editingProduct, starred: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Mise en avant</span>
                  </label>
                </div>
              </div>
              <div className="mt-6">
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={uploading}
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  {activeTab === 'add' ? 'Ajouter le Produit' : 'Mettre à Jour'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllProductsPage;