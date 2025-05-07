
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Users, 
  FileText, 
  Clock, 
  Calendar, 
  DollarSign, 
  Settings, 
  Star,
  LogOut,
  User,
  Plus,
  Info,
  Bell,
  FolderOpen,
  Folder,
  File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logout } from "@/store/slices/authSlice";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-6 mt-8">
          
          {/* Document/Folder Icon - First for all users */}
          <Link to="/folders" className={`${isActive('/folders') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <FolderOpen className="w-6 h-6" />
          </Link>
          

          <Link to="#" className="text-gray-400 hover:text-gray-600">
            <Calendar className="w-6 h-6" />
          </Link>
          
          {/* Admin-only navigation items */}
          {isAdmin && (
            <>
              <Link to="/users" className={`${isActive('/users') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <Users className="w-6 h-6" />
              </Link>
              <Link to="/documents" className={`${isActive('/documents') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <FileText className="w-6 h-6" />
              </Link>
            </>
          )}
          

          <Link to="/profile" className={`${isActive('/profile') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <User className="w-6 h-6" />
          </Link>
          <Link to="#" className="text-gray-400 hover:text-gray-600">
            <Settings className="w-6 h-6" />
          </Link>

          
          {/* Logout button at the bottom of sidebar */}
          <div className="mt-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="w-6 h-6" />
            </Button>
          </div>
        </aside>

        {/* Main Content with Navbar */}
        <div className="flex-1 flex flex-col">
          {/* Horizontal Navbar */}
          <header className="border-b bg-white shadow-sm">
            <div className="flex justify-between items-center px-6 py-2">
              <div className="flex space-x-8">
                {isAdmin && (
                  <>
                    <Link to="/users" className={`py-4 px-2 ${isActive('/users') ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-700 hover:text-gray-900'}`}>
                      User management
                    </Link>
                    <Link to="/documents" className={`py-4 px-2 ${isActive('/documents') ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-700 hover:text-gray-900'}`}>
                      Document management
                    </Link>
                  </>
                )}
                <Link to="/folders" className={`py-4 px-2 ${isActive('/folders') ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-700 hover:text-gray-900'}`}>
                  My documents
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-600">
                  <Plus className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600">
                  <Info className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{user?.role || 'User'}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{user?.email || 'user@example.com'}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} alt={user?.name || "User"} />
                    <AvatarFallback>{user?.name?.substring(0, 2) || "U"}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
