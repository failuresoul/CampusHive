import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Decode a JWT payload WITHOUT verifying the signature (client-side only).
 * Returns null if the token is malformed or expired.
 */
const decodeToken = (token) => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    // exp is in seconds; Date.now() is in ms
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // expired
    }
    return payload;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate auth state from localStorage on every page load / refresh
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');

    if (storedToken && storedUser) {
      const payload = decodeToken(storedToken);

      if (payload) {
        // Token is present and not expired — restore session
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {
          // Corrupted user JSON — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        // Token expired or malformed — clear stale data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const loginContext = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logoutContext = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
