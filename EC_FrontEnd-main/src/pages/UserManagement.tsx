import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Edit, Download, MoreHorizontal, Trash, UserPlus, X, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { UserForm, UserFormData } from "@/components/users/UserForm";
import { toast } from "sonner";

// Mock user data
const mockUsers = [
  { id: 1, name: "Stiv Rogers", email: "email@gmail.com", dateCreated: "1/03/2023", status: "inactive", lastLogin: "2 hours ago", departments: [1] },
  { id: 2, name: "Donna Prince", email: "email@gmail.com", dateCreated: "3/03/2023", status: "idle", lastLogin: "a week ago", departments: [2] },
  { id: 3, name: "Tony Park", email: "tony@example.com", dateCreated: "5/03/2023", status: "active", lastLogin: "Just now", departments: [1,2] },
  { id: 4, name: "Bruce Benner", email: "bruce@example.com", dateCreated: "10/03/2023", status: "inactive", lastLogin: "3 days ago", departments: [] },
  { id: 5, name: "Natasha Rushman", email: "natasha@example.com", dateCreated: "15/03/2023", status: "active", lastLogin: "5 hours ago", departments: [1] },
  { id: 6, name: "Clint Francis", email: "clint@example.com", dateCreated: "20/03/2023", status: "idle", lastLogin: "2 days ago", departments: [] },
  { id: 7, name: "Peter Quill", email: "peter@example.com", dateCreated: "25/03/2023", status: "active", lastLogin: "1 hour ago", departments: [2] },
  { id: 8, name: "Wanda Maxim", email: "wanda@example.com", dateCreated: "28/03/2023", status: "inactive", lastLogin: "4 days ago", departments: [] },
  { id: 9, name: "Thor Odinson", email: "thor@example.com", dateCreated: "30/03/2023", status: "active", lastLogin: "3 hours ago", departments: [1] },
  { id: 10, name: "Loki Laufeyson", email: "loki@example.com", dateCreated: "2/04/2023", status: "idle", lastLogin: "6 days ago", departments: [] },
  { id: 11, name: "Nick Fury", email: "nick@example.com", dateCreated: "5/04/2023", status: "active", lastLogin: "30 minutes ago", departments: [2] },
  { id: 12, name: "Maria Hill", email: "maria@example.com", dateCreated: "8/04/2023", status: "inactive", lastLogin: "1 week ago", departments: [] },
];

// Mock department data
type Department = {
  id: number;
  title: string;
  description: string;
};

const mockDepartments: Department[] = [
  { id: 1, title: "Engineering", description: "Handles all engineering tasks" },
  { id: 2, title: "HR", description: "Human Resources department" },
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormData | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Department state
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [isDepFormOpen, setIsDepFormOpen] = useState(false);
  const [depForm, setDepForm] = useState<{ title: string; description: string }>({ title: "", description: "" });

  // Assign department modal state
  const [assignDepUserId, setAssignDepUserId] = useState<number | null>(null);
  const [selectedDepId, setSelectedDepId] = useState<number | null>(null);

  const handleAddUser = () => {
    setCurrentUser(undefined);
    setIsFormOpen(true);
  };

  // Department handlers
  const handleaddDep = () => {
    setDepForm({ title: "", description: "" });
    setIsDepFormOpen(true);
  };

  const handleDepFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDepForm({ ...depForm, [e.target.name]: e.target.value });
  };

  const handleDepFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depForm.title.trim()) {
      toast.error("Department title is required");
      return;
    }
    setDepartments([
      ...departments,
      {
        id: departments.length ? Math.max(...departments.map(d => d.id)) + 1 : 1,
        title: depForm.title,
        description: depForm.description,
      },
    ]);
    setIsDepFormOpen(false);
    toast.success("Department added successfully");
  };

  const handleDeleteDep = (depId: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      setDepartments(departments.filter(dep => dep.id !== depId));
      // Unassign this department from all users
      setUsers(users.map(user => ({
        ...user,
        departments: user.departments?.filter((d: number) => d !== depId) || []
      })));
      toast.success("Department deleted successfully");
    }
  };

  const handleEditUser = (user: UserFormData) => {
    setCurrentUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: UserFormData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (data.id) {
        setUsers(users.map(user => user.id === data.id ? { ...user, ...data } : user));
        toast.success("User updated successfully");
      } else {
        const newUser = {
          ...data,
          id: Math.max(...users.map(u => u.id)) + 1,
          dateCreated: new Date().toLocaleDateString(),
          lastLogin: "Never",
          departments: [],
        };
        setUsers([...users, newUser]);
        toast.success("User added successfully");
      }
      setIsFormOpen(false);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success("User deleted successfully");
    }
  };

  // Unassign department from user
  const handleUnassignDep = (userId: number, depId: number) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, departments: user.departments?.filter((d: number) => d !== depId) }
        : user
    ));
    toast.success("Department unassigned from user");
  };

  // Open assign department modal
  const handleOpenAssignDep = (userId: number) => {
    setAssignDepUserId(userId);
    setSelectedDepId(null);
  };

  // Assign department to user
  const handleAssignDep = () => {
    if (assignDepUserId !== null && selectedDepId !== null) {
      setUsers(users.map(user =>
        user.id === assignDepUserId && !user.departments?.includes(selectedDepId)
          ? { ...user, departments: [...(user.departments || []), selectedDepId] }
          : user
      ));
      setAssignDepUserId(null);
      setSelectedDepId(null);
      toast.success("Department assigned to user");
    }
  };

  const columns = [
    {
      key: "name",
      header: "User Name",
      cell: (user: any) => user.name,
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      cell: (user: any) => user.email,
      sortable: true,
    },
    {
      key: "dateCreated",
      header: "Date Created",
      cell: (user: any) => user.dateCreated,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (user: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active' ? 'bg-green-100 text-green-800' :
          user.status === 'idle' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {user.status}
        </span>
      ),
      sortable: true,
    },
    {
      key: "lastLogin",
      header: "Last Login",
      cell: (user: any) => user.lastLogin,
      sortable: true,
    },
    {
      key: "Department",
      header: "Department(s)",
      cell: (user: any) => (
        <div className="flex flex-wrap gap-1 items-center">
          {(user.departments && user.departments.length > 0)
            ? user.departments.map((depId: number) => {
                const dep = departments.find(d => d.id === depId);
                return dep ? (
                  <span key={depId} className="inline-flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs font-medium mr-1">
                    {dep.title}
                    <button
                      type="button"
                      className="ml-1 text-red-500 hover:text-red-700"
                      title="Unassign"
                      onClick={() => handleUnassignDep(user.id, depId)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })
            : <span className="text-gray-400 text-xs">No department</span>
          }
          <button
            type="button"
            className="ml-1 text-green-600 hover:text-green-800"
            title="Assign department"
            onClick={() => handleOpenAssignDep(user.id)}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (user: any) => (
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
            <div className="flex gap-2">
            <Button onClick={handleaddDep}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Department
            </Button>
            <Button onClick={handleAddUser}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
            </div>
        </div>

        {/* Department List */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">Departments</h2>
          <table className="min-w-full divide-y divide-gray-200 mb-2">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dep => (
                <tr key={dep.id}>
                  <td className="px-4 py-2">{dep.title}</td>
                  <td className="px-4 py-2">{dep.description}</td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteDep(dep.id)}>
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <DataTable 
            data={users}
            columns={columns}
            searchable={true}
            filterable={true}
            pagination={true}
            pageSize={8}
          />
        </div>

        <UserForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={currentUser}
          isSubmitting={isSubmitting}
          departmentsList={departments.map(dep => ({
            id: dep.id,
            name: dep.title, // Map 'title' to 'name' for UserForm compatibility
          }))}
        />

        {/* Department Form Modal */}
        {isDepFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Add Department</h2>
              <form onSubmit={handleDepFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={depForm.title}
                    onChange={handleDepFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={depForm.description}
                    onChange={handleDepFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDepFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Department Modal */}
        {assignDepUserId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Assign Department</h2>
              <div className="mb-4">
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={selectedDepId ?? ""}
                  onChange={e => setSelectedDepId(Number(e.target.value))}
                >
                  <option value="" disabled>Select department</option>
                  {departments.map(dep => (
                    <option key={dep.id} value={dep.id}>{dep.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setAssignDepUserId(null)}>
                  Cancel
                </Button>
                <Button type="button" disabled={selectedDepId === null} onClick={handleAssignDep}>
                  Assign
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
