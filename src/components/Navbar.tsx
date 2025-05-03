import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { auth, database } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue } from 'firebase/database';

const Navbar = () => {
    const { currentUser, userData } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
    const location = useLocation();
    const [cartItemCount, setCartItemCount] = useState(0);

    // Fetch cart item count
    useEffect(() => {
        if (!currentUser) return;

        const cartRef = ref(database, `users/${currentUser.uid}/cart`);
        const unsubscribe = onValue(cartRef, (snapshot) => {
            const cartData = snapshot.val();
            const count = cartData ? Object.keys(cartData).filter(key => !['number of products','total'].includes(key)).length : 0;
            setCartItemCount(count);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    const isAdmin = currentUser && userData?.role === 'admin';

    // Nav items configuration
    const navItems = [
        { path: '/', label: 'Accueil' },
        ...(currentUser
            ? [
                { path: '/categories', label: 'Produits' },
                { path: '/wishlist', label: 'Liste de souhaits' },
                { path: '/orders', label: 'Commandes' },
                { path: '/account', label: userData?.name || 'Mon compte' },
                ...(isAdmin
                    ? [
                        { 
                            label: 'Admin', 
                            subItems: [
                                { path: '/admin/products', label: 'Tous les produits' },
                                { path: '/admin/orders', label: 'Toutes les commandes' },
                                { path: '/admin/customers', label: 'Tous les clients' },
                            ]
                        }
                    ]
                    : []),
                { path: '', label: 'Déconnexion', action: handleLogout },
            ]
            : [
                { path: '/products', label: 'Produits' },
                { path: '/login', label: 'Connexion' },
                { path: '/register', label: 'Inscription' },
            ]),
        { path: '/cart', label: 'Panier', icon: true },
    ];

    // Animation variants
    const mobileMenuVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { 
            opacity: 1, 
            height: 'auto',
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        exit: { 
            opacity: 0, 
            height: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    };

    const navItemVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.2
            }
        },
        exit: { 
            opacity: 0, 
            y: -10,
            transition: {
                duration: 0.2
            }
        }
    };

    const countBubbleVariants = {
        initial: { scale: 0 },
        animate: { scale: 1 },
        exit: { scale: 0 }
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to="/" className="flex items-center">
                            <img
                                src="https://firebasestorage.googleapis.com/v0/b/soncadeau-a01ed.appspot.com/o/son_cadeau_512-removebg-preview.png?alt=media&token=e22241c1-47e5-4998-82ac-e36576ce210a"
                                alt="Logo Son Cadeau"
                                className="h-16 md:h-10 lg:h-12 w-auto transition-opacity hover:opacity-90"
                                loading="eager"
                            />
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item, index) => (
                            <motion.div 
                                key={index}
                                className="relative"
                                initial="hidden"
                                animate="visible"
                                variants={navItemVariants}
                                custom={index}
                                onMouseEnter={item.subItems ? () => setAdminDropdownOpen(true) : undefined}
                                onMouseLeave={item.subItems ? () => setAdminDropdownOpen(false) : undefined}
                            >
                                {item.path ? (
                                    <Link 
                                        to={item.path} 
                                        className={`nav-link text-gray-700 hover:text-primary relative px-2 py-1 flex items-center ${item.icon ? 'gap-1' : ''}`}
                                    >
                                        {item.icon ? (
                                            <>
                                                <div className="relative">
                                                    <ShoppingCartIcon className="h-6 w-6" />
                                                    {cartItemCount > 0 && (
                                                        <motion.span
                                                            variants={countBubbleVariants}
                                                            initial="initial"
                                                            animate="animate"
                                                            exit="exit"
                                                            className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                                                        >
                                                            {cartItemCount}
                                                        </motion.span>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            item.label
                                        )}
                                        {location.pathname === item.path && (
                                            <motion.div 
                                                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                                                layoutId="navUnderline"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 30
                                                }}
                                            />
                                        )}
                                    </Link>
                                ) : item.subItems ? (
                                    <div className="relative">
                                        <button
                                            className="nav-link text-gray-700 hover:text-primary flex items-center gap-1"
                                            onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                                        >
                                            {item.label}
                                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {adminDropdownOpen && (
                                                <motion.div
                                                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                                                    variants={dropdownVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                >
                                                    {item.subItems.map((subItem, subIndex) => (
                                                        <Link
                                                            key={subIndex}
                                                            to={subItem.path}
                                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary"
                                                            onClick={() => setAdminDropdownOpen(false)}
                                                        >
                                                            {subItem.label}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <button
                                        onClick={item.action}
                                        className="nav-link text-gray-700 hover:text-primary"
                                    >
                                        {item.label}
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        <Link 
                            to="/cart" 
                            className="relative p-2 text-gray-700 hover:text-primary"
                        >
                            <ShoppingCartIcon className="h-6 w-6" />
                            {cartItemCount > 0 && (
                                <motion.span
                                    variants={countBubbleVariants}
                                    initial="initial"
                                    animate="animate"
                                    className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                                >
                                    {cartItemCount}
                                </motion.span>
                            )}
                        </Link>
                        <motion.button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-gray-700 hover:text-primary"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {mobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="md:hidden bg-white shadow-md overflow-hidden"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={mobileMenuVariants}
                    >
                        <div className="container px-4 py-2 space-y-2">
                            {navItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={navItemVariants}
                                    custom={index}
                                >
                                    {item.path ? (
                                        <Link
                                            to={item.path}
                                            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === item.path ? 'text-primary' : 'text-gray-700 hover:text-primary'} hover:bg-gray-50 flex items-center ${item.icon ? 'gap-2' : ''}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.icon && <ShoppingCartIcon className="h-5 w-5" />}
                                            {item.label}
                                            {item.icon && cartItemCount > 0 && (
                                                <span className="ml-auto bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {cartItemCount}
                                                </span>
                                            )}
                                        </Link>
                                    ) : item.subItems ? (
                                        <div className="space-y-1">
                                            <button
                                                className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                                                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                                            >
                                                {item.label}
                                                <ChevronDownIcon className={`h-4 w-4 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {adminDropdownOpen && (
                                                <div className="pl-4 space-y-1">
                                                    {item.subItems.map((subItem, subIndex) => (
                                                        <Link
                                                            key={subIndex}
                                                            to={subItem.path}
                                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                                                            onClick={() => {
                                                                setMobileMenuOpen(false);
                                                                setAdminDropdownOpen(false);
                                                            }}
                                                        >
                                                            {subItem.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                item.action?.();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                                        >
                                            {item.label}
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;