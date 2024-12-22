'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { client, databases, storage, COMPONENT_DATABASE_ID, COMPONENT_COLLECTION_ID, STORAGE_BUCKET_ID } from '@/lib/appwrite';
import { ID, Permission, Role } from 'appwrite';
import { useToast } from '@/hooks/use-toast';
import { Component, Status } from '@/lib/types';
import { useState } from 'react';
import { Loader2, X } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string(),
  assignee: z.string().min(2),
  tags: z.array(z.string()),
  status: z.enum(['todo', 'inprogress', 'done'] as const),
  inspirationImage: z.any().optional(),
});

interface ComponentFormProps {
  initialData?: Component;
  onSuccess?: (updatedComponent: Component) => void;
}

// Generate a short unique ID (6 characters)
function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function ComponentForm({ initialData, onSuccess }: ComponentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      assignee: initialData?.assignee || '',
      tags: initialData?.tags || [],
      status: initialData?.status || 'todo',
      inspirationImage: undefined,
    },
  });

  const tags = form.watch('tags') || [];

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedInput = tagInput.trim();
      
      if (trimmedInput) {
        const currentTags = Array.isArray(form.getValues('tags')) ? form.getValues('tags') : [];
        if (!currentTags.includes(trimmedInput)) {
          form.setValue('tags', [...currentTags, trimmedInput]);
        }
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = Array.isArray(form.getValues('tags')) ? form.getValues('tags') : [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!databases || !storage) {
        console.error('Services not initialized');
        return;
      }

      setIsLoading(true);
      let imageId: string | undefined = initialData?.inspirationImage;

      // Handle image upload
      if (values.inspirationImage instanceof File) {
        try {
          const uploadedFile = await storage.createFile(
            STORAGE_BUCKET_ID,
            ID.unique(),
            values.inspirationImage,
            [Permission.read(Role.any())]
          );
          imageId = uploadedFile.$id;
          
          // If updating and there's an old image, delete it
          if (initialData?.inspirationImage) {
            try {
              await storage.deleteFile(STORAGE_BUCKET_ID, initialData.inspirationImage);
            } catch (error) {
              console.error('Error deleting old image:', error);
            }
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: 'Warning',
            description: 'Failed to upload image. Other changes will still be saved.',
            variant: 'destructive',
          });
        }
      } else if (values.inspirationImage === null && initialData?.inspirationImage) {
        // If image was cleared, delete the old image
        try {
          await storage.deleteFile(STORAGE_BUCKET_ID, initialData.inspirationImage);
          imageId = undefined;
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      const formattedTags = Array.isArray(values.tags) ? values.tags : [];
      
      if (initialData?.$id) {
        // Update existing component
        const updatedFields = {
          name: values.name,
          description: values.description,
          assignee: values.assignee,
          tags: formattedTags,
          status: values.status,
          inspirationImage: imageId,
          updatedAt: new Date(),
        };

        const updatedComponent = await databases.updateDocument(
          COMPONENT_DATABASE_ID,
          COMPONENT_COLLECTION_ID,
          initialData.$id,
          updatedFields
        );

        toast({ title: 'Component updated' });
        if (onSuccess) {
          onSuccess(updatedComponent as unknown as Component);
        }
      } else {
        // Create new component
        const newComponent = {
          name: values.name,
          description: values.description,
          assignee: values.assignee,
          tags: formattedTags,
          status: values.status,
          inspirationImage: imageId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const createdComponent = await databases.createDocument(
          COMPONENT_DATABASE_ID,
          COMPONENT_COLLECTION_ID,
          ID.unique(),
          newComponent,
          [Permission.read(Role.any()), Permission.update(Role.any())]
        );

        toast({ title: 'Component created' });
        if (onSuccess) {
          onSuccess(createdComponent as unknown as Component);
        }
      }

      form.reset();
      setTagInput('');
    } catch (error) {
      console.error('Error saving component:', error);
      toast({
        title: 'Error',
        description: 'Failed to save component. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="col-span-2">
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
          </div>

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="assignee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      placeholder="Type and press Enter to add tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="inspirationImage"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Inspiration Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}