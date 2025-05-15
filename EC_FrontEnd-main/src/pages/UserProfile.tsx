
import { useState } from "react";
import { Mail, Phone, Upload, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    firstName: "Alaa",
    lastName: "Mohamed",
    userName: "alaa.mohamed",
    email: "alaa.mohamed@example.com",
    phone: "+20 123 456 789",
    jobTitle: "Product Design",
    timeZone: "Eastern European Time (EET), Cairo UTC +3"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSave = () => {
    toast.success("Profile updated successfully");
  };

  const handleCancel = () => {
    toast.info("Changes discarded");
  };

  const handlePhotoUpload = () => {
    // This would typically open a file dialog
    toast.info("Photo upload functionality would be implemented here");
  };

  const handleDelete = () => {
    toast.error("Account deletion would be implemented here");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-blue-700">{formData.firstName} {formData.lastName}</h1>
              <p className="text-gray-600">{formData.jobTitle}</p>
              <p className="text-gray-500 text-sm">{formData.timeZone}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handlePhotoUpload}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload New Photo
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "personal" 
                  ? "text-green-500 border-b-2 border-green-500" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => handleTabChange("personal")}
            >
              Personal Info
            </button>
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "company" 
                  ? "text-gray-900 border-b-2 border-gray-900" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => handleTabChange("company")}
            >
              Company
            </button>
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "privacy" 
                  ? "text-gray-900 border-b-2 border-gray-900" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => handleTabChange("privacy")}
            >
              Privacy
            </button>
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === "help" 
                  ? "text-gray-900 border-b-2 border-gray-900" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => handleTabChange("help")}
            >
              Help
            </button>
          </div>
        </div>

        {/* Personal Info Tab Content */}
        {activeTab === "personal" && (
          <Card className="p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. Alaa"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g. Mohamed"
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                User Name
              </label>
              <Input
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="e.g. alaa.mohamed"
                className="w-full"
              />
            </div>

            <Separator className="my-8" />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 gap-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {/* Placeholder content for other tabs */}
        {activeTab === "company" && (
          <Card className="p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Company Information</h3>
            <p className="text-gray-500">Company settings would go here.</p>
          </Card>
        )}

        {activeTab === "privacy" && (
          <Card className="p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
            <p className="text-gray-500">Privacy and security settings would go here.</p>
          </Card>
        )}

        {activeTab === "help" && (
          <Card className="p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Help Center</h3>
            <p className="text-gray-500">Help documentation and support options would go here.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
