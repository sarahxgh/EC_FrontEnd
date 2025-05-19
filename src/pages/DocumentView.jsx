import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Plus, Search, FileText, Trash, Edit } from "lucide-react";
import { toast } from "sonner";
import { DocumentForm } from "@/components/documents/DocumentForm";
import axios from "axios";

const initialDocs = [
  { id: 1, title: "Onboarding Guide", content: "Welcome to the team!", departmentId: 1, userId: 1 },
  { id: 2, title: "Finance Doc1", content: " doc 1.", departmentId: 2, userId: 2 },
  { id: 3, title: "Product Roadmap", content: "Q1 planning.", departmentId: 3, userId: 1 },
  { id: 4, title: "Finance Doc2", content: "Doc2", departmentId: 1, userId: 1 },
  { id: 5, title: "Finance Doc3", content: "Doc3", departmentId: 2, userId: 1 },
  { id: 6, title: "Doc by U2", content: "This file is created by U2", departmentId: 3, userId: 1 },
];

const currentUserId = 1;

const DepartmentDocuments = () => {
  const { id } = useParams();
  const location = useLocation();
  const departmentId = parseInt(id);

  const departmentName =
    (location.state && location.state.departmentName) ||
    new URLSearchParams(location.search).get("departmentName") ||
    "";

  const [documents, setDocuments] = useState([]);
  const [userDocuments, setUserDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [translatingId, setTranslatingId] = useState(null); // Track which doc is being translated
  const [translations, setTranslations] = useState({}); // Store translations by doc id

  useEffect(() => {
    const deptDocs = initialDocs.filter((doc) => doc.departmentId === departmentId);
    setDocuments(deptDocs);

    const userDocs = initialDocs.filter((doc) => doc.userId === currentUserId);
    setUserDocuments(userDocs);
  }, [departmentId]);

  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreate = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
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

  const handleTranslate = async (docId, text) => {
    setTranslatingId(docId);
    try {
      const response = await fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (response.ok) {
        setTranslations((prev) => ({ ...prev, [docId]: data.translated }));
        toast.success("Translation successful");
      } else {
        toast.error(data.error || "Translation failed");
      }
    } catch (err) {
      toast.error("Failed to connect to translation service");
    } finally {
      setTranslatingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Documents Finance
          </h1>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-medium">
              Department Finance
              {departmentName && (
                <span className="ml-2 text-gray-500">({departmentName})</span>
              )}
            </h2>
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
              No documents found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md flex flex-col"
                >
                  <div className="flex justify-between mb-4">
                    <div className="flex-1 flex items-center">
                      <FileText className="h-10 w-10 text-green-500 mr-3" />
                      <h3 className="font-medium truncate">
                        {doc.title}
                        {translations[doc.id] && (
                          <span className="ml-2 text-gray-500 italic"> — {translations[doc.id]}</span>
                        )}
                      </h3>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{doc.content}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleTranslate(doc.id, doc.title)}
                    disabled={translatingId === doc.id}
                  >
                    {translatingId === doc.id ? "Translating..." : "Translate Title"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Documents Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-medium mb-4"> Department Finance</h2>

          {userDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No user documents found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md flex flex-col"
                >
                  <div className="flex justify-between mb-4">
                    <div className="flex-1 flex items-center">
                      <FileText className="h-10 w-10 text-red-500 mr-3" />
                      <h3 className="font-medium truncate text-red-600">
                        {doc.title}
                        {translations[doc.id] && (
                          <span className="ml-2 text-red-600 italic"> — {translations[doc.id]}</span>
                        )}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{doc.content}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleTranslate(doc.id, doc.title)}
                    disabled={translatingId === doc.id}
                  >
                    {translatingId === doc.id ? "Translating..." : "Translate Title"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DocumentForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
};

export default DepartmentDocuments;
