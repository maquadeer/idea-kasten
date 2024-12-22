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
import { Component, Difficulty, Status } from '@/lib/types';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string(),
  assignee: z.string().min(2),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      assignee: '',
      difficulty: 'medium',
      status: 'todo',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!client || !databases || !storage) {
        console.error('Services not initialized');
        return;
      }

      setIsLoading(true);
      let imageId: string | undefined = initialData?.inspirationImage;

      // Handle image upload separately
      if (values.inspirationImage instanceof File) {
        try {
          const uploadedFile = await storage.createFile(
            STORAGE_BUCKET_ID,
            ID.unique(),
            values.inspirationImage
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
          imageId = initialData?.inspirationImage;
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

      let updatedComponent: Component | null = null;

      if (initialData?.$id) {
        // For updates, only include fields that have actually changed
        const updatedFields: Partial<Component> = {};
        
        // Compare each field with initial data
        if (values.name !== initialData.name) updatedFields.name = values.name;
        if (values.description !== initialData.description) updatedFields.description = values.description;
        if (values.assignee !== initialData.assignee) updatedFields.assignee = values.assignee;
        if (values.difficulty !== initialData.difficulty) updatedFields.difficulty = values.difficulty as Difficulty;
        if (values.status !== initialData.status) updatedFields.status = values.status as Status;
        
        // Make sure to include inspirationImage in the updatedFields
        if (imageId !== initialData?.inspirationImage) {
          updatedFields.inspirationImage = imageId;
        }
        
        // Only update if there are changes
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.updatedAt = new Date();
          
          updatedComponent = await databases.updateDocument(
            COMPONENT_DATABASE_ID,
            COMPONENT_COLLECTION_ID,
            initialData.$id,
            updatedFields
          ) as unknown as Component;

          toast({ 
            title: 'Component updated',
            description: Object.keys(updatedFields).join(', ') + ' updated successfully'
          });
        }
      } else {
        // For new components, include all fields
        const newComponent: Component = {
          name: values.name,
          description: values.description,
          assignee: values.assignee,
          difficulty: values.difficulty as Difficulty,
          status: values.status as Status,
          inspirationImage: imageId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        updatedComponent = await databases.createDocument(
          COMPONENT_DATABASE_ID,
          COMPONENT_COLLECTION_ID,
          ID.unique(),
          newComponent,
          [Permission.read(Role.any()), Permission.update(Role.any())]
        ) as unknown as Component;
        toast({ title: 'Component created' });
      }

      form.reset();
      if (onSuccess && updatedComponent) {
        onSuccess(updatedComponent);
      }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Component name" {...field} />
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
                <Textarea placeholder="Component description" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assignee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee</FormLabel>
              <FormControl>
                <Input placeholder="Assignee name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="inspirationImage"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Inspiration Image (optional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            'Creating...'
          ) : (
            initialData ? 'Update' : 'Create'
          )} Component
        </Button>
      </form>
    </Form>
  );
}