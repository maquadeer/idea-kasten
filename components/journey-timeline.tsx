'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Plus, Pencil, Trash2 } from 'lucide-react';
import { TimelineEvent, TimelineStatus } from '@/lib/types';
import { databases, MEETING_DATABASE_ID, TIMELINE_COLLECTION_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function JourneyTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TimelineStatus>('required');
  const [tags, setTags] = useState('');

  const [deletingEvent, setDeletingEvent] = useState<TimelineEvent | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      if (!databases) {
        throw new Error('Database service not initialized');
      }

      if (!TIMELINE_COLLECTION_ID) {
        throw new Error('Timeline collection ID not configured');
      }

      const response = await databases.listDocuments(
        MEETING_DATABASE_ID,
        TIMELINE_COLLECTION_ID,
        [Query.orderDesc('date')]
      );
      setEvents(response.documents as unknown as TimelineEvent[]);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      toast({
        title: 'Error',
        description: 'Please make sure the timeline collection is created in Appwrite',
        variant: 'destructive',
      });
      // Set some default events for demonstration
      setEvents([
        {
          $id: '2',
          title: 'Timeline Feature',
          date: '2023-12-20',
          description: 'Added project journey timeline visualization.',
          status: 'required',
          tags: ['Timeline', 'UI/UX'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          $id: '1',
          title: 'Project Initialization',
          date: '2023-12-01',
          description: 'Set up Next.js project with TypeScript and Tailwind CSS.',
          status: 'completed',
          tags: ['Next.js', 'TypeScript', 'Tailwind'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setDescription('');
    setStatus('required');
    setTags('');
    setEditingEvent(null);
  };

  const handleOpenDialog = (event?: TimelineEvent) => {
    if (event) {
      setEditingEvent(event);
      setTitle(event.title);
      setDate(event.date);
      setDescription(event.description);
      setStatus(event.status);
      setTags(event.tags.join(', '));
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!databases) return;

    try {
      const eventData = {
        title,
        date,
        description,
        status,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: editingEvent?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingEvent?.$id) {
        await databases.updateDocument(
          MEETING_DATABASE_ID,
          TIMELINE_COLLECTION_ID,
          editingEvent.$id,
          eventData
        );
        toast({ title: 'Event updated successfully' });
      } else {
        await databases.createDocument(
          MEETING_DATABASE_ID,
          TIMELINE_COLLECTION_ID,
          ID.unique(),
          eventData
        );
        toast({ title: 'Event added successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving timeline event:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save timeline event',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!databases || !deletingEvent?.$id) return;

    setIsDeleting(true);
    try {
      await databases.deleteDocument(
        MEETING_DATABASE_ID,
        TIMELINE_COLLECTION_ID,
        deletingEvent.$id
      );

      toast({ title: 'Event deleted successfully' });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting timeline event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the event',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
      setDeletingEvent(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading timeline...</div>;
  }

  const getStatusDisplay = (status: TimelineStatus) => {
    switch (status) {
      case 'completed':
        return { badge: 'Completed', icon: <CheckCircle2 className="w-6 h-6 text-green-500" /> };
      case 'required':
        return { badge: 'In Progress', icon: <Circle className="w-6 h-6 text-muted-foreground" /> };
      default:
        return { badge: 'Unknown', icon: <Circle className="w-6 h-6 text-muted-foreground" /> };
    }
  };

  return (
    <div className="relative container mx-auto px-4 py-8">
      <div className="flex justify-end mb-8">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={status}
                  onValueChange={(value: TimelineStatus) => setStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="required">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. UI, Backend, Feature"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingEvent ? 'Update Event' : 'Add Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="absolute left-4 sm:left-1/2 h-full w-0.5 bg-border -translate-x-1/2" />
      
      <div className="space-y-12">
        {events.map((event, index) => (
          <div key={event.$id} className={`relative flex items-center ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
            {/* Date - Mobile */}
            <div className="sm:hidden absolute -top-8 left-0 text-sm text-muted-foreground">
              {event.date}
            </div>
            
            {/* Content */}
            <div className={`ml-6 sm:ml-0 w-full sm:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'sm:mr-4' : 'sm:ml-4'}`}>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-end mb-2 gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(event)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => {
                      setDeletingEvent(event);
                      setShowDeleteAlert(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {/* Date - Desktop */}
                <div className="hidden sm:block text-sm text-muted-foreground mb-2">
                  {event.date}
                </div>
                
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{event.title}</h3>
                  <Badge variant="default" className={event.status === 'completed' ? 'bg-green-500' : ''}>
                    {getStatusDisplay(event.status).badge}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {event.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {event.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* Timeline Node */}
            <div className="absolute left-0 sm:left-1/2 w-12 h-12 -translate-x-1/2 flex items-center justify-center bg-background rounded-full border-2">
              {getStatusDisplay(event.status).icon}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this timeline event.
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
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 