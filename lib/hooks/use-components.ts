'use client';

import { useState, useEffect } from 'react';
import { databases, COMPONENT_DATABASE_ID, COMPONENT_COLLECTION_ID } from '@/lib/appwrite';
import { Component } from '@/lib/types';
import { Query } from 'appwrite';

export function useComponents() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    components,
    loading,
    error,
    refetch: fetchComponents,
  };
}