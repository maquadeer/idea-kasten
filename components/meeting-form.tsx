'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { databases, storage, MEETING_DATABASE_ID, MEETING_COLLECTION_ID, STORAGE_BUCKET_ID } from '@/lib/appwrite';
import { ID, Permission, Role } from 'appwrite';
import { useToast } from '@/hooks/use-toast';
import { Meeting } from '@/lib/types';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  date: z.date(),
  agenda: z.string().min(10),
  meetLink: z.string().url(),
  postMeetingNotes: z.string().optional(),
  attachments: z.any().optional(),
});

interface MeetingFormProps {
  initialData?: Meeting;
  onSuccess?: () => void;
}

export function MeetingForm({ initialData, onSuccess }: MeetingFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      date: new Date(initialData.date),
      agenda: initialData.agenda,
      meetLink: initialData.meetLink,
      postMeetingNotes: initialData.postMeetingNotes || '',
    } : {
      date: new Date(),
      agenda: '',
      meetLink: '',
      postMeetingNotes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      if (!databases) {
        throw new Error('Database service not initialized');
      }

      let attachmentId = initialData?.attachments;

      if (values.attachments?.[0]) {
        const file = values.attachments[0];
        try {
          const uploadedFile = await storage.createFile(
            STORAGE_BUCKET_ID,
            ID.unique(),
            file,
            [Permission.read(Role.any())]
          );
          attachmentId = uploadedFile.$id;
        } catch (error) {
          console.error('Error uploading file');
          throw error;
        }
      }

      const meetingData = {
        date: values.date.toISOString(),
        agenda: values.agenda,
        meetLink: values.meetLink,
        postMeetingNotes: values.postMeetingNotes || '',
        attachments: attachmentId || '',
        createdAt: initialData?.createdAt ? new Date(initialData.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.$id) {
        const updatedFields: Partial<typeof meetingData> = {};
        
        if (values.date.toISOString() !== new Date(initialData.date).toISOString()) {
          updatedFields.date = values.date.toISOString();
        }
        if (values.agenda !== initialData.agenda) updatedFields.agenda = values.agenda;
        if (values.meetLink !== initialData.meetLink) updatedFields.meetLink = values.meetLink;
        if (values.postMeetingNotes !== initialData.postMeetingNotes) {
          updatedFields.postMeetingNotes = values.postMeetingNotes || '';
        }
        if (attachmentId !== initialData.attachments) updatedFields.attachments = attachmentId || '';
        
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.updatedAt = new Date().toISOString();
          
          await databases.updateDocument(
            MEETING_DATABASE_ID,
            MEETING_COLLECTION_ID,
            initialData.$id,
            updatedFields
          );
          toast({ title: 'Meeting updated' });
        }
      } else {
        await databases.createDocument(
          MEETING_DATABASE_ID,
          MEETING_COLLECTION_ID,
          ID.unique(),
          meetingData,
          [Permission.read(Role.any())]
        );
        toast({ title: 'Meeting created' });
      }

      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving meeting');
      toast({
        title: 'Error',
        description: 'Failed to save meeting. Please try again.',
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
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="agenda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agenda</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Meeting agenda..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meetLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Link</FormLabel>
              <FormControl>
                <Input placeholder="https://meet.google.com/..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postMeetingNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Meeting Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Meeting notes..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attachments"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            'Saving...'
          ) : (
            initialData ? 'Update' : 'Create'
          )} Meeting
        </Button>
      </form>
    </Form>
  );
} 