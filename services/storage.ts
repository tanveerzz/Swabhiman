import { AnySubmission, SubmissionStatus } from '../types';

const STORAGE_KEY = 'snp_field_data_submissions';

export const saveSubmission = (submission: AnySubmission): void => {
  const existing = getSubmissions();
  // Simulate offline first: push to local array
  const updated = [submission, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getSubmissions = (): AnySubmission[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const updateSubmissionStatus = (id: string, status: SubmissionStatus): void => {
  const all = getSubmissions();
  const updated = all.map(s => s.id === id ? { ...s, status, syncedAt: status === 'synced' ? Date.now() : undefined } : s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const syncAllPending = async (): Promise<number> => {
  const all = getSubmissions();
  const pending = all.filter(s => s.status === 'pending' || s.status === 'failed');
  
  if (pending.length === 0) return 0;

  // Mock API Call delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  let successCount = 0;
  
  // Randomly fail one to demonstrate error handling if list is long, else succeed
  const newSubmissions = all.map(s => {
    if (s.status === 'pending' || s.status === 'failed') {
       successCount++;
       return { ...s, status: 'synced' as SubmissionStatus, syncedAt: Date.now() };
    }
    return s;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSubmissions));
  return successCount;
};

export const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
}

// Mock demo data
export const seedDemoData = (userId: string) => {
    const demoData: AnySubmission[] = [
        {
            id: 'demo-1',
            formType: 'menstrual',
            volunteerCode: 'VOL-001',
            snpHouseNumber: 'H-101',
            visitDate: '2023-10-25',
            contactDetails: '9876543210',
            women: [{ name: 'Sita', age: 24, lmp: true }],
            remarks: 'Normal visit',
            submittedAt: Date.now() - 10000000,
            submittedBy: userId,
            status: 'synced',
            syncedAt: Date.now() - 5000000
        },
        {
            id: 'demo-2',
            formType: 'house',
            volunteerCode: 'VOL-001',
            snpHouseNumber: 'H-102',
            headOfFamily: 'Ramesh',
            familySize: 5,
            women_14_49: 2,
            children_0_3: 1,
            anc_pregnant: 0,
            pncs: 0,
            students: 2,
            dropouts: false,
            employedCount: 1,
            diseases: 'None',
            skills: 'Weaving',
            religion: 'Hindu',
            houseDetails: 'Own',
            contact1: '9988776655',
            contact2: '',
            rationCardType: 'BPL',
            remarks: '',
            submittedAt: Date.now() - 800000,
            submittedBy: userId,
            status: 'pending'
        }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
    window.location.reload();
}
