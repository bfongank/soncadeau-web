import { useEffect, useState } from 'react';
import { database } from '../firebase/firebaseConfig';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  country: string;
  category: string;
  starred: boolean;
  favorite: boolean;
}

interface Country {
  country: string;
  url: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const countriesRef = ref(database, 'Country');
    
    // Fetch countries
    const unsubscribeCountries = onValue(countriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCountries(data);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeCountries();
    };
  }, []);

  useEffect(() => {
    let productsRef;
    
    if (selectedCountry === 'All') {
      productsRef = ref(database, 'products');
    } else {
      productsRef = query(
        ref(database, 'products'),
        orderByChild('country'),
        equalTo(selectedCountry)
      );
    }

    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array and include the id
        const productsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as Omit<Product, 'id'>)
        }));
        
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    });

    return () => unsubscribeProducts();
  }, [selectedCountry]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Our Products
      </motion.h1>
      
      {/* Countries Filter */}
      <div className="mb-8 overflow-x-auto pb-4">
        <motion.div 
          className="flex space-x-4 min-w-max px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* All Countries button */}
          <motion.button
            key="All"
            className={`flex flex-col items-center px-4 py-2 rounded-lg ${selectedCountry === 'All' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setSelectedCountry('All')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-1">
              <span className="text-lg font-bold">🌎</span>
            </div>
            <span className="text-sm font-medium">All</span>
          </motion.button>

          {/* Country buttons */}
          {countries.map((country) => (
            <motion.button
              key={country.country}
              className={`flex flex-col items-center px-4 py-2 rounded-lg ${selectedCountry === country.country ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => setSelectedCountry(country.country)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <div className="w-12 h-12 rounded-full bg-white overflow-hidden mb-1">
                <img 
                  src={country.url} 
                  alt={country.country} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium">{country.country}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <Link to={`/product/${product.id}`}>
                <div className="relative pb-[100%] overflow-hidden">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="absolute h-full w-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {product.starred && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                      ★ Featured
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    {product.favorite && (
                      <span className="text-red-500">❤️</span>
                    )}
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="text-gray-600 text-sm">{product.country}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-gray-600 text-sm capitalize">{product.category}</span>
                  </div>
                  <p className="font-bold text-primary">FCFA {product.price.toLocaleString()}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xl text-gray-600">No products found for {selectedCountry}</p>
          <button 
            onClick={() => setSelectedCountry('All')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Show All Products
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ProductsPage;