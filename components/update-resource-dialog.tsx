'use client';

import { Resource } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ResourceForm } from './resource-form';
import { Button } from './ui/button';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

interface UpdateResourceDialogProps {
  resource: Resource;
  onUpdate?: () => Promise<void>;
}

export function UpdateResourceDialog({ resource, onUpdate }: UpdateResourceDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = async (updatedResource: Resource) => {
    setOpen(false);
    if (onUpdate) {
      await onUpdate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Resource</DialogTitle>
        </DialogHeader>
        <ResourceForm
          initialData={resource}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
} 