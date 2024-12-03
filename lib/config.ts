export const config = {
  appwrite: {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
    collectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || '',
    bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '',
    meetingCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MEETING_COLLECTION_ID || '',
    timelineCollectionId: process.env.NEXT_PUBLIC_APPWRITE_TIMELINE_COLLECTION_ID || '',
    resourceCollectionId: process.env.NEXT_PUBLIC_APPWRITE_RESOURCE_COLLECTION_ID || '',
  },
} as const;

export const isConfigValid = () => {
  const requiredVars = [
    config.appwrite.projectId,
    config.appwrite.databaseId,
    config.appwrite.collectionId,
    config.appwrite.bucketId,
    config.appwrite.meetingCollectionId,
    config.appwrite.timelineCollectionId,
    config.appwrite.resourceCollectionId,
  ];

  return requiredVars.every(Boolean);
};