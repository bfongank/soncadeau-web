// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import CategoriesPage from './pages/CategoriesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import AdminLayout from './components/AdminLayout';
import ProductsPage from './pages/ProductsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import AllProductsPage from './pages/admin/AllProductsPage';
import AllOrdersPage from './pages/admin/AllOrdersPage';
import AllCustomersPage from './pages/admin/AllCustomersPage';
import WhatsAppWidget from './components/WhatsAppWidget';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThankYouPage from './pages/ThankYouPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import NotFoundPage from './pages/404';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="products" element={<AllProductsPage />} />
                <Route path="orders" element={<AllOrdersPage />} />
                <Route path="customers" element={<AllCustomersPage />} />
              </Route>
            </Routes>
          </main>
          <Footer />
          <WhatsAppWidget />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;