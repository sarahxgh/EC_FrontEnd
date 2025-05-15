import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';

// Initial auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Load saved user and token from localStorage
const savedUser = typeof localStorage !== 'undefined' && localStorage.getItem('user');
const savedToken = typeof localStorage !== 'undefined' && localStorage.getItem('token');

if (savedUser && savedToken) {
  try {
    initialState.user = JSON.parse(savedUser);
    initialState.isAuthenticated = true;
    axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
  } catch (e) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
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

// 🔐 Login thunk - Updated to handle different response formats and show "Wrong credentials"
export const login = (credentials) => async (dispatch) => {
  dispatch(loginStart());

  try {
    const res = await axios.post('http://localhost:8080/auth/login', credentials);
    console.log('Login response:', res.data); // Debug response format

    // Handle different response formats from the backend
    let token, user;

    if (res.data.token && res.data.user) {
      token = res.data.token;
      user = res.data.user;
    } else if (res.data.token || res.data.accessToken || res.data.jwt) {
      token = res.data.token || res.data.accessToken || res.data.jwt;
      user = {
        email: credentials.email,
        id: res.data.userId || '',
      };
    } else {
      console.error('Unexpected login response format:', res.data);
      throw new Error('Invalid login response format');
    }

    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    dispatch(loginSuccess(user));
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

//


// 🔓 Logout thunk
export const logout = () => (dispatch) => {
  dispatch(logoutSuccess());
  toast.success('Logged out');
};

export default authSlice.reducer;