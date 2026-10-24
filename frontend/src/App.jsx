import React, { useState, useEffect } from 'react';
import { CustomerAuthProvider, useCustomerAuth } from './context/CustomerAuthContext';
import { OwnerAuthProvider, useOwnerAuth } from './context/OwnerAuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { api } from './services/api';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CustomerAuthModal from './components/CustomerAuthModal';
import CustomerOrdersModal from './components/CustomerOrdersModal';

// Pages & Portals
import HomePage from './pages/customer/HomePage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OwnerLoginPage from './pages/owner/OwnerLoginPage';
import OwnerDashboardLayout from './pages/owner/OwnerDashboardLayout';

function MainApp() {
  const [activePortal, setActivePortal] = useState('customer'); // 'customer' or 'owner'
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Modals & In-app drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { isAuthenticated: isOwnerAuthenticated } = useOwnerAuth();
  const { isAuthenticated: isCustomerAuthenticated } = useCustomerAuth();

  // Load products on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.getProducts();
        if (res.success) {
          setProducts(res.products || []);
        }
      } catch (err) {
        console.warn('Could not load products:', err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const handleSwitchPortal = (portal) => {
    setActivePortal(portal);
    setIsCheckoutOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCheckout = () => {
    if (!isCustomerAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-bakery-50 text-stone-800">
      
      {/* Top Navbar with Two Main Portals Switcher */}
      <Navbar
        activePortal={activePortal}
        onSwitchPortal={handleSwitchPortal}
        onOpenCustomerAuth={() => setIsAuthModalOpen(true)}
        onOpenMyOrders={() => setIsOrdersModalOpen(true)}
      />

      {/* Main Single Web Application Views */}
      <div className="flex-1">
        {activePortal === 'customer' ? (
          isCheckoutOpen ? (
            <CheckoutPage
              onNavigate={(page) => {
                if (page === 'home' || page === 'menu') {
                  setIsCheckoutOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (page === 'my-orders') {
                  setIsCheckoutOpen(false);
                  setIsOrdersModalOpen(true);
                }
              }}
            />
          ) : (
            <HomePage
              products={products}
              onNavigate={(page) => {
                if (page === 'checkout') {
                  handleOpenCheckout();
                } else if (page === 'my-orders' || page === 'my-custom-requests') {
                  setIsOrdersModalOpen(true);
                } else if (page === 'customer-auth') {
                  setIsAuthModalOpen(true);
                } else if (page === 'owner-login') {
                  setActivePortal('owner');
                } else {
                  const targetId = page === 'menu' ? 'cakes-menu-section' : page === 'celebrations' ? 'celebrations-section' : 'custom-idea-section';
                  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )
        ) : (
          /* Owner Portal */
          isOwnerAuthenticated ? (
            <OwnerDashboardLayout
              onNavigate={(page) => {
                if (page === 'home' || page === 'menu') {
                  setActivePortal('customer');
                  setIsCheckoutOpen(false);
                } else if (page === 'owner-login') {
                  setActivePortal('owner');
                }
              }}
            />
          ) : (
            <OwnerLoginPage
              onNavigate={(page) => {
                if (page === 'owner-dashboard') {
                  setActivePortal('owner');
                } else {
                  setActivePortal('customer');
                }
              }}
            />
          )
        )}
      </div>

      {/* Footer on Customer Portal */}
      {activePortal === 'customer' && !isCheckoutOpen && (
        <Footer
          onNavigate={(target) => {
            if (target === 'owner-login') {
              setActivePortal('owner');
            } else if (target === 'my-orders') {
              setIsOrdersModalOpen(true);
            } else {
              const targetId = target === 'menu' ? 'cakes-menu-section' : target === 'celebrations' ? 'celebrations-section' : 'custom-idea-section';
              document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={handleOpenCheckout}
        onNavigate={(target) => {
          const targetId = target === 'menu' ? 'cakes-menu-section' : 'celebrations-section';
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Customer Login / Sign Up Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />

      {/* Customer Orders & Tracking Modal */}
      <CustomerOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <CustomerAuthProvider>
      <OwnerAuthProvider>
        <CartProvider>
          <SocketProvider>
            <MainApp />
          </SocketProvider>
        </CartProvider>
      </OwnerAuthProvider>
    </CustomerAuthProvider>
  );
}
