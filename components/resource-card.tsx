'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { databases, storage, MEETING_DATABASE_ID, RESOURCE_COLLECTION_ID, STORAGE_BUCKET_ID } from '@/lib/appwrite';
import { Resource } from '@/lib/types';
import { format } from 'date-fns';
import { formatFileSize } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface ResourceCardProps {
  resource: Resource;
  onDelete?: () => void;
}

export function ResourceCard({ resource, onDelete }: ResourceCardProps) {
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async () => {
    try {
      if (!storage) return;
      const fileUrl = storage.getFileView(STORAGE_BUCKET_ID, resource.fileId).href;
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download the file',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!databases || !storage) return;

    setIsDeleting(true);
    try {
      // First try to delete the file from storage
      try {
        await storage.deleteFile(STORAGE_BUCKET_ID, resource.fileId);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
        // Continue with document deletion even if file deletion fails
      }

      // Then delete the document from the database
      await databases.deleteDocument(
        MEETING_DATABASE_ID,
        RESOURCE_COLLECTION_ID,
        resource.$id!
      );

      toast({ 
        title: 'Success',
        description: 'Resource deleted successfully'
      });
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the resource. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">{resource.name}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={() => setShowDeleteAlert(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Uploaded by {resource.uploadedBy}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(resource.createdAt), 'PPp')}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {formatFileSize(parseInt(resource.fileSize, 10))}
            </span>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{resource.name}&quot; and its associated file.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 