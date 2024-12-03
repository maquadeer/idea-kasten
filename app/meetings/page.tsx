'use client';

import { useState } from 'react';
import { MeetingCard } from '@/components/meeting-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MeetingForm } from '@/components/meeting-form';
import { databases, MEETING_DATABASE_ID, MEETING_COLLECTION_ID } from '@/lib/appwrite';
import { Meeting } from '@/lib/types';
import { useEffect } from 'react';
import { Query } from 'appwrite';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const fetchMeetings = async () => {
    try {
      if (!databases) return;

      const response = await databases.listDocuments(
        MEETING_DATABASE_ID,
        MEETING_COLLECTION_ID,
        [Query.orderDesc('date')]
      );
      setMeetings(response.documents as unknown as Meeting[]);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleOpenDialog = (meeting?: Meeting) => {
    if (meeting) {
      setEditingMeeting(meeting);
    } else {
      setEditingMeeting(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMeeting(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Meetings</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] sm:w-[425px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Create New Meeting</DialogTitle>
            </DialogHeader>
            <MeetingForm 
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchMeetings();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-[425px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {editingMeeting ? 'Edit Meeting' : 'Create New Meeting'}
            </DialogTitle>
          </DialogHeader>
          <MeetingForm 
            initialData={editingMeeting || undefined}
            onSuccess={() => {
              handleCloseDialog();
              fetchMeetings();
            }} 
          />
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="text-center py-8">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No meetings scheduled yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.$id}
              meeting={meeting}
              onDelete={fetchMeetings}
              onEdit={() => handleOpenDialog(meeting)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 