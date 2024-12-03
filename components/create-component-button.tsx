'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ComponentForm } from './component-form';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface CreateComponentButtonProps {
  onSuccess?: () => Promise<void>;
}

export function CreateComponentButton({ onSuccess }: CreateComponentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Component
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Component</DialogTitle>
        </DialogHeader>
        <ComponentForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}