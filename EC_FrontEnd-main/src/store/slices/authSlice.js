import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';

// JWT token decoder function
function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

// Initial auth state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Load saved user and token from localStorage
const savedUser = typeof localStorage !== 'undefined' && localStorage.getItem('user');
const savedToken = typeof localStorage !== 'undefined' && localStorage.getItem('token');

if (savedToken) {
  try {
    // Always decode the token to ensure we have fresh data
    const decodedToken = decodeToken(savedToken);
    
    // If token is valid and we could decode it
    if (decodedToken) {
      // Parse saved user if available
      let userObj = null;
      if (savedUser) {
        userObj = JSON.parse(savedUser);
      }
      
      // If no saved user or needs enhancement with token data
      if (!userObj || !userObj.roles) {
        userObj = {
          ...userObj,
          // Use subject from token as ID if not present
          id: userObj?.id || decodedToken.sub || '',
          // Extract email if available
          email: userObj?.email || decodedToken.email || '',
          // Get roles from token
          roles: decodedToken.roles || [],
        };
        
        // Save enhanced user data
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userObj));
        }
      }
      
      initialState.user = userObj;
      initialState.token = savedToken;
      initialState.isAuthenticated = true;
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    } else {
      // Token is invalid, clear localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  } catch (e) {
    console.error('Error initializing auth state:', e);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
}

// Slice definition
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      delete axios.defaults.headers.common['Authorization'];
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logoutSuccess } = authSlice.actions;

// 🔐 Login thunk - Updated to handle token-only response and decode JWT
export const login = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  
  try {
    const res = await axios.post('http://localhost:8080/auth/login', credentials);
    console.log('Login response:', res.data); // Debug response format
    
    // Handle token-only response format
    let token;
    
    // Check if response contains a token directly or in a nested object
    if (typeof res.data === 'string') {
      // API returns token directly as a string
      token = res.data;
    } else if (res.data.token || res.data.accessToken || res.data.jwt) {
      // API returns object with token property
      token = res.data.token || res.data.accessToken || res.data.jwt;
    } else {
      console.error('Unexpected login response format:', res.data);
      throw new Error('Invalid login response format');
    }
    
    // Decode the token to extract user info including roles
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      throw new Error('Invalid token received');
    }
    
    // Extract user information from token
    const user = {
      // The 'sub' claim typically contains the username or user ID
      id: decodedToken.sub || '',
      // Email might be in the token
      email: decodedToken.email || credentials.email || '',
      // Get roles from token
      roles: decodedToken.roles || [],
      // Extract any other useful claims
      name: decodedToken.name || '',
      // Add expiration time if available
      exp: decodedToken.exp || null,
    };
    
    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Update Redux state
    dispatch(loginSuccess({ token, user }));
    toast.success('Login successful');
  } catch (err) {
    console.error('Login error:', err);
    
    let msg = 'Login failed';
    
    if (err.response) {
      if (err.response.status === 401) {
        msg = 'Wrong credentials';
      } else if (err.response.data?.message) {
        msg = err.response.data.message;
      }
    } else if (err.message) {
      msg = err.message;
    }
    
    dispatch(loginFailure(msg));
    toast.error(msg);
  }
};

// 🔓 Logout thunk
export const logout = () => (dispatch) => {
  dispatch(logoutSuccess());
  toast.success('Logged out');
};

// Utility to check if user has specific role
export const hasRole = (state, role) => {
  const { user } = state.auth;
  
  if (!user) return false;
  
  // Check in roles array (from JWT token)
  if (Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  
  // Fallback to legacy single role property
  return user.role === role;
};

export default authSlice.reducer;