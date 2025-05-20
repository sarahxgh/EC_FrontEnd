import { useEffect, useState } from "react";
import { useLocation, useParams } from 'react-router-dom';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Plus, Search, FileText, Trash, Edit } from "lucide-react";
import { toast } from "sonner";
import { DocumentForm } from "@/components/documents/DocumentForm";
import axios from "axios";
import instance from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";



// Add userId to initialDocs and dummy user documents
const initialDocs = [
  { id: 1, title: "Onboarding Guide", content: "Welcome to the team!", departmentId: 1, userId: 1 },
  { id: 2, title: "Finance Doc1", content: " doc 1.", departmentId: 2, userId: 2 },
  { id: 3, title: "Product Roadmap", content: "Q1 planning.", departmentId: 3, userId: 1 },
  // Dummy user documents
  { id: 4, title: "Finance Doc2", content: "Doc2", departmentId: 1, userId: 1 },
  { id: 5, title: "Finance Doc3", content: "Doc3", departmentId: 2, userId: 1 },
  { id: 6, title: "Doc by U2", content: "This file is created by U2", departmentId: 3, userId: 1 },
];



const DepartmentDocuments = () => {
  // retreiving the id and the name from the route coming from folder
  const { id } = useParams();
  const location = useLocation();
  const departmentId = parseInt(id);
  const departmentName = location.state?.departmentName;


  const [documents, setDocuments] = useState([]);
  const [userDocuments, setUserDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // for previwing the file when clikcing on it 
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (doc) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  const fetchDoc = async () => {
    try {
      const departmentIdres = await axios.post(
        'http://localhost:8081/documents/docperdepartment',
        { depID: 1 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (departmentIdres.data) {
        const docsArray = Object.entries(departmentIdres.data).map(([title, url]) => ({
          title,
          url
        }));
        setUserDocuments(docsArray);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };


  useEffect(() => {
    fetchDoc();
  }, [departmentId]);

  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreate = () => {
    setIsFormOpen(true);
  };



  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    console.log("department id is", departmentId);
    try {
      const payload = { ...data, departmentId };
      const response = await axios.post(
        "http://localhost:8081/documents/create",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data === "Document created successfully.") {
        const newDoc = {
          ...payload,
          id: Math.max(0, ...documents.map((d) => d.id)) + 1,
        };
        setDocuments([...documents, newDoc]);
        toast.success("Document created");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to create document");
    }
    setIsFormOpen(false);
    setIsSubmitting(false);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this document?")) {
      setDocuments(documents.filter((d) => d.id !== id));
      toast.success("Deleted");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Documents {departmentName}
          </h1>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        {/* here is the department docs container starts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between mb-6">
            {/* this is to display the department name */}
            <h2 className="text-xl font-medium">
              {departmentName && (
                <span className="ml-2 text-gray-500">({departmentName})</span>
              )}
            </h2>
            {/* here is for the seach of the documents inside the folder of the department */}
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

          {/* this container is used to display the list of the documents
          filtered from the search operation inside the department folder */}
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nothing here ...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md flex flex-col cursor-pointer"
                  onClick={() => handlePreview(doc)}
                >
                  <div className="flex justify-between mb-4">
                    <div className="flex-1 flex items-center">
                      <FileText className="h-10 w-10 text-green-500 mr-3" />
                      <h3 className="font-medium truncate">{doc.title}</h3>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent triggering preview
                          handleDelete(doc.id);
                        }}
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

        {/* User Documents Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-medium mb-4"> Department {departmentName}</h2>

          {userDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No user documents found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDocuments.map((doc) => (
                <div
                  key={doc.title}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md flex flex-col cursor-pointer"
                  onClick={() => handlePreview(doc)}
                >
                  <div className="flex justify-between mb-4">
                    <div className="flex-1 flex items-center">
                      <FileText className="h-10 w-10 text-green-500 mr-3" />
                      <h3 className="font-medium truncate">{doc.title}</h3>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc.title, departmentId); // 👈 pass title and department ID
                        }}
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


        {/* This is the file preview container that when clicking on the list it preview the file */}
        {selectedDoc && (
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl h-[100vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Preview: {selectedDoc.title}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden border rounded-md">
                <iframe
                  src={selectedDoc.url}
                  title="PDF Preview"
                  className="w-full h-full"
                />
              </div>
              <DialogFooter>
                <a
                  href={selectedDoc.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">Download PDF</Button>
                </a>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* this is used so that to display the content of the form of adding a document */}
        <DocumentForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
      </div>
    </DashboardLayout>
  );
};

export default DepartmentDocuments;
