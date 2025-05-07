
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

// Mock user data - in a real app this would come from a backend
const MOCK_USERS = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://github.com/shadcn.png",
  },
  {
    id: 2,
    username: "user",
    password: "user123",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    avatar: "https://github.com/shadcn.png",
  },
];

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Get saved user from localStorage
const savedUser = localStorage.getItem("user");
if (savedUser) {
  try {
    initialState.user = JSON.parse(savedUser);
    initialState.isAuthenticated = true;
  } catch (e) {
    localStorage.removeItem("user");
  }
}

export interface LoginCredentials {
  username: string;
  password: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      // Remove user from localStorage
      localStorage.removeItem("user");
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

// Async thunk action for login
export const login = (credentials: LoginCredentials) => (dispatch: any) => {
  dispatch(loginStart());
  
  // Simulate API call delay
  setTimeout(() => {
    const user = MOCK_USERS.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    );
    
    if (user) {
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      dispatch(loginSuccess(userWithoutPassword as User));
      toast.success("Login successful");
      return true;
    } else {
      dispatch(loginFailure("Invalid username or password"));
      toast.error("Invalid username or password");
      return false;
    }
  }, 500);
};

export default authSlice.reducer;
