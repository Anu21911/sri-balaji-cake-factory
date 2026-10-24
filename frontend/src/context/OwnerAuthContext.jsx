import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const OwnerAuthContext = createContext(null);

export function OwnerAuthProvider({ children }) {
  const [owner, setOwner] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sbi_owner_token'));
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyOwner() {
      if (token) {
        try {
          const res = await api.getOwnerMe();
          if (res.success && res.owner) {
            setOwner(res.owner);
            setMustChangePassword(!!res.owner.mustChangePassword);
          } else if (res.mustChangePassword) {
            setMustChangePassword(true);
            setOwner({ name: 'RAKESH', mobile: '9963390327', role: 'owner', mustChangePassword: true });
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Owner verification check:', err.message);
          if (err.data?.mustChangePassword || (err.status === 403 && err.data?.mustChangePassword)) {
            setMustChangePassword(true);
            setOwner({ name: 'RAKESH', mobile: '9963390327', role: 'owner', mustChangePassword: true });
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    }
    verifyOwner();
  }, [token]);

  const login = async (mobile, password) => {
    const res = await api.ownerLogin({ mobile, password });
    if (res.success) {
      localStorage.setItem('sbi_owner_token', res.token);
      setToken(res.token);
      setOwner(res.owner);
      setMustChangePassword(!!res.owner.mustChangePassword);
      return res;
    }
    throw new Error(res.message || 'Owner authentication failed');
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.ownerChangePassword({ currentPassword, newPassword });
    if (res.success) {
      setMustChangePassword(false);
      if (owner) {
        setOwner({ ...owner, mustChangePassword: false });
      }
      return res;
    }
    throw new Error(res.message || 'Failed to update password');
  };

  const logout = () => {
    localStorage.removeItem('sbi_owner_token');
    setToken(null);
    setOwner(null);
    setMustChangePassword(false);
  };

  return (
    <OwnerAuthContext.Provider
      value={{
        owner,
        token,
        isAuthenticated: !!owner,
        mustChangePassword,
        loading,
        login,
        changePassword,
        logout
      }}
    >
      {children}
    </OwnerAuthContext.Provider>
  );
}

export function useOwnerAuth() {
  const context = useContext(OwnerAuthContext);
  if (!context) {
    throw new Error('useOwnerAuth must be used within an OwnerAuthProvider');
  }
  return context;
}
