import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userData');

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        setUser(JSON.parse(storedUser));

        const expiryTime = decoded.exp * 1000;
        const timeLeft = expiryTime - Date.now();

        if (timeLeft > 0) {
          setTimeout(logout, timeLeft);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, []);

  const login = (token, userData) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));

      const decoded = jwtDecode(token);
      setUser(userData);

      const expiryTime = decoded.exp * 1000;
      const timeLeft = expiryTime - Date.now();

      if (timeLeft > 0) {
        setTimeout(logout, timeLeft);
      }

      return userData;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
