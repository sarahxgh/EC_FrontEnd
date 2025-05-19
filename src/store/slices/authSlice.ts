import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

export interface User {
  id?: number;
  username: string;
  name?: string;
  email?: string;
  role: string;
  avatar?: string;
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

// Load saved user from localStorage
const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");

if (savedUser && savedToken) {
  try {
    initialState.user = JSON.parse(savedUser);
    initialState.isAuthenticated = true;
    axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

// ✅ Real API login thunk
export const login = (credentials: LoginCredentials) => async (dispatch: any) => {
  dispatch(loginStart());
  try {
    const res = await axios.post("http://localhost:8080/auth/login", credentials);

    const { token, user } = res.data;

    if (!token) throw new Error("No token received");

    // Set auth header for future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    dispatch(loginSuccess(user));
    toast.success("Login successful");

  } catch (error: any) {
    const msg =
      error?.response?.data?.message || error.message || "Login failed";
    dispatch(loginFailure(msg));
    toast.error(msg);
  }
};

export default authSlice.reducer;
