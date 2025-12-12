import { Submission, SubmissionStatus, FormDefinition, User } from '../types';

const KEYS = {
  SUBMISSIONS: 'snp_submissions',
  FORMS: 'snp_forms',
  USERS: 'snp_users'
};

// --- DEFAULT SEEDS ---

const DEFAULT_FORMS: FormDefinition[] = [
  {
    id: 'menstrual',
    title: 'Menstrual Surveillance',
    description: 'Track monthly visits and women details',
    fields: [
      { id: 'volunteerCode', label: 'Volunteer Code', type: 'text', required: true },
      { id: 'snpHouseNumber', label: 'SNP House Number', type: 'text', required: true },
      { id: 'visitDate', label: 'Visit Date', type: 'date', required: true },
      { id: 'contactDetails', label: 'Contact Details', type: 'text' },
      { 
        id: 'women', label: 'Women Details', type: 'group', repeatable: true, maxRepeats: 4,
        subFields: [
          { id: 'name', label: 'Name', type: 'text', required: true },
          { id: 'age', label: 'Age', type: 'number' },
          { id: 'lmp', label: 'LMP Current?', type: 'checkbox' }
        ]
      },
      { id: 'remarks', label: 'Remarks', type: 'text' }
    ]
  },
  {
    id: 'house',
    title: 'House Registration',
    fields: [
      { id: 'volunteerCode', label: 'Volunteer Code', type: 'text', required: true },
      { id: 'snpHouseNumber', label: 'SNP House No.', type: 'text', required: true },
      { id: 'headOfFamily', label: 'Head of Family', type: 'text', required: true },
      { id: 'familySize', label: 'Family Size', type: 'number' },
      { id: 'women_14_49', label: 'Women (14-49)', type: 'number' },
      { id: 'children_0_3', label: 'Children (0-3)', type: 'number' },
      { id: 'houseDetails', label: 'House Type', type: 'select', options: ['Own', 'Rented', 'Lease'] },
      { id: 'rationCardType', label: 'Ration Card', type: 'select', options: ['APL', 'BPL', 'None', 'Other'] }
    ]
  },
  {
    id: 'anc',
    title: 'ANC Follow-up',
    fields: [
      { id: 'volunteerCode', label: 'Volunteer Code', type: 'text', required: true },
      { id: 'ancName', label: 'Pregnant Woman Name', type: 'text', required: true },
      { id: 'trimester', label: 'Trimester', type: 'select', options: ['1', '2', '3'] },
      { id: 'lmpDate', label: 'LMP Date', type: 'date' },
      { id: 'edd', label: 'EDD', type: 'date' },
      { id: 'comorbidities', label: 'Comorbidities', type: 'select', options: ['Diabetes', 'Hypertension', 'Anemia', 'None'] }, // Simplified for dynamic select
    ]
  },
  {
    id: 'pnc',
    title: 'PNC & Baby',
    fields: [
      { id: 'volunteerCode', label: 'Volunteer Code', type: 'text' },
      { id: 'motherName', label: 'Mother Name', type: 'text', required: true },
      { id: 'childName', label: 'Child Name', type: 'text', required: true },
      { id: 'breastfeedingStatus', label: 'Breastfeeding', type: 'select', options: ['Exclusive', 'Mixed', 'Formula'] }
    ]
  }
];

const DEFAULT_USERS: User[] = [
  { uid: 'admin-1', email: 'tanveer.pn@gmail.com', password: 'admin123', role: 'admin', name: 'Tanveer PN', phoneNumber: '9999999999', isAnonymous: false },
  { uid: 'vol-1', email: 'volunteer@snp.org', password: '123456', role: 'volunteer', name: 'Field Volunteer', phoneNumber: '8888888888', isAnonymous: false }
];

// --- FORMS ---

export const getForms = (): FormDefinition[] => {
  const stored = localStorage.getItem(KEYS.FORMS);
  if (!stored) {
    localStorage.setItem(KEYS.FORMS, JSON.stringify(DEFAULT_FORMS));
    return DEFAULT_FORMS;
  }
  return JSON.parse(stored);
};

export const saveForm = (form: FormDefinition) => {
  const forms = getForms();
  const idx = forms.findIndex(f => f.id === form.id);
  if (idx >= 0) forms[idx] = form;
  else forms.push(form);
  localStorage.setItem(KEYS.FORMS, JSON.stringify(forms));
};

export const deleteForm = (id: string) => {
  const forms = getForms().filter(f => f.id !== id);
  localStorage.setItem(KEYS.FORMS, JSON.stringify(forms));
};

// --- USERS ---

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(KEYS.USERS);
  if (!stored) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(stored);
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.uid === user.uid);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const deleteUser = (uid: string) => {
  const users = getUsers().filter(u => u.uid !== uid);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

// --- SUBMISSIONS ---

export const saveSubmission = (submission: Submission): void => {
  const existing = getSubmissions();
  const updated = [submission, ...existing];
  localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(updated));
};

export const getSubmissions = (): Submission[] => {
  const data = localStorage.getItem(KEYS.SUBMISSIONS);
  return data ? JSON.parse(data) : [];
};

export const updateSubmissionStatus = (id: string, status: SubmissionStatus): void => {
  const all = getSubmissions();
  const updated = all.map(s => s.id === id ? { ...s, status, syncedAt: status === 'synced' ? Date.now() : undefined } : s);
  localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(updated));
};

export const syncAllPending = async (): Promise<number> => {
  const all = getSubmissions();
  const pending = all.filter(s => s.status === 'pending' || s.status === 'failed');
  if (pending.length === 0) return 0;
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  let successCount = 0;
  const newSubmissions = all.map(s => {
    if (s.status === 'pending' || s.status === 'failed') {
       successCount++;
       return { ...s, status: 'synced' as SubmissionStatus, syncedAt: Date.now() };
    }
    return s;
  });
  localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(newSubmissions));
  return successCount;
};

export const clearData = () => {
    localStorage.removeItem(KEYS.SUBMISSIONS);
    localStorage.removeItem(KEYS.FORMS);
    localStorage.removeItem(KEYS.USERS);
    window.location.reload();
}

export const seedDemoData = (userId: string) => {
    // Seed forms first
    getForms(); 
    
    const demoData: Submission[] = [
        {
            id: 'demo-1',
            formId: 'menstrual',
            formTitle: 'Menstrual Surveillance',
            volunteerCode: 'VOL-001',
            data: {
              volunteerCode: 'VOL-001', snpHouseNumber: 'H-101', visitDate: '2023-10-25',
              women: [{ name: 'Sita', age: 24, lmp: true }]
            },
            submittedAt: Date.now() - 10000000,
            submittedBy: userId,
            status: 'synced',
            syncedAt: Date.now() - 5000000
        }
    ];
    localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(demoData));
    window.location.reload();
}