'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { databases, storage, MEETING_DATABASE_ID, RESOURCE_COLLECTION_ID, STORAGE_BUCKET_ID } from '@/lib/appwrite';
import { ID, Permission, Role } from 'appwrite';
import { useAuth } from '@/contexts/auth-context';

interface ResourceFormProps {
  onSuccess?: () => void;
}

export function ResourceForm({ onSuccess }: ResourceFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 100MB',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (!storage || !databases) {
        throw new Error('Storage or database service not initialized');
      }

      // Upload file
      const uploadedFile = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file,
        [Permission.read(Role.any())]
      );

      // Create resource document
      await databases.createDocument(
        MEETING_DATABASE_ID,
        RESOURCE_COLLECTION_ID,
        ID.unique(),
        {
          name,
          description,
          fileId: uploadedFile.$id,
          fileName: file.name,
          fileSize: file.size.toString(), // Convert to string
          uploadedBy: user?.name || 'Unknown',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        [Permission.read(Role.any())]
      );

      toast({ title: 'Resource uploaded successfully' });
      setName('');
      setDescription('');
      setFile(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload resource',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Resource name"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Resource description"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">File</label>
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Uploading...
          </div>
        ) : (
          'Upload Resource'
        )}
      </Button>
    </form>
  );
} 