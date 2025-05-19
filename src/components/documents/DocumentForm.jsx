import { useState, useEffect } from 'react';
import { FormDialog } from '@/components/ui/form-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';


export const DocumentForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  categories = [],
}) => {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    owner: '', // display a list of emails of owners
    status: 'Draft',
    category: '', // display a list of emails of cats
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        owner: initialData.owner || '',
        status: initialData.status || 'Draft',
        category: initialData.category || '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        id: null,
        name: '',
        owner: '',
        status: 'Draft',
        category: '',
        description: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <FormDialog
      title={initialData ? 'Edit Document' : 'Add New Document'}
      description="Fill in the information below to create a new document or update an existing one."
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={initialData ? 'Update' : 'Create'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Document Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter document name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner">Owner</Label>
          <Input
            id="owner"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            placeholder="Enter document owner"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Signed">Signed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Administrative">Administrative</SelectItem>
              <SelectItem value="Training">Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
      <div className="space-y-2">
        <Label htmlFor="file">Upload PDF</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files[0];
            setFormData((prev) => ({ ...prev, file }));
          }}
          required={!initialData}
        />
      </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter document description"
            rows={3}
          />
        </div>
      </div>
    </FormDialog>
  );
};
