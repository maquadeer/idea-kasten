export type Difficulty = 'easy' | 'medium' | 'hard';
export type Status = 'todo' | 'inprogress' | 'done';
export type TimelineStatus = 'completed' | 'required';

export interface Component {
  $id?: string;
  name: string;
  description: string;
  assignee: string;
  difficulty: Difficulty;
  status: Status;
  inspirationImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  $id?: string;
  date: Date;
  agenda: string;
  meetLink: string;
  postMeetingNotes?: string;
  attachments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  $id?: string;
  title: string;
  date: string;
  description: string;
  status: TimelineStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  $id?: string;
  name: string;
  description: string;
  fileId: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}