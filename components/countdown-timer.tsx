'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Pencil, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { databases, COMPONENT_DATABASE_ID, TIMER_COLLECTION_ID } from '@/lib/appwrite';
import { ID, Permission, Role } from 'appwrite';
import { useToast } from '@/hooks/use-toast';
import { Timer } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex items-center">
    <span className="text-lg font-semibold">{value}</span>
    <span className="text-lg text-muted-foreground ml-1">{label}</span>
  </div>
);

export function CountdownTimer() {
  const [targetDate, setTargetDate] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editDate, setEditDate] = useState('');

  // Fetch timer data on component mount
  useEffect(() => {
    const fetchTimer = async () => {
      try {
        if (!databases) return;

        const response = await databases.listDocuments(
          COMPONENT_DATABASE_ID,
          TIMER_COLLECTION_ID
        );

        if (response.documents.length > 0) {
          const timer = response.documents[0] as unknown as Timer;
          setTargetDate(timer.targetDate);
          setIsActive(timer.isActive);
        }
      } catch (error) {
        console.error('Error fetching timer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimer();
  }, []);

  // Calculate time left
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && targetDate) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const target = new Date(targetDate).getTime();
        const difference = target - now;

        if (difference <= 0) {
          setTimeLeft(null);
          setIsActive(false);
          updateTimer(targetDate, false);
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, minutes });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, targetDate]);

  const updateTimer = async (date: string, active: boolean) => {
    try {
      if (!databases) return;

      const response = await databases.listDocuments(
        COMPONENT_DATABASE_ID,
        TIMER_COLLECTION_ID
      );

      const timerData = {
        targetDate: date,
        isActive: active,
        updatedAt: new Date().toISOString(),
      };

      if (response.documents.length > 0) {
        // Update existing timer
        await databases.updateDocument(
          COMPONENT_DATABASE_ID,
          TIMER_COLLECTION_ID,
          response.documents[0].$id,
          timerData
        );
      } else {
        // Create new timer
        await databases.createDocument(
          COMPONENT_DATABASE_ID,
          TIMER_COLLECTION_ID,
          ID.unique(),
          {
            ...timerData,
            createdAt: new Date().toISOString(),
          },
          [Permission.read(Role.any()), Permission.update(Role.any())]
        );
      }
    } catch (error) {
      console.error('Error updating timer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update timer',
        variant: 'destructive',
      });
    }
  };

  const handleStartTimer = async () => {
    if (targetDate) {
      setIsActive(true);
      await updateTimer(targetDate, true);
    }
  };

  const handleStopTimer = async () => {
    setIsActive(false);
    setTimeLeft(null);
    await updateTimer(targetDate, false);
  };

  const handleEdit = async () => {
    setEditDate(targetDate);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    setTargetDate(editDate);
    await updateTimer(editDate, true);
    setShowEditDialog(false);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-background/60 backdrop-blur-sm border border-white/20">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-3 bg-background/60 backdrop-blur-sm border border-white/20">
        <div className="flex items-center justify-between w-full">
          {!targetDate ? (
            <div className="flex-1 max-w-[200px]">
              <Input
                type="datetime-local"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={isActive}
                className="h-8"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Time Remaining:</span>
              {timeLeft && (
                <div className="flex items-center gap-2">
                  <TimeUnit value={timeLeft.days} label="d" />
                  <span className="text-muted-foreground">:</span>
                  <TimeUnit value={timeLeft.hours} label="h" />
                  <span className="text-muted-foreground">:</span>
                  <TimeUnit value={timeLeft.minutes} label="m" />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            {!isActive && targetDate && (
              <Button
                onClick={handleStartTimer}
                size="sm"
                className="h-7 px-3"
              >
                Start
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              disabled={!isActive}
              className="h-7 w-7"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStopTimer}
              disabled={!isActive}
              className="h-7 w-7 text-red-500 hover:text-red-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Timer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="datetime-local"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 