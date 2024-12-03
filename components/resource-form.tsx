'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { databases, storage, COMPONENT_DATABASE_ID, RESOURCE_COLLECTION_ID, STORAGE_BUCKET_ID } from '@/lib/appwrite';
import { ID, Permission, Role } from 'appwrite';
import { useAuth } from '@/contexts/auth-context';
import { Resource } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface ResourceFormProps {
  initialData?: Resource;
  onSuccess?: (resource: Resource) => void;
}

export function ResourceForm({ initialData, onSuccess }: ResourceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!storage || !databases) {
        throw new Error('Storage or database service not initialized');
      }

      let fileId = initialData?.fileId || null;
      let fileName = initialData?.fileName || '';
      let fileSize = initialData?.fileSize || '';

      // Handle file upload separately
      if (file) {
        try {
          const uploadedFile = await storage.createFile(
            STORAGE_BUCKET_ID,
            ID.unique(),
            file,
            [Permission.read(Role.any())]
          );
          fileId = uploadedFile.$id;
          fileName = file.name;
          fileSize = file.size.toString();
        } catch (error) {
          console.error('Error uploading file');
          toast({
            title: 'Warning',
            description: 'Failed to upload new file. Other changes will still be saved.',
            variant: 'destructive',
          });
          // Keep existing file details
          fileId = initialData?.fileId || null;
          fileName = initialData?.fileName || '';
          fileSize = initialData?.fileSize || '';
        }
      }

      if (initialData?.$id) {
        // For updates, only include fields that have actually changed
        const updatedFields: Partial<Resource> = {};
        
        if (name !== initialData.name) updatedFields.name = name;
        if (description !== initialData.description) updatedFields.description = description;
        
        // Handle file upload separately
        if (file) {
          try {
            const uploadedFile = await storage.createFile(
              STORAGE_BUCKET_ID,
              ID.unique(),
              file,
              [Permission.read(Role.any())]
            );
            updatedFields.fileId = uploadedFile.$id;
            updatedFields.fileName = file.name;
            updatedFields.fileSize = file.size.toString();
          } catch (error) {
            console.error('Error uploading file:', error);
          }
        }

        // Only update if there are changes
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.updatedAt = new Date().toISOString();
          const updatedDoc = await databases.updateDocument(
            COMPONENT_DATABASE_ID,
            RESOURCE_COLLECTION_ID,
            initialData.$id,
            updatedFields
          ) as unknown as Resource;
          toast({ title: 'Resource updated' });
          if (onSuccess) {
            onSuccess(updatedDoc);
          }
        }
      } else {
        // For new resources
        if (!file) {
          toast({
            title: 'Error',
            description: 'Please select a file to upload',
            variant: 'destructive',
          });
          return;
        }

        // Upload file first
        const uploadedFile = await storage.createFile(
          STORAGE_BUCKET_ID,
          ID.unique(),
          file,
          [Permission.read(Role.any())]
        );

        const resourceData = {
          name,
          description,
          fileId: uploadedFile.$id,
          fileName: file.name,
          fileSize: file.size.toString(),
          uploadedBy: user?.name || 'Unknown',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const newDoc = await databases.createDocument(
          COMPONENT_DATABASE_ID,
          RESOURCE_COLLECTION_ID,
          ID.unique(),
          resourceData,
          [Permission.read(Role.any())]
        ) as unknown as Resource;
        toast({ title: 'Resource uploaded successfully' });
        if (onSuccess) {
          onSuccess(newDoc);
        }
      }

      setName('');
      setDescription('');
      setFile(null);
    } catch (error) {
      console.error('Error saving resource');
      toast({
        title: 'Error',
        description: 'Failed to save resource. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
          />
        </div>

        {!initialData && (
          <div>
            <label htmlFor="file" className="text-sm font-medium">File</label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>Save</>
          )}
        </Button>
      </div>
    </form>
  );
} 