'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ComponentForm } from './component-form';
import { Component } from '@/lib/types';

interface CreateComponentButtonProps {
  onSuccess?: (component: Component) => void;
}

export function CreateComponentButton({ onSuccess }: CreateComponentButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-0 md:mr-2" />
          <span className="hidden md:inline">Add Component</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Component</DialogTitle>
        </DialogHeader>
        <div className="p-1">
          <ComponentForm onSuccess={onSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}