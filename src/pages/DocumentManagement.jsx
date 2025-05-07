
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Edit, Download, MoreHorizontal, Trash, FilePlus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { toast } from "sonner";

// Mock document data
const mockDocuments = [
  { id: 1, name: "Test document", owner: "Stiv Rogers", dateCreated: "1/03/2023", status: "Draft", modified: "2 hours ago" },
  { id: 2, name: "Job Offer", owner: "Donna Prince", dateCreated: "3/03/2023", status: "Sent", modified: "a week ago" },
  { id: 3, name: "Contract Agreement", owner: "Tony Park", dateCreated: "5/03/2023", status: "Signed", modified: "Just now" },
  { id: 4, name: "Project Proposal", owner: "Bruce Benner", dateCreated: "10/03/2023", status: "Draft", modified: "3 days ago" },
  { id: 5, name: "Annual Report", owner: "Natasha Rushman", dateCreated: "15/03/2023", status: "Signed", modified: "5 hours ago" },
  { id: 6, name: "Client Onboarding", owner: "Clint Francis", dateCreated: "20/03/2023", status: "Sent", modified: "2 days ago" },
  { id: 7, name: "Employee Handbook", owner: "Peter Quill", dateCreated: "25/03/2023", status: "Signed", modified: "1 hour ago" },
  { id: 8, name: "Marketing Strategy", owner: "Wanda Maxim", dateCreated: "28/03/2023", status: "Draft", modified: "4 days ago" },
  { id: 9, name: "Financial Analysis", owner: "Thor Odinson", dateCreated: "30/03/2023", status: "Signed", modified: "3 hours ago" },
  { id: 10, name: "Partnership Agreement", owner: "Loki Laufeyson", dateCreated: "2/04/2023", status: "Sent", modified: "6 days ago" },
  { id: 11, name: "Non-Disclosure Agreement", owner: "Nick Fury", dateCreated: "5/04/2023", status: "Signed", modified: "30 minutes ago" },
  { id: 12, name: "Technology Roadmap", owner: "Maria Hill", dateCreated: "8/04/2023", status: "Draft", modified: "1 week ago" },
];

const DocumentManagement = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Simulate API call
    setTimeout(() => {
      if (data.id) {
        // Update existing document
        setDocuments(documents.map(doc => doc.id === data.id ? { ...doc, ...data } : doc));
        toast.success("Document updated successfully");
      } else {
        // Add new document
        const newDocument = {
          ...data,
          id: Math.max(...documents.map(d => d.id)) + 1,
          dateCreated: new Date().toLocaleDateString(),
          modified: "Just now"
        };
        setDocuments([...documents, newDocument]);
        toast.success("Document added successfully");
      }
      setIsFormOpen(false);
      setIsSubmitting(false);
    }, 1000); // Simulate network delay
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
          <Button onClick={handleAddDocument}>
            <FilePlus className="mr-2 h-4 w-4" />
            Add New Document
          </Button>
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
        />
      </div>
    </DashboardLayout>
  );
};

export default DocumentManagement;
