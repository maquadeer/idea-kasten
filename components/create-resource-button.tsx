'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ResourceForm } from './resource-form';
import { useState } from 'react';
import { Resource } from '@/lib/types';

interface CreateResourceButtonProps {
  onSuccess?: () => Promise<void>;
}

export function CreateResourceButton({ onSuccess }: CreateResourceButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = async (resource: Resource) => {
    setOpen(false);
    if (onSuccess) await onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
        </DialogHeader>
        <ResourceForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
} 