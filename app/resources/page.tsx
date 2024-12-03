'use client';

import { useEffect, useState } from 'react';
import { CreateResourceButton } from '@/components/create-resource-button';
import { ResourceCard } from '@/components/resource-card';
import { client, databases, COMPONENT_DATABASE_ID, RESOURCE_COLLECTION_ID } from '@/lib/appwrite';
import { Resource } from '@/lib/types';
import { Query } from 'appwrite';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      if (!databases) {
        throw new Error('Database service not initialized');
      }

      const response = await databases.listDocuments(
        COMPONENT_DATABASE_ID,
        RESOURCE_COLLECTION_ID,
        [Query.orderDesc('createdAt')]
      );

      setResources(response.documents as unknown as Resource[]);
      setError(null);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();

    // Set up realtime subscription for all document changes
    const unsubscribe = client?.subscribe(
      [`databases.${COMPONENT_DATABASE_ID}.collections.${RESOURCE_COLLECTION_ID}.documents`],
      (response) => {
        // Immediately fetch updated data when any change occurs
        fetchResources();
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Resources</h1>
          <CreateResourceButton onSuccess={fetchResources} />
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Resources</h1>
          <CreateResourceButton onSuccess={fetchResources} />
        </div>
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resources</h1>
        <CreateResourceButton onSuccess={fetchResources} />
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No resources uploaded yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.$id}
              resource={resource}
              onUpdate={fetchResources}
              onDelete={fetchResources}
            />
          ))}
        </div>
      )}
    </div>
  );
} 