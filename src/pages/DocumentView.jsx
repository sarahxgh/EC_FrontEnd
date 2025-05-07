
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, FileText, Trash, Edit, Download, Share, ChevronRight, Save, ArrowLeft
} from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Mock folders data
const foldersData = [
  { id: 1, name: "Folder 1", createdBy: 1 },
  { id: 2, name: "Folder 2", createdBy: 1 },
  { id: 3, name: "Private Folder", createdBy: 2 },
  { id: 4, name: "Shared Documents", createdBy: 2 },
];

// Mock documents data
const mockDocuments = [
  { 
    id: 1, 
    folderId: 1, 
    title: "Doc title 1", 
    content: "A well-planned project is halfway done.",
    createdBy: 1,
    subtitles: [
      { 
        id: 1, 
        title: "Sub-title", 
        items: [
          { id: 1, text: "Conduct user interviews to gather requirements", completed: true },
          { id: 2, text: "Define the app's key features", completed: false }
        ] 
      },
      { 
        id: 2, 
        title: "Sub-title", 
        items: [
          { id: 3, text: "Create wireframes using tools like Figma or Adobe XD", completed: false },
          { id: 4, text: "Implement the backend using Node.js and the frontend with React Native", completed: false }
        ] 
      }
    ],
    createdAt: "2023-05-15"
  },
  { 
    id: 2, 
    folderId: 1, 
    title: "Meeting Notes", 
    content: "Discussion about the upcoming project milestones",
    createdBy: 1,
    subtitles: [],
    createdAt: "2023-05-16"
  },
  { 
    id: 3, 
    folderId: 2, 
    title: "Project Plan", 
    content: "Timeline and resource allocation for Q3",
    createdBy: 1,
    subtitles: [],
    createdAt: "2023-05-17"
  },
  { 
    id: 4, 
    folderId: 3, 
    title: "Personal Notes", 
    content: "Ideas for personal development",
    createdBy: 2,
    subtitles: [],
    createdAt: "2023-05-18"
  }
];

const DocumentView = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  
  const [folder, setFolder] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDoc, setEditedDoc] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  useEffect(() => {
    // Find folder data
    const folderData = foldersData.find(f => f.id === Number(folderId));
    if (!folderData) {
      toast.error("Folder not found");
      navigate("/folders");
      return;
    }

    // Check if user has access to this folder
    if (user?.role !== "admin" && folderData.createdBy !== user?.id) {
      toast.error("You don't have access to this folder");
      navigate("/folders");
      return;
    }

    setFolder(folderData);

    // Get documents for this folder
    const folderDocs = mockDocuments.filter(doc => 
      doc.folderId === Number(folderId) && 
      (user?.role === "admin" || doc.createdBy === user?.id)
    );
    setDocuments(folderDocs);

    // Select first document if available
    if (folderDocs.length > 0 && !selectedDoc) {
      setSelectedDoc(folderDocs[0]);
    }
  }, [folderId, user, navigate]);

  const handleCreateDocument = () => {
    if (!newDocTitle.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    const newDocument = {
      id: Math.max(0, ...mockDocuments.map(doc => doc.id)) + 1,
      folderId: Number(folderId),
      title: newDocTitle,
      content: newDocContent,
      createdBy: user?.id || 0,
      subtitles: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDocuments([...documents, newDocument]);
    setSelectedDoc(newDocument);
    setNewDocTitle("");
    setNewDocContent("");
    setIsCreateModalOpen(false);
    toast.success("Document created successfully");
  };

  const handleDeleteDocument = (docId) => {
    if (confirm("Are you sure you want to delete this document?")) {
      const updatedDocs = documents.filter(doc => doc.id !== docId);
      setDocuments(updatedDocs);
      
      if (selectedDoc?.id === docId) {
        setSelectedDoc(updatedDocs.length > 0 ? updatedDocs[0] : null);
      }
      
      toast.success("Document deleted successfully");
    }
  };

  const handleSaveDocument = () => {
    if (!editedDoc || !editedDoc.title.trim()) {
      toast.error("Document title cannot be empty");
      return;
    }

    // Update the document
    const updatedDocs = documents.map(doc => 
      doc.id === editedDoc.id ? editedDoc : doc
    );
    
    setDocuments(updatedDocs);
    setSelectedDoc(editedDoc);
    setIsEditMode(false);
    toast.success("Document saved successfully");
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Discard changes
      setIsEditMode(false);
      setEditedDoc(null);
    } else {
      // Enter edit mode
      setIsEditMode(true);
      setEditedDoc({...selectedDoc});
    }
  };

  const handleCheckboxChange = (subtitleId, itemId) => {
    if (!isEditMode || !editedDoc) return;

    const updatedSubtitles = editedDoc.subtitles.map((subtitle) => {
      if (subtitle.id === subtitleId) {
        const updatedItems = subtitle.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });
        return { ...subtitle, items: updatedItems };
      }
      return subtitle;
    });

    setEditedDoc({ ...editedDoc, subtitles: updatedSubtitles });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate("/folders")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Folders
          </Button>
          <div className="flex items-center">
            <span className="text-sm text-gray-500">{folder?.name}</span>
            {selectedDoc && (
              <>
                <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                <span className="text-sm font-medium">{selectedDoc.title}</span>
              </>
            )}
          </div>
          <div className="ml-auto">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Document List */}
          <div className="col-span-3 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Documents</h2>
            </div>
            <div className="divide-y max-h-[calc(100vh-250px)] overflow-y-auto">
              {documents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No documents in this folder
                </div>
              ) : (
                documents.map(doc => (
                  <div 
                    key={doc.id} 
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedDoc?.id === doc.id ? 'bg-gray-50' : ''}`}
                    onClick={() => {
                      if (isEditMode) {
                        if (confirm("Discard unsaved changes?")) {
                          setSelectedDoc(doc);
                          setIsEditMode(false);
                          setEditedDoc(null);
                        }
                      } else {
                        setSelectedDoc(doc);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="font-medium truncate">{doc.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {doc.createdAt}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Document Content */}
          <div className="col-span-9 bg-white rounded-lg shadow">
            {selectedDoc ? (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    {isEditMode ? (
                      <Input
                        value={editedDoc?.title || ''}
                        onChange={(e) => setEditedDoc({...editedDoc, title: e.target.value})}
                        className="text-xl font-bold mb-1 w-full"
                      />
                    ) : (
                      <h1 className="text-xl font-bold">{selectedDoc.title}</h1>
                    )}
                    <p className="text-sm text-gray-500">Date: {selectedDoc.createdAt}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    {isEditMode ? (
                      <Button size="sm" onClick={handleSaveDocument}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    ) : (
                      <Button size="sm" onClick={toggleEditMode}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {isEditMode ? (
                    <Textarea
                      value={editedDoc?.content || ''}
                      onChange={(e) => setEditedDoc({...editedDoc, content: e.target.value})}
                      className="min-h-[100px] w-full"
                    />
                  ) : (
                    <p className="text-gray-800">{selectedDoc.content}</p>
                  )}
                  
                  {(isEditMode ? editedDoc?.subtitles : selectedDoc.subtitles)?.map((subtitle) => (
                    <div key={subtitle.id} className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">{subtitle.title}</h3>
                      <div className="space-y-2">
                        {subtitle.items.map((item) => (
                          <div key={item.id} className="flex items-start space-x-2">
                            <Checkbox 
                              checked={item.completed}
                              onCheckedChange={() => handleCheckboxChange(subtitle.id, item.id)}
                              disabled={!isEditMode}
                              id={`item-${item.id}`}
                            />
                            <label 
                              htmlFor={`item-${item.id}`}
                              className={`${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                            >
                              {item.text}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)]">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500">No document selected</h3>
                <p className="text-gray-400 mb-4">Select a document from the list or create a new one</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Document
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Document Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Document Title</label>
              <Input
                placeholder="Enter document title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="w-full mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Document Content</label>
              <Textarea
                placeholder="Enter document content"
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                className="w-full mt-1"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDocument}>
              Create Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DocumentView;
