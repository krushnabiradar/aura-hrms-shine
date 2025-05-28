
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { 
  FileText, 
  Folder, 
  Upload, 
  Download, 
  Search, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Tag
} from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";

export default function DocumentsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newDocument, setNewDocument] = useState({
    name: "",
    description: "",
    category_id: "",
    access_level: "tenant",
    tags: ""
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: ""
  });

  const {
    documents,
    isLoadingDocuments,
    documentCategories,
    isLoadingDocumentCategories,
    createDocument,
    isCreatingDocument,
    createDocumentCategory,
    isCreatingDocumentCategory,
    updateDocument,
    isUpdatingDocument
  } = useDocuments();

  const handleCreateDocument = async () => {
    if (!newDocument.name) {
      toast.error('Please enter a document name');
      return;
    }

    try {
      await createDocument({
        name: newDocument.name,
        description: newDocument.description,
        category_id: newDocument.category_id || null,
        access_level: newDocument.access_level as any,
        file_url: `https://example.com/documents/${newDocument.name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
        file_type: 'application/pdf',
        file_size: 1024000,
        tags: newDocument.tags ? newDocument.tags.split(',').map(tag => tag.trim()) : null
      });

      toast.success('Document created successfully!');
      setNewDocument({
        name: "",
        description: "",
        category_id: "",
        access_level: "tenant",
        tags: ""
      });
    } catch (error) {
      toast.error('Failed to create document');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      await createDocumentCategory({
        name: newCategory.name,
        description: newCategory.description
      });

      toast.success('Category created successfully!');
      setNewCategory({ name: "", description: "" });
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleDownload = (document: any) => {
    toast.success(`Downloading ${document.name}`);
    // In a real app, this would trigger the actual download
  };

  const getAccessLevelBadge = (level: string) => {
    const colors = {
      public: "bg-green-100 text-green-800",
      tenant: "bg-blue-100 text-blue-800",
      private: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge variant="secondary" className={colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const getFileTypeIcon = (fileType: string | null) => {
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Management</h2>
          <p className="text-muted-foreground">Organize and manage company documents</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Files stored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentCategories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Document categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(
                documents?.reduce((total, doc) => total + (doc.file_size || 0), 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents?.filter(doc => 
                new Date(doc.created_at).getMonth() === new Date().getMonth()
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Documents uploaded</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Document Library</CardTitle>
                  <CardDescription>Browse and manage your documents</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Document</DialogTitle>
                      <DialogDescription>
                        Add a document to the library
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Document Name *</Label>
                        <Input
                          id="name"
                          value={newDocument.name}
                          onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
                          placeholder="Enter document name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newDocument.description}
                          onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                          placeholder="Document description"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newDocument.category_id}
                          onValueChange={(value) => setNewDocument({...newDocument, category_id: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentCategories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="access_level">Access Level</Label>
                        <Select
                          value={newDocument.access_level}
                          onValueChange={(value) => setNewDocument({...newDocument, access_level: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="tenant">Tenant</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                          id="tags"
                          value={newDocument.tags}
                          onChange={(e) => setNewDocument({...newDocument, tags: e.target.value})}
                          placeholder="policy, handbook, training"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleCreateDocument}
                      disabled={isCreatingDocument}
                      className="w-full"
                    >
                      {isCreatingDocument ? 'Adding...' : 'Add Document'}
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {documentCategories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingDocuments ? (
                <div className="text-center py-8">Loading documents...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getFileTypeIcon(document.file_type)}
                            <div>
                              <div className="font-medium">{document.name}</div>
                              {document.description && (
                                <div className="text-sm text-muted-foreground">{document.description}</div>
                              )}
                              {document.tags && document.tags.length > 0 && (
                                <div className="flex space-x-1 mt-1">
                                  {document.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {document.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{document.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{document.document_categories?.name || 'Uncategorized'}</TableCell>
                        <TableCell>{formatFileSize(document.file_size)}</TableCell>
                        <TableCell>{getAccessLevelBadge(document.access_level)}</TableCell>
                        <TableCell>{new Date(document.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(document)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {filteredDocuments.length === 0 && !isLoadingDocuments && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Document Categories</CardTitle>
                  <CardDescription>Organize documents into categories</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                      <DialogDescription>
                        Add a new document category
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-name">Category Name *</Label>
                        <Input
                          id="category-name"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                          placeholder="Enter category name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-description">Description</Label>
                        <Textarea
                          id="category-description"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                          placeholder="Category description"
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleCreateCategory}
                      disabled={isCreatingDocumentCategory}
                      className="w-full"
                    >
                      {isCreatingDocumentCategory ? 'Creating...' : 'Create Category'}
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDocumentCategories ? (
                <div className="text-center py-8">Loading categories...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documentCategories?.map((category) => (
                    <Card key={category.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Folder className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-base">{category.name}</CardTitle>
                          </div>
                          <Badge variant="outline">
                            {documents?.filter(doc => doc.category_id === category.id).length || 0}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {category.description || 'No description'}
                        </p>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Upload new documents to the library</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop files here, or click to select files
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
