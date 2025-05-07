
import { createSlice } from '@reduxjs/toolkit';

// Mock users for demo
const users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User', email: 'admin@example.com', role: 'admin', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 2, username: 'user', password: 'user123', name: 'Regular User', email: 'user@example.com', role: 'user', avatar: 'https://i.pravatar.cc/150?img=8' },
];

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

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
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logoutSuccess } = authSlice.actions;

// Thunk for login
export const login = (credentials) => (dispatch) => {
  dispatch(loginStart());
  
  // Simulate API call
  setTimeout(() => {
    const user = users.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    );
    
    if (user) {
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      dispatch(loginSuccess(userWithoutPassword));
      return true;
    } else {
      dispatch(loginFailure('Invalid username or password'));
      return false;
    }
  }, 1000);
};

// Thunk for logout
export const logout = () => (dispatch) => {
  dispatch(logoutSuccess());
};

export default authSlice.reducer;
