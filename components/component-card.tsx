'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Component } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UpdateComponentDialog } from './update-component-dialog';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { storage, databases, STORAGE_BUCKET_ID, COMPONENT_DATABASE_ID, COMPONENT_COLLECTION_ID } from '@/lib/appwrite';
import { Trash2, Maximize2, Pencil } from 'lucide-react';
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
import { ComponentForm } from './component-form';
import { cn } from '@/lib/utils';

interface ComponentCardProps {
  component: Component;
  onUpdate?: () => Promise<void>;
}

const statusConfig = {
  done: {
    color: "bg-green-500",
    background: "bg-green-500/10",
    label: "Completed"
  },
  inprogress: {
    color: "bg-yellow-500",
    background: "bg-yellow-500/10",
    label: "In Progress"
  },
  todo: {
    color: "bg-red-500",
    background: "bg-red-500/10",
    label: "To Do"
  },
} as const;

export function ComponentCard({ component, onUpdate }: ComponentCardProps) {
  console.log('Component data:', {
    name: component.name,
    tags: component.tags,
    isArray: Array.isArray(component.tags),
    type: typeof component.tags
  });
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  
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

  // Ensure tags is always an array
  const tags = Array.isArray(component.tags) ? component.tags : [];

  return (
    <>
      <Card className="cursor-pointer transition-all duration-300 h-full backdrop-blur-sm bg-background/60 border border-white/20 shadow-lg hover:shadow-xl hover:bg-background/80 hover:border-white/30">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="font-semibold">{component.name}</h3>
              <div className="flex flex-wrap gap-1">
                {Array.isArray(component.tags) && component.tags.length > 0 ? (
                  component.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="text-xs  backdrop-blur-sm"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-background/60"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUpdateDialog(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-100/30"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteAlert(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{component.description}</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 ring-1 ring-white/20">
                  <AvatarFallback className="bg-background/60 backdrop-blur-sm">
                    {component.assignee[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">{component.assignee}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-sm",
                  statusConfig[component.status].background
                )}>
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    statusConfig[component.status].color
                  )} />
                  <span className="text-xs text-muted-foreground">
                    {statusConfig[component.status].label}
                  </span>
                </div>
              </div>
            </div>

            {imageUrl && !imageError && (
              <div className="relative aspect-video w-full mx-auto overflow-hidden rounded-lg ring-1 ring-white/20">
                <Image
                  src={imageUrl}
                  alt={component.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
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
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1">
              {component.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <p className="text-muted-foreground">{component.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>{component.assignee[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Assigned to</p>
                  <p className="text-sm text-muted-foreground">{component.assignee}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full",
                  statusConfig[component.status].background
                )}>
                  <span className={cn(
                    "h-3 w-3 rounded-full",
                    statusConfig[component.status].color
                  )} />
                  <span className="text-sm">
                    {statusConfig[component.status].label}
                  </span>
                </div>
              </div>
            </div>

            {imageUrl && !imageError && (
              <div className="relative w-full h-[350px] mx-auto overflow-hidden rounded-lg">
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

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Component</DialogTitle>
          </DialogHeader>
          <div className="p-1">
            <ComponentForm
              initialData={component}
              onSuccess={async (updatedComponent: Component) => {
                setShowUpdateDialog(false);
                if (onUpdate) await onUpdate();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}