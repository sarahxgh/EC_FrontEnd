import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FolderPlus, Folder, Trash, Edit } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const initialDepartments = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "HR" },
  { id: 3, name: "Marketing" },
];

const DepartmentView = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [departments, setDepartments] = useState(initialDepartments);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [current, setCurrent] = useState(null);

  const filtered = departments.filter((dep) => {
    const matchesSearch = dep.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser =
      user?.role === "admin" || user?.departments?.includes(dep.id);
    return matchesSearch && matchesUser;
  });

  const openDept = (id) => navigate(`/folders/${id}`);

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    setDepartments([
      ...departments,
      { id: Math.max(0, ...departments.map((d) => d.id)) + 1, name: newName },
    ]);
    setNewName("");
    setIsModalOpen(false);
    toast.success("Department created");
  };

  const handleEdit = () => {
    if (!current || !newName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    setDepartments(
      departments.map((d) =>
        d.id === current.id ? { ...d, name: newName } : d
      )
    );
    setCurrent(null);
    setNewName("");
    setIsModalOpen(false);
    toast.success("Department updated");
  };

  const handleDelete = (id) => {
    if (confirm("Delete this department and all its docs?")) {
      setDepartments(departments.filter((d) => d.id !== id));
      toast.success("Deleted");
    }
  };

  const openCreate = () => {
    setCurrent(null);
    setNewName("");
    setIsModalOpen(true);
  };
  const openEdit = (dep) => {
    setCurrent(dep);
    setNewName(dep.name);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Departments</h1>
          <Button onClick={openCreate}>
            <FolderPlus className="mr-2 h-4 w-4" /> New Department
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-medium">Departments</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No departments found.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((dep) => (
                <div
                  key={dep.id}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md flex flex-col"
                >
                  <div className="flex justify-between mb-4">
                    <div
                      className="cursor-pointer flex-1 flex items-center"
                      onClick={() => openDept(dep.id)}
                    >
                      <Folder className="h-10 w-10 text-blue-500 mr-3" />
                      <h3 className="font-medium truncate">{dep.name}</h3>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(dep)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(dep.id)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {current ? "Edit Department" : "Create Department"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={current ? handleEdit : handleCreate}>
              {current ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DepartmentView;
