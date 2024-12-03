import { Account, Client, Databases, Storage } from 'appwrite';
import { config } from './config';

let client: Client;
let account: Account;
let databases: Databases;
let storage: Storage;

if (typeof window !== 'undefined') {
  console.log('Initializing Appwrite client');

  client = new Client();
  client
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId);

  account = new Account(client);
  databases = new Databases(client);
  storage = new Storage(client);
}

export { client, account, databases, storage };

export const COMPONENT_DATABASE_ID = config.appwrite.databaseId;
export const COMPONENT_COLLECTION_ID = config.appwrite.collectionId;
export const MEETING_DATABASE_ID = config.appwrite.databaseId;
export const MEETING_COLLECTION_ID = config.appwrite.meetingCollectionId;
export const TIMELINE_COLLECTION_ID = config.appwrite.timelineCollectionId;
export const RESOURCE_COLLECTION_ID = config.appwrite.resourceCollectionId;
export const STORAGE_BUCKET_ID = config.appwrite.bucketId;