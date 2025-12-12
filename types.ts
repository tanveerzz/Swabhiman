// Form Types

export type SubmissionStatus = 'pending' | 'synced' | 'failed';

export interface BaseSubmission {
  id: string;
  formType: 'menstrual' | 'house' | 'anc' | 'pnc';
  volunteerCode: string;
  snpHouseNumber: string;
  submittedAt: number;
  submittedBy: string;
  status: SubmissionStatus;
  syncedAt?: number;
}

// Menstrual Surveillance
export interface WomanEntry {
  name: string;
  age: number;
  lmp: boolean;
}

export interface MenstrualForm extends BaseSubmission {
  formType: 'menstrual';
  visitDate: string;
  contactDetails: string;
  women: WomanEntry[];
  remarks: string;
}

// House Registration
export interface HouseForm extends BaseSubmission {
  formType: 'house';
  headOfFamily: string;
  familySize: number;
  women_14_49: number;
  children_0_3: number;
  anc_pregnant: number;
  pncs: number;
  students: number;
  dropouts: boolean;
  employedCount: number;
  diseases: string;
  skills: string;
  religion: string;
  houseDetails: 'Own' | 'Rented' | 'Lease';
  contact1: string;
  contact2: string;
  rationCardType: 'APL' | 'BPL' | 'None' | 'Other';
  remarks: string;
}

// ANC Follow-up
export interface ANCForm extends BaseSubmission {
  formType: 'anc';
  ancName: string;
  age: number;
  trimester: '1' | '2' | '3';
  occupation: string;
  contact: string;
  husbandName: string;
  husbandContact: string;
  bloodGroup: string;
  religion: string;
  lmpDate: string;
  edd: string;
  comorbidities: string[]; // multi-select stored as strings
  phcName: string;
  govtSchemeCard: boolean;
  anganwadiRegistered: boolean;
  ageGap: number;
  pregnancyCount: number;
  lastDeliveryType: 'Vaginal' | 'C-Section' | 'Other';
  remarks: string;
}

// PNC & Baby
export interface PNCForm extends BaseSubmission {
  formType: 'pnc';
  motherName: string;
  childName: string;
  childAgeMonths: number;
  breastfeedingStatus: 'Exclusive' | 'Mixed' | 'Formula' | 'None';
  immunizationsUpToDate: boolean;
  lowBirthWeight: boolean;
  anyConcerns: string;
  contact: string;
}

export type AnySubmission = MenstrualForm | HouseForm | ANCForm | PNCForm;

export interface User {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
}
