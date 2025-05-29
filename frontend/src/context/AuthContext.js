import { createContext, useState, useContext } from 'react';
import { useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    role: null,
    idNumber: null
  });

  const login = (role, idNumber) => {
    localStorage.setItem('auth', JSON.stringify({ isLoggedIn: true, role, idNumber}));
    setAuth({ isLoggedIn: true, role, idNumber });
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setAuth({ isLoggedIn: false, role: null, idNumber: null });
  };

  // Initial check for login status
  useEffect(() => {
    const savedAuth = JSON.parse(localStorage.getItem('auth'));
    if (savedAuth?.isLoggedIn) {
      setAuth(savedAuth);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook
export function useAuth() {
  return useContext(AuthContext);
}