/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';

// Helper to scroll to top on route change
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, search]);
  return null;
}

// Lazy load pages for better performance
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';
import AdminLogin from './pages/AdminLogin';
import MyOrders from './pages/MyOrders';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-pink-100">
        <Header />
        <main className="container mx-auto px-4 py-2">
          <Routes>
            <Route path="/" element={<Shop />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/old-home" element={<Home />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/admin" element={<AdminLayout />}>
               <Route index element={<Dashboard />} />
               <Route path="products" element={<AdminProducts />} />
               <Route path="orders" element={<AdminOrders />} />
               <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>
        </main>
        <Footer />
        
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '0px',
              border: '4px solid #1c1917',
              fontFamily: 'Space Grotesk',
              fontWeight: '900',
              fontSize: '11px',
              padding: '16px 20px',
              background: '#ffffff',
              color: '#1c1917',
              boxShadow: '8px 8px 0px 0px rgba(255,0,127,1)',
              width: '100%',
              maxWidth: '350px',
            },
          }}
        />
      </div>
    </Router>
  );
}
