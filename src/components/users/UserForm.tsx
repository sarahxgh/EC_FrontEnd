import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormDialog } from '@/components/ui/form-dialog';

export interface UserFormData {
  id?: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'idle';
  departments: number[];
}

interface Department {
  id: number;
  name: string;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: UserFormData;
  isSubmitting?: boolean;
  departmentsList: Department[]; // List of available departments
}

const defaultFormData: UserFormData = {
  name: '',
  email: '',
  status: 'active',
  departments: [],
};

export function UserForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
  departmentsList,
}: UserFormProps) {
  const [formData, setFormData] = React.useState<UserFormData>(
    initialData || defaultFormData
  );

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentsChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => parseInt(option.value)
    );
    setFormData((prev) => ({ ...prev, departments: selectedOptions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = Boolean(initialData?.id);

  return (
    <FormDialog
      title={isEditing ? 'Edit User' : 'Add New User'}
      description={isEditing ? 'Update user details' : 'Create a new user'}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="idle">Idle</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="departments">Departments</Label>
          <select
            id="departments"
            name="departments"
            multiple
            value={formData.departments.map(String)} // value must be string[]
            onChange={handleDepartmentsChange}
            className="flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {departmentsList.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground">You can leave this empty or select multiple.</p>
        </div>
      </div>
    </FormDialog>
  );
}
