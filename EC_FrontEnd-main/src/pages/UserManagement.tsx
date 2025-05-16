import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Edit, Download, Trash, UserPlus, X, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { UserForm, UserFormData } from "@/components/users/UserForm";
import { toast } from "sonner";
import instance from "@/lib/axios";

type Department = {
  id: number;
  name: string;
  description?: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  dateCreated?: string;
  status?: string;
  lastLogin?: string;
  departments: number[];
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormData | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDepFormOpen, setIsDepFormOpen] = useState(false);
  const [depForm, setDepForm] = useState({ name: "", description: "" });
  const [assignDepUserId, setAssignDepUserId] = useState<number | null>(null);
  const [selectedDepId, setSelectedDepId] = useState<number | null>(null);

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await instance.get("/departments");
      setDepartments(res.data);
    } catch (err: any) {
      toast.error("Failed to fetch departments");
      console.error("Departments error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await instance.get("/departments/users");
      setUsers(res.data);
    } catch (err: any) {
      toast.error("Failed to fetch users");
      console.error("Users error:", err);
    }
  };

  const handleDepFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDepForm({ ...depForm, [e.target.name]: e.target.value });
  };

  const handleDepFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depForm.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    try {
      const res = await instance.post("/departments/create", { name: depForm.name });
      setDepartments([...departments, res.data]);
      setIsDepFormOpen(false);
      toast.success("Department created");
    } catch (err: any) {
      toast.error("Failed to create department");
      console.error("Create error:", err);
    }
  };

  const handleAssignDep = async () => {
    if (assignDepUserId === null || selectedDepId === null) {
      toast.error("Please select a department");
      return;
    }

    try {
      await instance.post("/departments/assign", null, {
        params: {
          userId: assignDepUserId,
          departmentId: selectedDepId,
        },
      });

      setUsers((prev) =>
        prev.map((user) => {
          const currentDeps = user.departments || [];
          return user.id === assignDepUserId && !currentDeps.includes(selectedDepId)
            ? { ...user, departments: [...currentDeps, selectedDepId] }
            : user;
        })
      );

      toast.success("Department assigned");
    } catch (err: any) {
      toast.error("Failed to assign department");
      console.error("Assign error:", err);
    } finally {
      setAssignDepUserId(null);
      setSelectedDepId(null);
    }
  };

  const handleUnassignDep = async (userId: number, depId: number) => {
    try {
      await instance.delete("/departments/unassign", {
        params: { userId, departmentId: depId },
      });

      setUsers(users.map((user) =>
        user.id === userId
          ? { ...user, departments: (user.departments || []).filter((d) => d !== depId) }
          : user
      ));

      toast.success("Department unassigned");
    } catch (err: any) {
      toast.error("Failed to unassign department");
      console.error("Unassign error:", err);
    }
  };

  const handleDeleteDep = (id: number) => {
    setDepartments(departments.filter((d) => d.id !== id));
    setUsers(users.map((u) => ({
      ...u,
      departments: (u.departments || []).filter((d) => d !== id),
    })));
    toast.success("Deleted department (frontend only)");
  };

  const handleFormSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (data.id) {
        setUsers(users.map((u) => u.id === data.id ? { ...u, ...data } : u));
        toast.success("User updated");
      } else {
        const newUser: User = {
          ...data,
          id: users.length + 1,
          email: data.email || "",
          name: data.name || "",
          departments: [],
        };
        setUsers([...users, newUser]);
        toast.success("User created");
      }
      setIsFormOpen(false);
      setIsSubmitting(false);
    }, 500);
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      cell: (user: any) => user.name,
    },
    {
      key: "email",
      header: "Email",
      cell: (user: any) => user.email,
    },
    {
      key: "departments",
      header: "Departments",
      cell: (user: any) => (
        <div className="flex flex-wrap items-center gap-1">
          {(user.departments || []).length > 0
            ? user.departments.map((depId: number) => {
                const dep = departments.find((d) => d.id === depId);
                return (
                  <span key={depId} className="inline-flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs font-medium mr-1">
                    {dep?.name}
                    <button
                      type="button"
                      className="ml-1 text-red-500"
                      onClick={() => handleUnassignDep(user.id, depId)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            : <span className="text-gray-400 text-xs">No department</span>}
          <button
            type="button"
            className="ml-1 text-green-600"
            onClick={() => setAssignDepUserId(user.id)}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (user: any) => (
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={() => setCurrentUser(user)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost">
            <Trash className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-semibold">User Management</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsDepFormOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
            <Button onClick={() => { setIsFormOpen(true); setCurrentUser(undefined); }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Departments</h2>
          {departments.map(dep => (
            <div key={dep.id} className="flex justify-between items-center border-b py-2">
              <div><div className="font-medium">{dep.name}</div></div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteDep(dep.id)}>
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-white shadow rounded p-4">
          <DataTable data={users} columns={columns} />
        </div>

        <UserForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={currentUser}
          isSubmitting={isSubmitting}
          departmentsList={departments.map(dep => ({ id: dep.id, name: dep.name }))}
        />

        {isDepFormOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Add Department</h2>
              <form onSubmit={handleDepFormSubmit}>
                <input
                  name="name"
                  className="w-full border p-2 mb-2"
                  placeholder="Department Name"
                  value={depForm.name}
                  onChange={handleDepFormChange}
                  required
                />
                <textarea
                  name="description"
                  className="w-full border p-2 mb-4"
                  placeholder="Description"
                  value={depForm.description}
                  onChange={handleDepFormChange}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDepFormOpen(false)}>Cancel</Button>
                  <Button type="submit">Add</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {assignDepUserId !== null && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Assign Department</h2>
              <select
                className="w-full border p-2 mb-4"
                value={selectedDepId ?? ""}
                onChange={(e) => setSelectedDepId(Number(e.target.value))}
              >
                <option value="">Select department</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAssignDepUserId(null)}>Cancel</Button>
                <Button onClick={handleAssignDep} disabled={!selectedDepId}>Assign</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
