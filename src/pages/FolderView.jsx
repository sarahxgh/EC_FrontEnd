import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FolderPlus, Folder, Trash, Edit } from "lucide-react";
import { toast } from "sonner";
import instance from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const FolderView = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [current, setCurrent] = useState(null);

  // Fetch departments per access 
  // start of update for user department access ----------------------------
  useEffect(() => {
    fetchDepartments();
  }, []);
const fetchDepartments = async () => {
  try {
    const storedUserString = localStorage.getItem("user");
    let departmentsPayload = []; // To store the final list of departments
    let endpointToFetch = "/departments"; // Default to admin endpoint

    if (storedUserString) {
      try {
        const parsedUser = JSON.parse(storedUserString);
        const roles = parsedUser.roles || []; // Get roles, default to empty array if undefined

        // Logic: If user has ROLE_ADMIN, they see all departments.
        // Otherwise, if they have ROLE_USER (and not admin), they see their specific departments.
        if (roles.includes("ROLE_ADMIN")) {
          endpointToFetch = "/departments";
        } else if (roles.includes("ROLE_USER")) {
          endpointToFetch = "/auth/me";
        } else {
          // No recognized role
          console.warn("User has no recognized roles (ROLE_ADMIN or ROLE_USER). Defaulting department fetch.");
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        // If parsing fails, default to trying the admin endpoint,
        // assuming the backend will handle unauthorized access.
        endpointToFetch = "/departments"; // Fallback
      }
    } else {
      // No user in localStorage. Treat as unauthenticated for this view.
      toast.info("User not logged in. Cannot fetch departments.");
      setDepartments([]);
      // if (setIsLoading) setIsLoading(false);
      return;
    }

    // Make the API call
    const res = await instance.get(endpointToFetch);

    if (endpointToFetch === "/auth/me") {
      // The /auth/me endpoint returns an array of DepartmentDTOs: [{id, name}, ...]
      // Ensure the structure matches what your component expects for 'departments' state.
      // If your component expects objects like {id: 1, name: "Eng", description: "..."},
      // you might need to map or adjust. Assuming it just needs [{id, name}].
      if (Array.isArray(res.data)) {
        departmentsPayload = res.data.map(dep => ({ id: dep.id, name: dep.name })); // Map to common structure if needed
      } else {
        console.warn("Expected an array from /auth/me, got:", res.data);
        departmentsPayload = [];
      }
    } else {
      // The /departments endpoint returns an array of full Department objects
      if (Array.isArray(res.data)) {
        departmentsPayload = res.data;
      } else {
        console.warn("Expected an array from /departments, got:", res.data);
        departmentsPayload = [];
      }
    }

    // Update state
    if (departmentsPayload.length > 0) {
      setDepartments(departmentsPayload);
    } else {
      setDepartments([]);
      if (endpointToFetch === "/auth/me") {
        toast.info("No departments assigned to you or found.");
      } else {
        toast.info("No departments found.");
      }
    }

  } catch (err) {
    setDepartments([]); // Clear departments on error
    toast.error(err.response?.data?.message || "Failed to fetch departments.");
    console.error("Error fetching departments:", err);
  } finally {
    // if (setIsLoading) setIsLoading(false); // Optional: manage loading state
  }
};

// end of update for user department access --------------------------------------
  const filtered = departments.filter((dep) =>
    dep.name && dep.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //navigte to the docuement view for the selected department
  const openFolder = (id, name) => navigate(`/folders/${id}`, { state: { departmentId: id, departmentName: name } });

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    try {
      const res = await instance.post("/departments/create", { name: newName });
      setDepartments([...departments, res.data]);
      setNewName("");
      setIsModalOpen(false);
      toast.success("Department created");
    } catch (err) {
      toast.error("Failed to create department");
    }
  };

  const handleEdit = async () => {
    if (!current || !newName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    try {
      await instance.put(`/departments/${current.id}`, { name: newName });
      setDepartments(
        departments.map((d) =>
          d.id === current.id ? { ...d, name: newName } : d
        )
      );
      setCurrent(null);
      setNewName("");
      setIsModalOpen(false);
      toast.success("Department updated");
    } catch (err) {
      toast.error("Failed to update department");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this department and all its docs?")) {
      try {
        await instance.delete(`/departments/${id}`);
        setDepartments(departments.filter((d) => d.id !== id));
        toast.success("Deleted");
      } catch (err) {
        toast.error("Failed to delete department");
      }
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
        {/* <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Departments</h1>
          <Button onClick={openCreate}>
            <FolderPlus className="mr-2 h-4 w-4" /> New Department
          </Button>
        </div> */}

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
                      onClick={() => openFolder(dep.id)}
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

export default FolderView;
