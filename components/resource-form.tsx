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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

interface ResourceFormProps {
  initialData?: Resource;
  onSuccess?: (resource: Resource) => void;
}

const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string(),
  url: z.string().url().optional().or(z.literal('')),
});

export function ResourceForm({ initialData, onSuccess }: ResourceFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      url: initialData?.url || '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      if (!storage || !databases) {
        throw new Error('Storage or database service not initialized');
      }

      let fileId = initialData?.fileId || null;
      let fileName = initialData?.fileName || '';
      let fileSize = initialData?.fileSize || '';

      // Handle file upload separately
      if (selectedFile) {
        try {
          const uploadedFile = await storage.createFile(
            STORAGE_BUCKET_ID,
            ID.unique(),
            selectedFile,
            [Permission.read(Role.any())]
          );
          fileId = uploadedFile.$id;
          fileName = selectedFile.name;
          fileSize = selectedFile.size.toString();
        } catch (error) {
          console.error('Error uploading file');
          toast({
            title: 'Warning',
            description: 'Failed to upload new file. Other changes will still be saved.',
            variant: 'destructive',
          });
          fileId = initialData?.fileId || null;
          fileName = initialData?.fileName || '';
          fileSize = initialData?.fileSize || '';
        }
      }

      if (initialData?.$id) {
        // Update existing resource
        const updatedFields: Partial<Resource> = {};
        
        if (values.name !== initialData.name) updatedFields.name = values.name;
        if (values.description !== initialData.description) updatedFields.description = values.description;
        if (values.url !== initialData.url) updatedFields.url = values.url;
        
        if (selectedFile) {
          updatedFields.fileId = fileId!;
          updatedFields.fileName = fileName;
          updatedFields.fileSize = fileSize;
        }

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
        // Create new resource
        if (!selectedFile) {
          toast({
            title: 'Error',
            description: 'Please select a file to upload',
            variant: 'destructive',
          });
          return;
        }

        const resourceData = {
          name: values.name,
          description: values.description,
          url: values.url,
          fileId: fileId!,
          fileName: fileName,
          fileSize: fileSize,
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

      form.reset();
      setSelectedFile(null);
    } catch (error) {
      console.error('Error saving resource:', error);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://example.com" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {!initialData && (
            <div>
              <label htmlFor="file" className="text-sm font-medium">File</label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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
    </Form>
  );
} 