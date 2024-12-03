'use client';

import { useEffect, useState } from 'react';
import { CreateComponentButton } from '@/components/create-component-button';
import { ComponentCard } from '@/components/component-card';
import { databases, COMPONENT_DATABASE_ID, COMPONENT_COLLECTION_ID } from '@/lib/appwrite';
import { Component } from '@/lib/types';
import { Query } from 'appwrite';

export default function Home() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async () => {
    try {
      if (!databases) {
        throw new Error('Database service not initialized');
      }

      const response = await databases.listDocuments(
        COMPONENT_DATABASE_ID,
        COMPONENT_COLLECTION_ID,
        [Query.orderDesc('createdAt')]
      );

      setComponents(response.documents as unknown as Component[]);
      setError(null);
    } catch (error) {
      console.error('Error fetching components:', error);
      setError('Failed to load components. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Components</h1>
          <CreateComponentButton onSuccess={fetchComponents} />
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Components</h1>
          <CreateComponentButton onSuccess={fetchComponents} />
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
        <h1 className="text-2xl font-bold">Components</h1>
        <CreateComponentButton onSuccess={fetchComponents} />
      </div>

      {components.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No components created yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((component) => (
            <ComponentCard
              key={component.$id}
              component={component}
              onUpdate={fetchComponents}
            />
          ))}
        </div>
      )}
    </div>
  );
}