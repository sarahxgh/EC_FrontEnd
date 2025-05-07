
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import DocumentManagement from "./pages/DocumentManagement";
import UserProfile from "./pages/UserProfile";
import FolderView from "./pages/FolderView";
import DocumentView from "./pages/DocumentView";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin only routes */}
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <DocumentManagement />
              </ProtectedRoute>
            } />
            
            {/* Routes for all authenticated users */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/folders" element={
              <ProtectedRoute>
                <FolderView />
              </ProtectedRoute>
            } />
            <Route path="/folders/:folderId" element={
              <ProtectedRoute>
                <DocumentView />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/folders" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
