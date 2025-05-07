
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FolderPlus, Folder, Trash, Edit } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Mock folders data
const initialFolders = [
  { id: 1, name: "Folder 1", createdBy: 1 },
  { id: 2, name: "Folder 2", createdBy: 1 },
  { id: 3, name: "Private Folder", createdBy: 2 },
  { id: 4, name: "Shared Documents", createdBy: 2 },
];

const FolderView = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [folders, setFolders] = useState(initialFolders);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [currentFolder, setCurrentFolder] = useState(null);

  // Filter folders: show all folders for admin, only user's folders for regular users
  const filteredFolders = folders.filter(folder => {
    const matchesSearch = folder.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = user?.role === "admin" || folder.createdBy === user?.id;
    return matchesSearch && matchesUser;
  });

  const handleOpenFolder = (folderId) => {
    navigate(`/folders/${folderId}`);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    const newFolder = {
      id: Math.max(0, ...folders.map(f => f.id)) + 1,
      name: newFolderName,
      createdBy: user?.id || 0
    };

    setFolders([...folders, newFolder]);
    setNewFolderName("");
    setIsCreateModalOpen(false);
    toast.success("Folder created successfully");
  };

  const handleEditFolder = () => {
    if (!currentFolder || !newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setFolders(folders.map(folder => 
      folder.id === currentFolder.id 
        ? { ...folder, name: newFolderName } 
        : folder
    ));
    setNewFolderName("");
    setCurrentFolder(null);
    setIsCreateModalOpen(false);
    toast.success("Folder updated successfully");
  };

  const handleDeleteFolder = (folderId) => {
    if (confirm("Are you sure you want to delete this folder? All documents inside will be deleted.")) {
      setFolders(folders.filter(folder => folder.id !== folderId));
      toast.success("Folder deleted successfully");
    }
  };

  const openCreateModal = () => {
    setCurrentFolder(null);
    setNewFolderName("");
    setIsCreateModalOpen(true);
  };

  const openEditModal = (folder) => {
    setCurrentFolder(folder);
    setNewFolderName(folder.name);
    setIsCreateModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">My Documents</h1>
          <Button onClick={openCreateModal}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Folders</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search folders..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="px-4">Filter</Button>
            </div>
          </div>

          {filteredFolders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No folders found. Create a new folder to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFolders.map((folder) => (
                <div 
                  key={folder.id} 
                  className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div 
                      className="flex items-center cursor-pointer flex-1"
                      onClick={() => handleOpenFolder(folder.id)}
                    >
                      <Folder className="h-10 w-10 text-blue-500 mr-3" />
                      <h3 className="font-medium text-gray-900 truncate">{folder.name}</h3>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => openEditModal(folder)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500" 
                        onClick={() => handleDeleteFolder(folder.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Folder Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentFolder ? "Edit Folder" : "Create New Folder"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={currentFolder ? handleEditFolder : handleCreateFolder}>
              {currentFolder ? "Save Changes" : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default FolderView;
