// User & Roles
export type UserRole = 'admin' | 'manager' | 'volunteer' | 'guest';

export interface User {
  uid: string;
  email: string | null;
  role: UserRole;
  name?: string;
  isAnonymous?: boolean;
  phoneNumber?: string;
  photoURL?: string;
}

// Dynamic Form Schema Definitions
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'group' | 'header';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // For select/radio
  subFields?: FormField[]; // For groups
  repeatable?: boolean; // For dynamic lists (e.g., women array)
  maxRepeats?: number;
}

export interface FormDefinition {
  id: string;
  title: string;
  fields: FormField[];
  description?: string;
}

// Submissions
export type SubmissionStatus = 'pending' | 'synced' | 'failed';

export interface Submission {
  id: string;
  formId: string;
  formTitle: string; // Snapshot of title at submission
  data: Record<string, any>; // Dynamic data object
  volunteerCode: string; // Extracted for easy indexing
  submittedAt: number;
  submittedBy: string;
  status: SubmissionStatus;
  syncedAt?: number;
}