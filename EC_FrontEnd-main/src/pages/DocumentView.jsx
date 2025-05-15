import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Plus, Search, FileText, Trash, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const initialDocs = [
  { id: 1, title: "Onboarding Guide", content: "Welcome to the team!", departmentId: 1 },
  { id: 2, title: "HR Policy", content: "Respect everyone.", departmentId: 2 },
  { id: 3, title: "Product Roadmap", content: "Q1 planning.", departmentId: 3 },
];

const DepartmentDocuments = () => {
  const { id } = useParams();
  const departmentId = parseInt(id);
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const deptDocs = initialDocs.filter((doc) => doc.departmentId === departmentId);
    setDocuments(deptDocs);
  }, [departmentId]);

  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreate = () => {
    setCurrent(null);
    setNewTitle("");
    setNewContent("");
    setIsModalOpen(true);
  };

  const openEdit = (doc) => {
    setCurrent(doc);
    setNewTitle(doc.title);
    setNewContent(doc.content);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const newDoc = {
      id: Math.max(0, ...documents.map((d) => d.id)) + 1,
      title: newTitle,
      content: newContent,
      departmentId,
    };
    setDocuments([...documents, newDoc]);
    setIsModalOpen(false);
    toast.success("Document created");
  };

  const handleEdit = () => {
    if (!current || !newTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const updated = documents.map((d) =>
      d.id === current.id ? { ...d, title: newTitle, content: newContent } : d
    );
    setDocuments(updated);
    setIsModalOpen(false);
    toast.success("Document updated");
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
          <h1 className="text-2xl font-semibold">Documents</h1>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-medium">Department #{departmentId}</h2>
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
                      <h3 className="font-medium truncate">{doc.title}</h3>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(doc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{current ? "Edit Document" : "Create Document"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              className="w-full h-32 border rounded-md p-2"
              placeholder="Content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={current ? handleEdit : handleCreate}>
              {current ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DepartmentDocuments;
