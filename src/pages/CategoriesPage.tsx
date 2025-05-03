import { useEffect, useState, useMemo } from 'react';
import { database } from '../firebase/firebaseConfig';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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

interface Category {
    category: string;
    title: string;
    picUrl: string;
}

interface Country {
    country: string;
    url: string;
}

const CategoriesPage = () => {
    const { countryParam, categoryParam } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>(countryParam || 'Cameroun');
    const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'events');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch all necessary data
    useEffect(() => {
        const categoriesRef = ref(database, 'Category');
        const countriesRef = ref(database, 'Country');

        // Fetch categories
        const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setCategories(data);
        });

        // Fetch countries
        const unsubscribeCountries = onValue(countriesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setCountries(data);
        });

        return () => {
            unsubscribeCategories();
            unsubscribeCountries();
        };
    }, []);

    // Fetch products based on filters
    useEffect(() => {
        let productsRef;

        if (selectedCountry === 'All' && selectedCategory === 'All') {
            productsRef = ref(database, 'products');
        }
        else if (selectedCountry !== 'All' && selectedCategory === 'All') {
            productsRef = query(
                ref(database, 'products'),
                orderByChild('country'),
                equalTo(selectedCountry)
            );
        }
        else if (selectedCategory !== 'All' && selectedCountry === 'All') {
            productsRef = query(
                ref(database, 'products'),
                orderByChild('category'),
                equalTo(selectedCategory)
            );
        }
        else {
            // When both country and category are selected
            productsRef = query(
                ref(database, 'products'),
                orderByChild('category_country'),
                equalTo(`${selectedCategory.toLowerCase()}_${selectedCountry}`)
            );
        }

        const unsubscribeProducts = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const productsArray = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...(value as Omit<Product, 'id'>)
                }));
                setProducts(productsArray);
            } else {
                setProducts([]);
            }
            setLoading(false);
        });

        return () => unsubscribeProducts();
    }, [selectedCountry, selectedCategory]);

    // Filter products by search query
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;

        return products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.h1
                className="text-3xl font-bold text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {selectedCategory === 'All' && selectedCountry === 'All'
                    ? 'Tous nos produits'
                    : `${selectedCategory !== 'All' ? `${selectedCategory}` : ''} 
             ${selectedCountry !== 'All' ? `${selectedCountry}` : ''}`}
            </motion.h1>

            {/* Search Bar */}
            <motion.div
                className="mb-8 relative max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Rechercher des produits..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
            </motion.div>

            {/* Countries Filter */}
            <div className="mb-4 overflow-x-auto pb-4">
                <h2 className="text-lg font-semibold mb-2">Pays</h2>
                <motion.div
                    className="flex space-x-4 min-w-max"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {countries.map((country) => (
                        <motion.button
                            key={country.country}
                            className={`px-6 py-2 rounded-full ${selectedCountry === country.country ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                            onClick={() => setSelectedCountry(country.country)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            {country.country}
                        </motion.button>
                    ))}
                </motion.div>
            </div>

            {/* Categories Filter */}
            <div className="mb-8 overflow-x-auto pb-4">
                <h2 className="text-lg font-semibold mb-2">Catégories</h2>
                <motion.div
                    className="flex space-x-4 min-w-max"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {categories.map((category) => (
                        <motion.button
                            key={category.title}
                            className={`px-6 py-2 rounded-full ${selectedCategory === category.category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                            onClick={() => setSelectedCategory(category.category)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            {category.title}
                        </motion.button>
                    ))}
                </motion.div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={item}
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
                                            ★ Vedette
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
                    <p className="text-xl text-gray-600">
                        {searchQuery
                            ? `Aucun produit trouvé pour "${searchQuery}"`
                            : `Aucun produit trouvé ${selectedCountry !== 'All' ? `en ${selectedCountry}` : ''} ${selectedCategory !== 'All' ? `dans la catégorie ${selectedCategory}` : ''}`}
                    </p>
                    <button
                        onClick={() => {
                            setSelectedCountry('All');
                            setSelectedCategory('All');
                            setSearchQuery('');
                        }}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Réinitialiser les filtres
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default CategoriesPage;