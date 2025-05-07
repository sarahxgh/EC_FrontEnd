
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Edit, Download, MoreHorizontal, Trash, UserPlus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { UserForm, UserFormData } from "@/components/users/UserForm";
import { toast } from "sonner";

// Mock user data
const mockUsers = [
  { id: 1, name: "Stiv Rogers", email: "email@gmail.com", dateCreated: "1/03/2023", status: "inactive", lastLogin: "2 hours ago" },
  { id: 2, name: "Donna Prince", email: "email@gmail.com", dateCreated: "3/03/2023", status: "idle", lastLogin: "a week ago" },
  { id: 3, name: "Tony Park", email: "tony@example.com", dateCreated: "5/03/2023", status: "active", lastLogin: "Just now" },
  { id: 4, name: "Bruce Benner", email: "bruce@example.com", dateCreated: "10/03/2023", status: "inactive", lastLogin: "3 days ago" },
  { id: 5, name: "Natasha Rushman", email: "natasha@example.com", dateCreated: "15/03/2023", status: "active", lastLogin: "5 hours ago" },
  { id: 6, name: "Clint Francis", email: "clint@example.com", dateCreated: "20/03/2023", status: "idle", lastLogin: "2 days ago" },
  { id: 7, name: "Peter Quill", email: "peter@example.com", dateCreated: "25/03/2023", status: "active", lastLogin: "1 hour ago" },
  { id: 8, name: "Wanda Maxim", email: "wanda@example.com", dateCreated: "28/03/2023", status: "inactive", lastLogin: "4 days ago" },
  { id: 9, name: "Thor Odinson", email: "thor@example.com", dateCreated: "30/03/2023", status: "active", lastLogin: "3 hours ago" },
  { id: 10, name: "Loki Laufeyson", email: "loki@example.com", dateCreated: "2/04/2023", status: "idle", lastLogin: "6 days ago" },
  { id: 11, name: "Nick Fury", email: "nick@example.com", dateCreated: "5/04/2023", status: "active", lastLogin: "30 minutes ago" },
  { id: 12, name: "Maria Hill", email: "maria@example.com", dateCreated: "8/04/2023", status: "inactive", lastLogin: "1 week ago" },
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormData | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = () => {
    setCurrentUser(undefined);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: UserFormData) => {
    setCurrentUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: UserFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      if (data.id) {
        // Update existing user
        setUsers(users.map(user => user.id === data.id ? { ...user, ...data } : user));
        toast.success("User updated successfully");
      } else {
        // Add new user
        const newUser = {
          ...data,
          id: Math.max(...users.map(u => u.id)) + 1,
          dateCreated: new Date().toLocaleDateString(),
          lastLogin: "Never"
        };
        setUsers([...users, newUser]);
        toast.success("User added successfully");
      }
      setIsFormOpen(false);
      setIsSubmitting(false);
    }, 1000); // Simulate network delay
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success("User deleted successfully");
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
          <Button onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
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
        />
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
