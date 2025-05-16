import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';

// Helper: Decode JWT token
function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');

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

// Setup initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Load from localStorage (and validate expiration)
const savedToken = typeof localStorage !== 'undefined' && localStorage.getItem('token');
const savedUser = typeof localStorage !== 'undefined' && localStorage.getItem('user');

if (savedToken) {
  try {
    const decoded = decodeToken(savedToken);
    const now = Date.now();

    if (decoded?.exp && now < decoded.exp * 1000) {
      const parsedUser = savedUser ? JSON.parse(savedUser) : {};
      const user = {
        id: parsedUser.id || decoded.sub || '',
        email: parsedUser.email || decoded.email || '',
        roles: decoded.roles || [],
        name: decoded.name || '',
        exp: decoded.exp,
      };

      initialState.user = user;
      initialState.token = savedToken;
      initialState.isAuthenticated = true;

      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  } catch (e) {
    console.error('Error reading token from localStorage:', e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}

// ✅ Axios interceptor: ensure every request uses the latest token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redux slice
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
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logoutSuccess } = authSlice.actions;

// 🔐 Login Thunk
export const login = (credentials) => async (dispatch) => {
  dispatch(loginStart());

  try {
    const res = await axios.post('http://localhost:8080/auth/login', credentials);

    let token;
    if (typeof res.data === 'string') {
      token = res.data;
    } else if (res.data.token || res.data.accessToken || res.data.jwt) {
      token = res.data.token || res.data.accessToken || res.data.jwt;
    } else {
      throw new Error('Unexpected login response format');
    }

    const decoded = decodeToken(token);
    if (!decoded) throw new Error('Failed to decode token');

    const user = {
      id: decoded.sub || '',
      email: decoded.email || credentials.email || '',
      roles: decoded.roles || [],
      name: decoded.name || '',
      exp: decoded.exp,
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    dispatch(loginSuccess({ token, user }));
    toast.success('Login successful');
  } catch (err) {
    console.error('Login error:', err);
    let msg = 'Login failed';

    if (err.response?.status === 401) msg = 'Wrong credentials';
    else if (err.response?.data?.message) msg = err.response.data.message;
    else if (err.message) msg = err.message;

    dispatch(loginFailure(msg));
    toast.error(msg);
  }
};

// 🔓 Logout Thunk
export const logout = () => (dispatch) => {
  dispatch(logoutSuccess());
  toast.success('Logged out');
};

// Role utility
export const hasRole = (state, role) => {
  const { user } = state.auth;
  if (!user) return false;
  return Array.isArray(user.roles) ? user.roles.includes(role) : user.role === role;
};

export default authSlice.reducer;
