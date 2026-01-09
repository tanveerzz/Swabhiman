import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Input, Select, Button, CheckboxGroup } from './Shared';
import { saveSubmission, getForms } from '../services/storage';
import { FormDefinition, FormField, Submission, User } from '../types';
import { Trash2, PlusCircle } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 15);

interface FieldRendererProps { 
    field: FormField; 
    value: any; 
    onChange: (val: any) => void; 
    error?: string;
}

// Recursive Field Renderer
const FieldRenderer: React.FC<FieldRendererProps> = ({ 
    field, 
    value, 
    onChange, 
    error 
}) => {
    if (field.type === 'group') {
        if (field.repeatable) {
            const items = Array.isArray(value) ? value : [];
            const addItem = () => {
                if (field.maxRepeats && items.length >= field.maxRepeats) return;
                onChange([...items, {}]);
            };
            const removeItem = (idx: number) => {
                onChange(items.filter((_: any, i: number) => i !== idx));
            };
            const updateItem = (idx: number, subFieldKey: string, val: any) => {
                const newItems = [...items];
                newItems[idx] = { ...newItems[idx], [subFieldKey]: val };
                onChange(newItems);
            };

            return (
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-teal-800">{field.label} ({items.length})</h3>
                        <button type="button" onClick={addItem} className="text-teal-600 flex items-center text-sm font-medium">
                            <PlusCircle size={16} className="mr-1" /> Add
                        </button>
                    </div>
                    {items.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded shadow-sm mb-3 relative border border-gray-100">
                            <button type="button" onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-red-400">
                                <Trash2 size={16} />
                            </button>
                            <div className="pr-6 space-y-3">
                                {field.subFields?.map(sub => (
                                    <FieldRenderer
                                        key={sub.id}
                                        field={sub}
                                        value={item[sub.id]}
                                        onChange={(val) => updateItem(idx, sub.id, val)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-xs text-gray-400 italic">No items added.</p>}
                </div>
            );
        } else {
             // Logic for non-repeatable groups
             const item = value || {};

             return (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                    <h3 className="font-semibold text-gray-800 mb-4">{field.label}</h3>
                    <div className="space-y-3">
                        {field.subFields?.map(sub => (
                            <FieldRenderer
                                key={sub.id}
                                field={sub}
                                value={item[sub.id]}
                                onChange={(val) => {
                                    const newItem = { ...item, [sub.id]: val };
                                    onChange(newItem);
                                }}
                            />
                        ))}
                    </div>
                </div>
             );
        }
    }

    if (field.type === 'select') {
        return (
            <Select
                label={field.label + (field.required ? ' *' : '')}
                options={field.options || []}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                error={error}
            />
        );
    }

    if (field.type === 'textarea') {
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label + (field.required ? ' *' : '')}</label>
                <textarea
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    rows={4}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        );
    }

    if (field.type === 'checkbox') {
        return (
            <div className="mb-4 flex items-center gap-3 p-3 bg-white border rounded-lg">
                <input 
                    type="checkbox" 
                    className="w-5 h-5 text-teal-600 rounded" 
                    checked={!!value} 
                    onChange={e => onChange(e.target.checked)} 
                />
                <span className="text-sm font-medium text-gray-700">{field.label}</span>
            </div>
        );
    }

    if (field.type === 'radio') {
         const uniqueId = React.useId();
         return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{field.label + (field.required ? ' *' : '')}</label>
                <div className="space-y-2">
                    {field.options?.map((opt, i) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name={`${uniqueId}-${field.id}`}
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                checked={value === opt}
                                onChange={() => onChange(opt)}
                            />
                            <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                    ))}
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
         );
    }

    if (field.type === 'date') {
        return (
             <Input 
                type="date"
                label={field.label + (field.required ? ' *' : '')}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                error={error}
            />
        )
    }

    return (
        <Input 
            type={field.type === 'number' ? 'number' : 'text'}
            label={field.label + (field.required ? ' *' : '')}
            value={value || ''}
            onChange={e => onChange(field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            error={error}
        />
    );
};

export const DynamicFormScreen = ({ user, isOnline }: { user: User, isOnline: boolean }) => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [formDef, setFormDef] = useState<FormDefinition | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const forms = getForms();
        const def = forms.find(f => f.id === formId);
        if (def) {
            setFormDef(def);
            // Pre-fill date if exists
            const initial: any = {};
            def.fields.forEach(f => {
                if(f.type === 'date' && f.required) initial[f.id] = new Date().toISOString().split('T')[0];
            });
            setFormData(initial);
        }
    }, [formId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formDef) return;

        // Basic validation
        for (const f of formDef.fields) {
            if (f.required && !formData[f.id]) {
                alert(`Missing required field: ${f.label}`);
                return;
            }
        }

        setLoading(true);
        const submission: Submission = {
            id: generateId(),
            formId: formDef.id,
            formTitle: formDef.title,
            volunteerCode: formData.volunteerCode || user.uid, // Try to find a volunteer code field or use uid
            data: formData,
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

    if (!formDef) return <Layout title="Loading..." isOnline={isOnline}><div>Loading...</div></Layout>;

    return (
        <Layout title={formDef.title} showBack isOnline={isOnline}>
            <form onSubmit={handleSubmit} className="space-y-4 pb-20">
                {formDef.fields.map(field => (
                    <FieldRenderer
                        key={field.id}
                        field={field}
                        value={formData[field.id]}
                        onChange={(val) => setFormData(prev => ({...prev, [field.id]: val}))}
                    />
                ))}
                
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-md mx-auto">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Submit Form'}
                    </Button>
                </div>
            </form>
        </Layout>
    );
};