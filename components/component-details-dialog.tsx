'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Component } from '@/lib/types';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { storage, STORAGE_BUCKET_ID } from '@/lib/appwrite';

interface ComponentDetailsDialogProps {
  component: Component;
}

export function ComponentDetailsDialog({ component }: ComponentDetailsDialogProps) {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  };

  useEffect(() => {
    if (component.inspirationImage && storage) {
      try {
        const url = storage.getFileView(STORAGE_BUCKET_ID, component.inspirationImage).href;
        setImageUrl(url);
        setImageError(false);
      } catch (error) {
        console.error('Error loading image');
        setImageError(true);
      }
    }
  }, [component.inspirationImage]);

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <div className="text-left hover:bg-accent rounded-lg transition-colors p-2 cursor-pointer">
          {component.name}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{component.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {imageUrl && !imageError && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt="Inspiration"
                fill
                className="object-cover"
                onError={() => {
                  console.error('Failed to load image in dialog:', imageUrl);
                  setImageError(true);
                }}
              />
            </div>
          )}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>{component.assignee[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{component.assignee}</p>
                <p className="text-sm text-muted-foreground">Assignee</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={difficultyColors[component.difficulty]}>
                {component.difficulty}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {component.status.replace('inprogress', 'In Progress')}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">{component.description}</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Created {format(new Date(component.createdAt), 'PP')}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Updated {format(new Date(component.updatedAt), 'PP')}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}