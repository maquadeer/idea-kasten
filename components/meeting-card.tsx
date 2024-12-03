'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Meeting } from '@/lib/types';
import { format } from 'date-fns';
import { CalendarIcon, Link as LinkIcon, FileText, Trash2, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { storage, databases, MEETING_DATABASE_ID, MEETING_COLLECTION_ID, STORAGE_BUCKET_ID } from '@/lib/appwrite';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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

interface MeetingCardProps {
  meeting: Meeting;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function MeetingCard({ meeting, onDelete, onEdit }: MeetingCardProps) {
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!databases) return;
    
    setIsDeleting(true);
    try {
      // Delete the meeting
      await databases.deleteDocument(
        MEETING_DATABASE_ID,
        MEETING_COLLECTION_ID,
        meeting.$id!
      );

      // Delete attachments if any
      if (meeting.attachments?.length && storage) {
        for (const attachmentId of meeting.attachments) {
          try {
            await storage.deleteFile(STORAGE_BUCKET_ID, attachmentId);
          } catch (error) {
            console.error('Error deleting attachment:', error);
          }
        }
      }

      toast({
        title: "Meeting deleted",
        description: "The meeting has been deleted successfully.",
      });

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: "Error",
        description: "Failed to delete the meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const downloadAttachment = async (fileId: string) => {
    if (!storage) return;
    
    try {
      const fileUrl = storage.getFileView(STORAGE_BUCKET_ID, fileId).href;
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-sm">
                {format(new Date(meeting.date), 'PPP')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                onClick={() => setShowDeleteAlert(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-sm">Agenda</h3>
              <p className="text-sm text-muted-foreground break-words">{meeting.agenda}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-sm">Meeting Link</h3>
              <a
                href={meeting.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-2 break-all"
              >
                <LinkIcon className="h-4 w-4 flex-shrink-0" />
                <span>Join Meeting</span>
              </a>
            </div>

            {meeting.postMeetingNotes && (
              <div>
                <h3 className="font-semibold mb-2 text-sm">Post Meeting Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {meeting.postMeetingNotes}
                </p>
              </div>
            )}

            {meeting.attachments && meeting.attachments.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-sm">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {meeting.attachments.split(',').map((fileId) => (
                    <Button
                      key={fileId}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-sm h-8"
                      onClick={() => downloadAttachment(fileId)}
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Download</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the meeting and its attachments.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 