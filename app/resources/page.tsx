'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ResourceForm } from '@/components/resource-form';
import { ResourceCard } from '@/components/resource-card';
import { databases, COMPONENT_DATABASE_ID, RESOURCE_COLLECTION_ID } from '@/lib/appwrite';
import { Resource } from '@/lib/types';
import { Query } from 'appwrite';
import { config } from '@/lib/config';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      if (!databases) {
        console.error('Databases client not initialized');
        return;
      }

      if (!COMPONENT_DATABASE_ID || !RESOURCE_COLLECTION_ID) {
        console.error('Missing required configuration');
        return;
      }

      const response = await databases.listDocuments(
        COMPONENT_DATABASE_ID,
        RESOURCE_COLLECTION_ID,
        [Query.orderDesc('createdAt')]
      );
      
      setResources(response.documents as unknown as Resource[]);
    } catch (error) {
      console.error('Error fetching resources');
      // Log error type without sensitive data
      if (error instanceof Error) {
        console.error('Error type:', error.name);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Shared Resources</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <ResourceForm
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchResources();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No resources shared yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.$id}
              resource={resource}
              onDelete={fetchResources}
            />
          ))}
        </div>
      )}
    </div>
  );
} 