import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Edit, Download, Trash, FilePlus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { toast } from "sonner";
import axios from 'axios';

// Mock document data
const mockDocuments = [
  { id: 1, name: "Test document", owner: "Stiv Rogers", dateCreated: "1/03/2023", status: "Draft", modified: "2 hours ago", categoryId: 1 },
  { id: 2, name: "Job Offer", owner: "Donna Prince", dateCreated: "3/03/2023", status: "Sent", modified: "a week ago", categoryId: 2 },
  { id: 3, name: "Contract Agreement", owner: "Tony Park", dateCreated: "5/03/2023", status: "Signed", modified: "Just now", categoryId: 1 },
  { id: 4, name: "Project Proposal", owner: "Bruce Benner", dateCreated: "10/03/2023", status: "Draft", modified: "3 days ago", categoryId: 3 },
  { id: 5, name: "Annual Report", owner: "Natasha Rushman", dateCreated: "15/03/2023", status: "Signed", modified: "5 hours ago", categoryId: 2 },
  { id: 6, name: "Client Onboarding", owner: "Clint Francis", dateCreated: "20/03/2023", status: "Sent", modified: "2 days ago", categoryId: 1 },
  { id: 7, name: "Employee Handbook", owner: "Peter Quill", dateCreated: "25/03/2023", status: "Signed", modified: "1 hour ago", categoryId: 3 },
  { id: 8, name: "Marketing Strategy", owner: "Wanda Maxim", dateCreated: "28/03/2023", status: "Draft", modified: "4 days ago", categoryId: 2 },
  { id: 9, name: "Financial Analysis", owner: "Thor Odinson", dateCreated: "30/03/2023", status: "Signed", modified: "3 hours ago", categoryId: 1 },
  { id: 10, name: "Partnership Agreement", owner: "Loki Laufeyson", dateCreated: "2/04/2023", status: "Sent", modified: "6 days ago", categoryId: 3 },
  { id: 11, name: "Non-Disclosure Agreement", owner: "Nick Fury", dateCreated: "5/04/2023", status: "Signed", modified: "30 minutes ago", categoryId: 2 },
  { id: 12, name: "Technology Roadmap", owner: "Maria Hill", dateCreated: "8/04/2023", status: "Draft", modified: "1 week ago", categoryId: 1 },
];

// Category objects structure: { id: number, title: string, description: string }
const mockCategories = [
  { id: 1, title: "General", description: "General" },
  { id: 2, title: "Administrative", description: "Administrative" },
  { id: 3, title: "Training", description: "Training" }
];

const DocumentManagement = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [categories, setCategories] = useState(mockCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category form state
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ title: "", description: "" });
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  const handleAddCategory = () => {
    setCategoryForm({ title: "", description: "" });
    setIsCategoryFormOpen(true);
  };

  const handleCategoryFormChange = (e) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const handleCategoryFormSubmit = (e) => {
    e.preventDefault();
    setIsCategorySubmitting(true);
    setTimeout(() => {
      const newCategory = {
        ...categoryForm,
        id: Math.max(...categories.map(c => c.id), 0) + 1,
      };
      setCategories([...categories, newCategory]);
      toast.success("Category added successfully");
      setIsCategoryFormOpen(false);
      setIsCategorySubmitting(false);
    }, 800);
  };

  const handleAddDocument = () => {
    setCurrentDocument(undefined);
    setIsFormOpen(true);
  };

  const handleEditDocument = (document) => {
    setCurrentDocument(document);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data) => {
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("the data to be sent", data);
        // send request to create document using axios 
        axios.post('http://localhost:8081/documents/create',data
          ,
          {
            headers: {
              'Authorization': `Bearer `+localStorage.getItem('token')
            }
          }
        ).then(response => {
            console.log(response.data);
            if (response.data == "Document created successfully.") {
              if (data.id) {
              setDocuments(documents.map(doc => doc.id === data.id ? { ...doc, ...data } : doc));
              toast.success("Document updated successfully");
              } else {
              const newDocument = {
                ...data,
                id: Math.max(...documents.map(d => d.id), 0) + 1,
                dateCreated: new Date().toLocaleDateString(),
                modified: "Just now"
              };
              setDocuments([...documents, newDocument]);
              toast.success("Document added successfully");
            }
          }else {
            toast.success("Something wrong happened");
          }
          })
          .catch(error => {
            console.error(error);
          });
      setIsFormOpen(false);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleDeleteDocument = (documentId) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success("Document deleted successfully");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Document Name",
      cell: (doc) => doc.name,
      sortable: true,
    },
    {
      key: "owner",
      header: "Owner",
      cell: (doc) => doc.owner,
      sortable: true,
    },
    {
      key: "category",
      header: "Category",
      cell: (doc) => {
        const cat = categories.find(c => c.id === doc.categoryId);
        return cat ? cat.title : "-";
      },
      sortable: false,
    },
    {
      key: "dateCreated",
      header: "Date Created",
      cell: (doc) => doc.dateCreated,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (doc) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          doc.status === 'Signed' ? 'bg-green-100 text-green-800' :
          doc.status === 'Sent' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {doc.status}
        </span>
      ),
      sortable: true,
    },
    {
      key: "modified",
      header: "Modified",
      cell: (doc) => doc.modified,
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (doc) => (
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEditDocument(doc)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}>
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
          <h1 className="text-2xl font-semibold text-gray-900">Document Management</h1>
          <div className="flex gap-2">
            <Button onClick={handleAddCategory}>
              <FilePlus className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
            <Button onClick={handleAddDocument}>
              <FilePlus className="mr-2 h-4 w-4" />
              Add New Document
            </Button>
          </div>
        </div>

        {/* Category Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="border rounded p-4 flex flex-col">
                <span className="font-medium">{cat.title}</span>
                <span className="text-gray-500 text-sm">{cat.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <DataTable 
            data={documents}
            columns={columns}
            searchable={true}
            filterable={true}
            pagination={true}
            pageSize={8}
          />
        </div>

        <DocumentForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={currentDocument}
          isSubmitting={isSubmitting}
          categories={categories}
        />

        {/* Category Form Modal */}
        {isCategoryFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <form
              onSubmit={handleCategoryFormSubmit}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Title</label>
                <input
                  name="title"
                  value={categoryForm.title}
                  onChange={handleCategoryFormChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Description</label>
                <input
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryFormChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCategoryFormOpen(false)}
                  disabled={isCategorySubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCategorySubmitting}>
                  {isCategorySubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DocumentManagement;
