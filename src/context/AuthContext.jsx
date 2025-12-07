import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simple local authentication for admin panel
      // In production, you should use Supabase Auth or another secure authentication method
      // For now, using a simple check (you can configure this in environment variables)
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@evsu.edu.ph';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
      
      if (email === adminEmail && password === adminPassword) {
        const userData = {
          id: '1',
          email: email,
          name: 'Administrator',
          role: 'admin',
          isAdmin: true,
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'local-admin-token'); // Simple token for local auth
        setUser(userData);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: 'Invalid email or password. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.isAdmin === true;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: isAdmin(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

