import React, { useState, useEffect } from 'react';
import { Layout, Button, Input, Select } from './Shared';
import { User, FormDefinition, FormField, Submission } from '../types';
import { getUsers, saveUser, deleteUser, getForms, saveForm, deleteForm, getSubmissions } from '../services/storage';
import { Trash2, Edit2, Plus, Users, FileText, BarChart2, ShieldAlert, LogOut } from 'lucide-react';

const Tabs = ({ active, onChange }: { active: string, onChange: (s: string) => void }) => (
    <div className="flex border-b mb-4">
        {['Users', 'Forms', 'Data'].map(t => (
            <button 
                key={t}
                onClick={() => onChange(t)}
                className={`flex-1 py-2 text-sm font-medium ${active === t ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            >
                {t}
            </button>
        ))}
    </div>
);

// --- USER MANAGEMENT ---
const UserTab = ({ currentUser }: { currentUser: User }) => {
    const [users, setUsers] = useState<User[]>(getUsers());
    const [newUser, setNewUser] = useState<Partial<User>>({ role: 'volunteer', email: '', name: '', phoneNumber: '', photoURL: '' });

    const load = () => setUsers(getUsers());

    const handleAdd = () => {
        if (!newUser.email) return alert("Email required");
        saveUser({
            uid: 'u-' + Math.random().toString(36).substr(2, 5),
            email: newUser.email,
            role: newUser.role as any,
            name: newUser.name || newUser.email.split('@')[0],
            phoneNumber: newUser.phoneNumber,
            photoURL: newUser.photoURL,
            isAnonymous: false
        });
        setNewUser({ role: 'volunteer', email: '', name: '', phoneNumber: '', photoURL: '' });
        load();
    };

    const handleDelete = (uid: string) => {
        if (currentUser.role === 'manager') return alert("Managers cannot delete users.");
        if (confirm('Delete user?')) {
            deleteUser(uid);
            load();
        }
    };

    return (
        <div>
            <div className="bg-gray-50 p-4 rounded mb-4 border">
                <h4 className="font-semibold mb-2 text-sm">Add New User</h4>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input 
                        className="p-2 border rounded text-sm" 
                        placeholder="Email *" 
                        value={newUser.email || ''} 
                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                    />
                     <input 
                        className="p-2 border rounded text-sm" 
                        placeholder="Name" 
                        value={newUser.name || ''} 
                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                    />
                    <input 
                        className="p-2 border rounded text-sm" 
                        placeholder="Phone" 
                        value={newUser.phoneNumber || ''} 
                        onChange={e => setNewUser({...newUser, phoneNumber: e.target.value})}
                    />
                    <select 
                        className="p-2 border rounded text-sm"
                        value={newUser.role}
                        onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                    >
                        <option value="volunteer">Volunteer</option>
                        <option value="manager">Manager</option>
                        {currentUser.role === 'admin' && <option value="admin">Admin</option>}
                    </select>
                </div>
                <Button onClick={handleAdd} className="py-2"><Plus size={16} /> Add User</Button>
            </div>
            <div className="space-y-2">
                {users.map(u => (
                    <div key={u.uid} className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {u.photoURL ? <img src={u.photoURL} alt="p" className="w-full h-full object-cover"/> : <Users size={16} className="text-gray-500" />}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{u.name || 'User'} <span className="text-gray-400 font-normal">({u.email || 'Guest'})</span></p>
                                <div className="flex gap-2 text-xs text-gray-500">
                                    <span className="uppercase font-semibold text-primary-600">{u.role}</span>
                                    {u.phoneNumber && <span>• {u.phoneNumber}</span>}
                                </div>
                            </div>
                        </div>
                        {currentUser.role === 'admin' && u.uid !== currentUser.uid && (
                            <button onClick={() => handleDelete(u.uid)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                        )}
                        {currentUser.role === 'manager' && u.uid !== currentUser.uid && (
                            <div className="text-gray-300 p-2"><ShieldAlert size={16} /></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- FORM MANAGEMENT ---
interface FieldEditorProps { 
    field: FormField; 
    onChange: (f: FormField) => void; 
    onDelete: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onChange, onDelete }) => {
    return (
        <div className="border p-3 rounded bg-gray-50 mb-2">
            <div className="flex gap-2 mb-2">
                <input 
                    className="flex-1 p-1 border rounded text-sm" 
                    value={field.label} 
                    onChange={e => onChange({...field, label: e.target.value})} 
                    placeholder="Field Label"
                />
                <select 
                    className="p-1 border rounded text-sm w-24"
                    value={field.type}
                    onChange={e => onChange({...field, type: e.target.value as any})}
                >
                    <option value="text">Text</option>
                    <option value="textarea">Long Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="checkbox">Check</option>
                    <option value="group">Group</option>
                </select>
                <button onClick={onDelete} className="text-red-500"><Trash2 size={16} /></button>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
                <label className="flex items-center gap-1">
                    <input type="checkbox" checked={field.required} onChange={e => onChange({...field, required: e.target.checked})} /> Required
                </label>
                {field.type === 'group' && (
                    <label className="flex items-center gap-1">
                        <input type="checkbox" checked={field.repeatable} onChange={e => onChange({...field, repeatable: e.target.checked})} /> Repeatable
                    </label>
                )}
            </div>
        </div>
    );
};

const FormEditor = ({ form, onSave, onCancel }: { form?: FormDefinition, onSave: (f: FormDefinition) => void, onCancel: () => void }) => {
    const [def, setDef] = useState<FormDefinition>(form || { id: '', title: '', fields: [] });

    const handleSave = () => {
        if (!def.title) return alert("Title required");
        onSave({ ...def, id: def.id || def.title.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2,4) });
    };

    const updateField = (idx: number, f: FormField) => {
        const nf = [...def.fields];
        nf[idx] = f;
        setDef({...def, fields: nf});
    };

    const addField = () => {
        setDef({...def, fields: [...def.fields, { id: 'f'+Math.random(), label: 'New Field', type: 'text' }]});
    };

    return (
        <div className="bg-white p-4 rounded h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">{form ? 'Edit Form' : 'New Form'}</h3>
                <button onClick={onCancel} className="text-sm text-gray-500">Cancel</button>
            </div>
            <div className="mb-4">
                <label className="text-xs font-bold text-gray-500">Form Title</label>
                <input 
                    className="w-full p-2 border rounded" 
                    value={def.title} 
                    onChange={e => setDef({...def, title: e.target.value})} 
                />
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4">
                {def.fields.map((f, i) => (
                    <FieldEditor 
                        key={i} 
                        field={f} 
                        onChange={(val) => updateField(i, val)} 
                        onDelete={() => setDef({...def, fields: def.fields.filter((_, idx) => idx !== i)})}
                    />
                ))}
                <button onClick={addField} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:bg-gray-50">+ Add Field</button>
            </div>

            <Button onClick={handleSave}>Save Definition</Button>
        </div>
    );
};

const FormsTab = ({ currentUser }: { currentUser: User }) => {
    const [forms, setForms] = useState<FormDefinition[]>(getForms());
    const [editing, setEditing] = useState<FormDefinition | undefined | null>(null); // null = list, undefined = new

    const load = () => { setForms(getForms()); setEditing(null); };

    if (editing !== null) {
        return <FormEditor form={editing === undefined ? undefined : editing} onSave={(f) => { saveForm(f); load(); }} onCancel={() => setEditing(null)} />;
    }

    const handleDelete = (id: string) => {
        if(currentUser.role === 'manager') return alert("Managers cannot delete forms.");
        if(confirm('Delete form?')) { deleteForm(id); load(); }
    };

    return (
        <div className="space-y-3">
            <Button onClick={() => setEditing(undefined)} variant="outline" className="mb-4"><Plus size={16} /> Create New Form</Button>
            {forms.map(f => (
                <div key={f.id} className="p-4 border rounded bg-white shadow-sm flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-gray-800">{f.title}</h4>
                        <p className="text-xs text-gray-500">{f.fields.length} fields</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(f)} className="p-2 text-primary-600 hover:bg-primary-50 rounded"><Edit2 size={18} /></button>
                        {currentUser.role === 'admin' ? (
                            <button onClick={() => handleDelete(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                        ) : (
                             <div className="p-2 text-gray-300"><ShieldAlert size={18} /></div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- DATA VIEW ---
const DataTab = () => {
    const [data] = useState<Submission[]>(getSubmissions());
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Form</th>
                        <th className="px-3 py-2">By</th>
                        <th className="px-3 py-2">Data</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(d => (
                        <tr key={d.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-3 py-2">{new Date(d.submittedAt).toLocaleDateString()}</td>
                            <td className="px-3 py-2 font-medium">{d.formTitle}</td>
                            <td className="px-3 py-2 text-gray-500">{d.submittedBy.substring(0,6)}...</td>
                            <td className="px-3 py-2 text-xs font-mono max-w-xs truncate">
                                {JSON.stringify(d.data)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 && <p className="text-center p-4 text-gray-500">No data submitted yet.</p>}
        </div>
    );
};

export const AdminDashboard = ({ isOnline, currentUser, onLogout }: { isOnline: boolean, currentUser: User, onLogout: () => void }) => {
    const [tab, setTab] = useState('Users');
    
    return (
        <Layout title="Admin Panel" showBack={false} isOnline={isOnline}>
            <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border shadow-sm">
                <div>
                    <p className="font-bold text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                </div>
                <button 
                    onClick={onLogout} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
            <Tabs active={tab} onChange={setTab} />
            {tab === 'Users' && <UserTab currentUser={currentUser} />}
            {tab === 'Forms' && <FormsTab currentUser={currentUser} />}
            {tab === 'Data' && <DataTab />}
        </Layout>
    );
};