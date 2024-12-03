'use client';

import { useEffect, useState } from 'react';
import { client, databases, COMPONENT_DATABASE_ID, COMPONENT_COLLECTION_ID } from '@/lib/appwrite';
import { Component } from '@/lib/types';
import { Query } from 'appwrite';
import { isConfigValid } from '@/lib/config';
import { LoadingState } from './board/loading-state';
import { ErrorState } from './board/error-state';
import { StatusColumn } from './board/status-column';

export default function ComponentBoard() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigValid()) {
      setError('Appwrite configuration is missing. Please check your environment variables.');
      setLoading(false);
      return;
    }

    const fetchComponents = async () => {
      try {
        if (!databases) {
          throw new Error('Appwrite client not initialized');
        }

        const response = await databases.listDocuments(
          COMPONENT_DATABASE_ID,
          COMPONENT_COLLECTION_ID,
          [Query.orderDesc('$createdAt')]
        );
        setComponents(response.documents as unknown as Component[]);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching components:', error);
        setError(error?.message || 'Failed to fetch components');
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();

    // Set up realtime subscription for all document changes
    const unsubscribe = client?.subscribe(
      [`databases.${COMPONENT_DATABASE_ID}.collections.${COMPONENT_COLLECTION_ID}.documents`],
      (response) => {
        // Immediately fetch updated data when any change occurs
        fetchComponents();
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const statusColumns = ['todo', 'inprogress', 'done'] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statusColumns.map((status) => (
        <StatusColumn key={status} status={status} components={components} />
      ))}
    </div>
  );
}