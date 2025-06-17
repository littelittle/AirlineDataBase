// src/context/AuthContext.js
import axios from 'axios';
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    role: null,
    idNumber: null,
    token: null, // Assuming you might use tokens
    username: null // Store username in auth state as well
  });

  // LOGIN Function (updated to store username)
  const login = async (username, password) => {
    try {
      console.log("Attempting to log in with username:", username);
      console.log("API URL:", process.env.REACT_APP_API_URL)
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/login`, { 
        params: { username, password } 
      });
      console.log("Login response:", response);
      const userData = await response.data; // Expect { role, idNumber, token, username } NOTE: response.data not repsonse 
      console.log("登录成功，用户数据:", userData);
      const authData = {
        isLoggedIn: true,
        role: userData.role,
        idNumber: userData.idNumber,
        token: userData.token,
        username: userData.username // Store username
      };
      localStorage.setItem('auth', JSON.stringify(authData));
      // Also store token separately for easy access in API calls
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      setAuth(authData);
      return { success: true, role: userData.role }; // Return role for navigation
    } catch (error) {
      if (error.response && error.response.status===401){
        alert(`登录失败：${error.response.data.Error || '用户名或密码不正确'}`);
        return {success: false, message:error.response.data.Error};
      }
      else {
      console.error("登录时发生错误:", error);
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      setAuth({ isLoggedIn: false, role: null, idNumber: null, token: null, username: null });
      throw error; // Re-throw error to be caught by LoginPage
      }
    }
  };

  // LOGOUT Function (updated to clear username)
  const logout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
    setAuth({ isLoggedIn: false, role: null, idNumber: null, token: null, username: null });
  };

  // REGISTER Function (New)
  const register = async (userdata) => {
    // userData should be an object: { username, password, idNumber }
    // Role will be defaulted to 'passenger'
    try {
      // const response = await fetch('/api/auth/register', { // Example API endpoint
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...userData, role: 'passenger' }), // Add role here
      // });
      console.log(userdata)
      const {username, password} = userdata
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/register`, { 
        params: { username, password } 
      });
      const userData = await response.data;
      console.log("注册成功，用户数据:", userData);
      // const registeredUser = await response.json(); // Optional: if backend returns user data
      return { success: true, message: '注册成功！请登录。' };
    } catch (error) {
      if (error.response.status===401){
        alert(`用户名已存在：${error.response.data.Error || '请更换用户名'}`);
        return {success: false, message:error.response.data.Error};
      }
      else{
      console.error("注册时发生错误:", error);
      throw error; // Re-throw error to be caught by RegisterPage
      }
    }
  };


  useEffect(() => {
    const savedAuthString = localStorage.getItem('auth');
    if (savedAuthString) {
        try {
            const savedAuth = JSON.parse(savedAuthString);
            if (savedAuth?.isLoggedIn && savedAuth?.token) {
                // TODO: we should add an API call here to verify token validity
                setAuth(savedAuth);
            } else {
                localStorage.removeItem('auth'); // Clear invalid/incomplete auth data
            }
        } catch (error) {
            console.error("解析localStorage中的auth数据失败:", error);
            localStorage.removeItem('auth');
        }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, register }}> {/* Add register here */}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}