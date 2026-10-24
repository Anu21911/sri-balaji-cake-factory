import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sbi_customer_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await api.getCustomerMe();
          if (res.success && res.user) {
            setCustomer(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Customer session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (mobile, password) => {
    const res = await api.customerLogin({ mobile, password });
    if (res.success) {
      localStorage.setItem('sbi_customer_token', res.token);
      setToken(res.token);
      setCustomer(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.customerRegister(userData);
    if (res.success) {
      localStorage.setItem('sbi_customer_token', res.token);
      setToken(res.token);
      setCustomer(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('sbi_customer_token');
    setToken(null);
    setCustomer(null);
  };

  const saveAddress = async (addrData) => {
    const res = await api.saveCustomerAddress(addrData);
    if (res.success && customer) {
      setCustomer({
        ...customer,
        addresses: res.addresses
      });
    }
    return res;
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: !!customer,
        loading,
        login,
        register,
        logout,
        saveAddress
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
