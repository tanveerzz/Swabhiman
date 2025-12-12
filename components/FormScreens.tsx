import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Input, Select, Button, CheckboxGroup } from './Shared';
import { saveSubmission } from '../services/storage';
import { MenstrualForm, HouseForm, ANCForm, PNCForm, User, WomanEntry } from '../types';
import { Trash2, PlusCircle, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // We'll just mock this if needed or use simple random string

const generateId = () => Math.random().toString(36).substring(2, 15);

// --- Wrappers & Logic ---

interface FormWrapperProps {
  user: User;
  isOnline: boolean;
}

// --- 1. Menstrual Form ---

export const MenstrualScreen: React.FC<FormWrapperProps> = ({ user, isOnline }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State
  const [formData, setFormData] = useState<Partial<MenstrualForm>>({
    volunteerCode: '',
    snpHouseNumber: '',
    visitDate: new Date().toISOString().split('T')[0],
    contactDetails: '',
    women: [],
    remarks: ''
  });

  const [womenList, setWomenList] = useState<WomanEntry[]>([]);

  const handleAddWoman = () => {
    if (womenList.length >= 4) return;
    setWomenList([...womenList, { name: '', age: 0, lmp: false }]);
  };

  const updateWoman = (index: number, field: keyof WomanEntry, value: any) => {
    const updated = [...womenList];
    updated[index] = { ...updated[index], [field]: value };
    setWomenList(updated);
  };

  const removeWoman = (index: number) => {
    setWomenList(womenList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.volunteerCode || !formData.snpHouseNumber || !formData.visitDate) {
        alert("Please fill required fields");
        return;
    }

    setLoading(true);
    
    const submission: MenstrualForm = {
        id: generateId(),
        formType: 'menstrual',
        volunteerCode: formData.volunteerCode!,
        snpHouseNumber: formData.snpHouseNumber!,
        visitDate: formData.visitDate!,
        contactDetails: formData.contactDetails || '',
        women: womenList,
        remarks: formData.remarks || '',
        submittedAt: Date.now(),
        submittedBy: user.uid,
        status: 'pending'
    };

    saveSubmission(submission);
    
    setTimeout(() => {
        setLoading(false);
        navigate('/');
    }, 500);
  };

  return (
    <Layout title="Menstrual Surv." showBack isOnline={isOnline}>
      <form onSubmit={handleSubmit} className="space-y-4 pb-20">
        <Input 
            label="Volunteer Code *" 
            required 
            value={formData.volunteerCode} 
            onChange={e => setFormData({...formData, volunteerCode: e.target.value})} 
        />
        <Input 
            label="SNP House Number *" 
            required 
            value={formData.snpHouseNumber} 
            onChange={e => setFormData({...formData, snpHouseNumber: e.target.value})} 
        />
        <Input 
            type="date" 
            label="Visit Date *" 
            required 
            value={formData.visitDate} 
            onChange={e => setFormData({...formData, visitDate: e.target.value})} 
        />
        <Input 
            label="Contact Details" 
            value={formData.contactDetails} 
            onChange={e => setFormData({...formData, contactDetails: e.target.value})} 
        />

        {/* Dynamic Women List */}
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-teal-800">Women Details ({womenList.length}/4)</h3>
                {womenList.length < 4 && (
                    <button type="button" onClick={handleAddWoman} className="text-teal-600 flex items-center text-sm font-medium">
                        <PlusCircle size={16} className="mr-1" /> Add
                    </button>
                )}
            </div>
            
            {womenList.map((woman, idx) => (
                <div key={idx} className="bg-white p-3 rounded shadow-sm mb-3 relative">
                    <button type="button" onClick={() => removeWoman(idx)} className="absolute top-2 right-2 text-red-400">
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-3 pr-6">
                        <div className="col-span-2">
                             <Input 
                                label={`Name #${idx+1}`} 
                                value={woman.name} 
                                onChange={e => updateWoman(idx, 'name', e.target.value)}
                                className="mb-0"
                             />
                        </div>
                        <div>
                             <Input 
                                type="number" 
                                label="Age" 
                                value={woman.age || ''} 
                                onChange={e => updateWoman(idx, 'age', parseInt(e.target.value))}
                                className="mb-0"
                             />
                        </div>
                        <div className="flex items-center pt-6">
                             <label className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    checked={woman.lmp} 
                                    onChange={e => updateWoman(idx, 'lmp', e.target.checked)}
                                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                />
                                <span className="text-sm font-medium text-gray-700">LMP Current?</span>
                             </label>
                        </div>
                    </div>
                </div>
            ))}
            {womenList.length === 0 && <p className="text-sm text-gray-500 italic text-center">No women added.</p>}
        </div>

        <Input 
            label="Remarks" 
            value={formData.remarks} 
            onChange={e => setFormData({...formData, remarks: e.target.value})} 
        />

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-md mx-auto">
            <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Submit Form'}
            </Button>
        </div>
      </form>
    </Layout>
  );
};


// --- 2. House Registration Form ---

export const HouseScreen: React.FC<FormWrapperProps> = ({ user, isOnline }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<Partial<HouseForm>>({
    volunteerCode: '', snpHouseNumber: '', headOfFamily: '', familySize: 0,
    women_14_49: 0, children_0_3: 0, anc_pregnant: 0, pncs: 0, students: 0,
    dropouts: false, employedCount: 0, diseases: '', skills: '', religion: '',
    houseDetails: 'Own', contact1: '', rationCardType: 'None'
  });

  const handleChange = (field: keyof HouseForm, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.volunteerCode || !data.snpHouseNumber || !data.headOfFamily) {
        alert("Required fields missing");
        return;
    }
    
    saveSubmission({
        ...data as HouseForm,
        id: generateId(),
        formType: 'house',
        submittedAt: Date.now(),
        submittedBy: user.uid,
        status: 'pending'
    });
    navigate('/');
  };

  return (
    <Layout title="House Reg." showBack isOnline={isOnline}>
        <form onSubmit={handleSubmit} className="space-y-4 pb-20">
            <Input label="Volunteer Code *" required value={data.volunteerCode} onChange={e => handleChange('volunteerCode', e.target.value)} />
            <Input label="SNP House No. *" required value={data.snpHouseNumber} onChange={e => handleChange('snpHouseNumber', e.target.value)} />
            <Input label="Head of Family *" required value={data.headOfFamily} onChange={e => handleChange('headOfFamily', e.target.value)} />
            
            <div className="grid grid-cols-2 gap-4">
                <Input type="number" label="Family Size" value={data.familySize || ''} onChange={e => handleChange('familySize', parseInt(e.target.value))} />
                <Input type="number" label="Women (14-49)" value={data.women_14_49 || ''} onChange={e => handleChange('women_14_49', parseInt(e.target.value))} />
                <Input type="number" label="Children (0-3)" value={data.children_0_3 || ''} onChange={e => handleChange('children_0_3', parseInt(e.target.value))} />
                <Input type="number" label="Pregnant (ANC)" value={data.anc_pregnant || ''} onChange={e => handleChange('anc_pregnant', parseInt(e.target.value))} />
                <Input type="number" label="PNCs" value={data.pncs || ''} onChange={e => handleChange('pncs', parseInt(e.target.value))} />
                <Input type="number" label="Employed" value={data.employedCount || ''} onChange={e => handleChange('employedCount', parseInt(e.target.value))} />
            </div>

            <Select label="House Type" options={['Own', 'Rented', 'Lease']} value={data.houseDetails} onChange={e => handleChange('houseDetails', e.target.value)} />
            <Select label="Ration Card" options={['APL', 'BPL', 'None', 'Other']} value={data.rationCardType} onChange={e => handleChange('rationCardType', e.target.value)} />
            
            <Input label="Diseases/Conditions" value={data.diseases} onChange={e => handleChange('diseases', e.target.value)} />
            
            <Button type="submit" className="mt-6">Submit Registration</Button>
        </form>
    </Layout>
  );
};


// --- 3. ANC Form ---

export const ANCScreen: React.FC<FormWrapperProps> = ({ user, isOnline }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<Partial<ANCForm>>({
    volunteerCode: '', snpHouseNumber: '', ancName: '', age: 0, trimester: '1',
    occupation: '', contact: '', husbandName: '', comorbidities: [],
    lmpDate: '', edd: '', govtSchemeCard: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.volunteerCode || !data.ancName) return alert("Missing required fields");

    saveSubmission({
        ...data as ANCForm,
        id: generateId(),
        formType: 'anc',
        submittedAt: Date.now(),
        submittedBy: user.uid,
        status: 'pending'
    });
    navigate('/');
  };

  return (
    <Layout title="ANC Follow-up" showBack isOnline={isOnline}>
        <form onSubmit={handleSubmit} className="space-y-4 pb-20">
            <Input label="Volunteer Code *" required value={data.volunteerCode} onChange={e => setData({...data, volunteerCode: e.target.value})} />
            <Input label="SNP House No. *" required value={data.snpHouseNumber} onChange={e => setData({...data, snpHouseNumber: e.target.value})} />
            <Input label="Pregnant Woman Name *" required value={data.ancName} onChange={e => setData({...data, ancName: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4">
                <Input type="number" label="Age" value={data.age || ''} onChange={e => setData({...data, age: parseInt(e.target.value)})} />
                <Select label="Trimester" options={['1', '2', '3']} value={data.trimester} onChange={e => setData({...data, trimester: e.target.value as any})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="LMP Date" value={data.lmpDate} onChange={e => setData({...data, lmpDate: e.target.value})} />
                <Input type="date" label="EDD" value={data.edd} onChange={e => setData({...data, edd: e.target.value})} />
            </div>

            <CheckboxGroup 
                label="Comorbidities"
                options={['Diabetes', 'Hypertension', 'Anemia', 'Thyroid', 'None']}
                selected={data.comorbidities || []}
                onChange={(val) => setData({...data, comorbidities: val})}
            />

            <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                <input type="checkbox" className="w-5 h-5" checked={data.govtSchemeCard} onChange={e => setData({...data, govtSchemeCard: e.target.checked})} />
                <span>Govt Scheme Card Available?</span>
            </div>

            <Input label="Husband Name" value={data.husbandName} onChange={e => setData({...data, husbandName: e.target.value})} />
            
            <Button type="submit" className="mt-4">Submit ANC</Button>
        </form>
    </Layout>
  );
};


// --- 4. PNC Form ---

export const PNCScreen: React.FC<FormWrapperProps> = ({ user, isOnline }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<Partial<PNCForm>>({
    volunteerCode: '', motherName: '', childName: '', childAgeMonths: 0,
    breastfeedingStatus: 'Exclusive', immunizationsUpToDate: true,
    lowBirthWeight: false, anyConcerns: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.motherName || !data.childName) return alert("Required fields missing");

    saveSubmission({
        ...data as PNCForm,
        id: generateId(),
        formType: 'pnc',
        submittedAt: Date.now(),
        submittedBy: user.uid,
        status: 'pending'
    });
    navigate('/');
  };

  return (
    <Layout title="PNC & Baby" showBack isOnline={isOnline}>
        <form onSubmit={handleSubmit} className="space-y-4 pb-20">
            <Input label="Volunteer Code" value={data.volunteerCode} onChange={e => setData({...data, volunteerCode: e.target.value})} />
            <Input label="Mother Name *" required value={data.motherName} onChange={e => setData({...data, motherName: e.target.value})} />
            <Input label="Child Name *" required value={data.childName} onChange={e => setData({...data, childName: e.target.value})} />
            <Input type="number" label="Child Age (Months)" value={data.childAgeMonths || ''} onChange={e => setData({...data, childAgeMonths: parseInt(e.target.value)})} />
            
            <Select 
                label="Breastfeeding Status" 
                options={['Exclusive', 'Mixed', 'Formula', 'None']} 
                value={data.breastfeedingStatus} 
                onChange={e => setData({...data, breastfeedingStatus: e.target.value as any})} 
            />

            <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-white border rounded">
                    <input type="checkbox" checked={data.immunizationsUpToDate} onChange={e => setData({...data, immunizationsUpToDate: e.target.checked})} />
                    Immunizations Up To Date
                </label>
                <label className="flex items-center gap-3 p-3 bg-white border rounded">
                    <input type="checkbox" checked={data.lowBirthWeight} onChange={e => setData({...data, lowBirthWeight: e.target.checked})} />
                    Low Birth Weight Detected
                </label>
            </div>

            <Input label="Any Concerns / Remarks" value={data.anyConcerns} onChange={e => setData({...data, anyConcerns: e.target.value})} />

            <Button type="submit" className="mt-4">Submit PNC</Button>
        </form>
    </Layout>
  );
};
