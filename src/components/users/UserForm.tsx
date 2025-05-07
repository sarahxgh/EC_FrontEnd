
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormDialog } from '@/components/ui/form-dialog';
import { Select } from '@/components/ui/select';

export interface UserFormData {
  id?: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'idle';
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: UserFormData;
  isSubmitting?: boolean;
}

const defaultFormData: UserFormData = {
  name: '',
  email: '',
  status: 'active',
};

export function UserForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
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
      </div>
    </FormDialog>
  );
}
