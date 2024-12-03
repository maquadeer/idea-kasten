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
  description: z.string().min(10),
  assignee: z.string().min(2),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
  status: z.enum(['todo', 'inprogress', 'done'] as const),
  inspirationImage: z.any().optional(),
});

interface ComponentFormProps {
  initialData?: Component;
  onSuccess?: () => void;
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
    setIsLoading(true);
    console.log('Form values:', values);

    try {
      if (!client || !databases || !storage) {
        console.error('Services not initialized:', {
          client: !!client,
          databases: !!databases,
          storage: !!storage
        });
        throw new Error('Appwrite services not initialized');
      }

      let imageId: string | null = null;

      // Handle image upload
      if (values.inspirationImage?.[0]) {
        const file = values.inspirationImage[0];
        console.log('Attempting to upload file:', {
          name: file.name,
          size: file.size,
          type: file.type
        });

        try {
          const uploadedFile = await storage.createFile(
            STORAGE_BUCKET_ID,
            ID.unique(),
            file,
            [Permission.read(Role.any())]
          );
          console.log('File uploaded:', uploadedFile);
          imageId = uploadedFile.$id;
          console.log('File ID:', imageId);
        } catch (uploadError) {
          console.error('Upload error details:', uploadError);
          toast({
            title: 'Image upload failed',
            description: 'Will create component without image',
            variant: 'destructive',
          });
          imageId = null;
        }
      }

      const componentData = {
        name: values.name,
        description: values.description,
        assignee: values.assignee,
        difficulty: values.difficulty as Difficulty,
        status: values.status as Status,
        inspirationImage: imageId,
        createdAt: initialData?.createdAt ? new Date(initialData.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Attempting to save component:', componentData);

      if (initialData?.$id) {
        const updated = await databases.updateDocument(
          COMPONENT_DATABASE_ID,
          COMPONENT_COLLECTION_ID,
          initialData.$id,
          componentData
        );
        console.log('Component updated:', updated);
        toast({ title: 'Component updated' });
      } else {
        const created = await databases.createDocument(
          COMPONENT_DATABASE_ID,
          COMPONENT_COLLECTION_ID,
          ID.unique(),
          componentData,
          [Permission.read(Role.any()), Permission.update(Role.any())]
        );
        console.log('Component created:', created);
        toast({ title: 'Component created' });
      }

      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Detailed error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save component',
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
                  onChange={(e) => onChange(e.target.files)}
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