'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Component } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UpdateComponentDialog } from './update-component-dialog';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { storage, databases, STORAGE_BUCKET_ID, COMPONENT_DATABASE_ID, COMPONENT_COLLECTION_ID } from '@/lib/appwrite';
import { Trash2, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface ComponentCardProps {
  component: Component;
  onUpdate?: () => Promise<void>;
}

export function ComponentCard({ component, onUpdate }: ComponentCardProps) {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  };

  useEffect(() => {
    if (component.inspirationImage && storage) {
      try {
        const url = storage.getFileView(STORAGE_BUCKET_ID, component.inspirationImage).href;
        setImageUrl(url);
        setImageError(false);
      } catch (error) {
        console.error('Error getting file view URL:', error);
        setImageError(true);
      }
    }
  }, [component.inspirationImage]);

  const handleDelete = async () => {
    if (!databases) return;
    
    setIsDeleting(true);
    try {
      await databases.deleteDocument(
        COMPONENT_DATABASE_ID,
        COMPONENT_COLLECTION_ID,
        component.$id!
      );

      if (component.inspirationImage && storage) {
        try {
          await storage.deleteFile(STORAGE_BUCKET_ID, component.inspirationImage);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      toast({
        title: "Component deleted",
        description: "The component has been deleted successfully.",
      });

      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      console.error('Error deleting component:', error);
      toast({
        title: "Error",
        description: "Failed to delete the component. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  return (
    <>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowDetails(true)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{component.name}</h3>
              <Badge className={difficultyColors[component.difficulty]}>
                {component.difficulty}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteAlert(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{component.description}</p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{component.assignee[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{component.assignee}</span>
            </div>

            {imageUrl && !imageError && (
              <div className="relative aspect-video w-full max-w-[200px] h-[150px] mx-auto overflow-hidden rounded-lg">
                <Image
                  src={imageUrl}
                  alt={component.name}
                  fill
                  className="object-contain"
                  onError={() => setImageError(true)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(true);
                  }}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Component</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{component.name}&quot; and its associated files.
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

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {component.name}
              <Badge className={difficultyColors[component.difficulty]}>
                {component.difficulty}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">{component.description}</p>
            
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{component.assignee[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Assigned to</p>
                <p className="text-sm text-muted-foreground">{component.assignee}</p>
              </div>
            </div>

            {imageUrl && !imageError && (
              <div className="relative w-full max-w-[400px] h-[300px] mx-auto overflow-hidden rounded-lg">
                <Image
                  src={imageUrl}
                  alt={component.name}
                  fill
                  className="object-contain"
                  priority
                  onError={() => setImageError(true)}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <UpdateComponentDialog
                component={component}
                onUpdate={onUpdate}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setShowDetails(false);
                  setShowDeleteAlert(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}