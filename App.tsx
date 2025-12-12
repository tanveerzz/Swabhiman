import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
    Users, Home, Baby, Activity, 
    LogOut, History as HistoryIcon, 
    RefreshCw, CheckCircle, AlertCircle, 
    Settings, Shield, Plus, FileText, CloudOff,
    UserCircle, Edit3, Calendar
} from 'lucide-react';
import { Layout, Button, Input } from './components/Shared';
import { DynamicFormScreen } from './components/DynamicForm.tsx';
import { AdminDashboard } from './components/Admin.tsx';
import { getSubmissions, syncAllPending, clearData, seedDemoData, getForms, getUsers, saveUser } from './services/storage';
import { User, Submission, FormDefinition } from './types';

// --- Auth Component ---
const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        setLoading(true);
        setError('');

        setTimeout(() => {
            if (!email.trim() || !password.trim()) {
                setError('Please enter email and password');
                setLoading(false);
                return;
            }

            const users = getUsers();
            const normalizedEmail = email.trim().toLowerCase();
            let user = users.find(u => u.email?.toLowerCase() === normalizedEmail);
            
            // Hardcoded Bootstrap Admin (if not exists)
            if (normalizedEmail === 'tanveer.pn@gmail.com' && password === 'admin123') {
                if (!user) {
                    user = {
                        uid: 'admin-tanveer',
                        email: normalizedEmail,
                        password: 'admin123',
                        role: 'admin',
                        name: 'Tanveer PN',
                        isAnonymous: false
                    };
                    saveUser(user);
                } else if (user.role !== 'admin') {
                    // Recover admin role
                    user.role = 'admin';
                    user.password = 'admin123';
                    saveUser(user);
                }
            }

            if (user && user.password === password) {
                onLogin(user);
            } else {
                setError('Invalid email or password');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-primary-50 flex flex-col items-center justify-center p-6 max-w-md mx-auto border-x bg-white">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <Activity className="text-primary-600" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Swabhiman</h1>
            <p className="text-gray-500 mb-8 text-center text-sm">Empowering Field Volunteers</p>
            
            <div className="w-full space-y-4">
                <div>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none mb-3"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                     <input 
                        type="password" 
                        placeholder="Password" 
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
                </div>

                <Button onClick={handleLogin} disabled={loading}>
                    {loading ? 'Verifying...' : 'Sign In'}
                </Button>
            </div>
            <p className="mt-8 text-xs text-gray-400 text-center">Version 1.3.0</p>
        </div>
    );
};

// --- Dashboard Component ---
const Dashboard = ({ user, isOnline }: { user: User, isOnline: boolean }) => {
    const [stats, setStats] = useState<Submission[]>([]);
    const [forms, setForms] = useState<FormDefinition[]>([]);
    const [lastSync, setLastSync] = useState<number | null>(null);

    useEffect(() => {
        const data = getSubmissions();
        setStats(data);
        setForms(getForms());
        const synced = data.filter(d => d.status === 'synced').sort((a,b) => (b.syncedAt || 0) - (a.syncedAt || 0));
        if (synced.length > 0) setLastSync(synced[0].syncedAt || null);
    }, []);

    // Time-based stats calculations
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of week (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);
    
    // Start of month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const countToday = stats.filter(s => s.submittedAt >= todayStart).length;
    const countWeek = stats.filter(s => s.submittedAt >= weekStart.getTime()).length;
    const countMonth = stats.filter(s => s.submittedAt >= monthStart).length;
    const countTotal = stats.length;

    const countByForm = (formId: string) => stats.filter(s => s.formId === formId).length;
    
    // Prepare chart data dynamically based on available forms
    const chartColors = ['#ec4899', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1'];
    const chartData = forms.slice(0, 5).map((f, i) => ({
        name: f.title.split(' ')[0], // Short name
        count: countByForm(f.id),
        color: chartColors[i % chartColors.length]
    }));

    const StatCard = ({ label, count, colorClass }: { label: string, count: number, colorClass: string }) => (
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{label}</p>
            <p className={`text-2xl font-bold ${colorClass}`}>{count}</p>
        </div>
    );

    return (
        <Layout title="Dashboard" isOnline={isOnline}>
            {/* Header Profile Snippet */}
            <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-xl border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt="propic" className="w-full h-full object-cover" /> : <UserCircle size={28} className="text-primary-600" />}
                </div>
                <div>
                    <p className="font-bold text-gray-800">{user.name || 'Volunteer'}</p>
                    <p className="text-xs text-gray-500">{user.email || 'Guest'}</p>
                </div>
                {user.role === 'admin' && (
                    <Link to="/admin" className="ml-auto bg-purple-100 text-purple-700 p-2 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Shield size={14} /> Admin
                    </Link>
                )}
            </div>

            <div className="mb-6">
                 <div className="flex items-center gap-2 mb-3">
                    <Calendar size={18} className="text-primary-600" />
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Submission Summary</h2>
                 </div>
                 <div className="grid grid-cols-4 gap-2">
                    <StatCard label="Today" count={countToday} colorClass="text-green-600" />
                    <StatCard label="Week" count={countWeek} colorClass="text-blue-600" />
                    <StatCard label="Month" count={countMonth} colorClass="text-purple-600" />
                    <StatCard label="Total" count={countTotal} colorClass="text-gray-800" />
                 </div>
            </div>

            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Form Distribution</h2>
                </div>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Start Survey</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
                {forms.map((f, i) => (
                    <Link key={f.id} to={`/form/${f.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow active:scale-95 text-center">
                        <div className={`p-3 rounded-full bg-opacity-10`} style={{ backgroundColor: chartColors[i%chartColors.length] + '20' }}>
                            <FileText size={24} style={{ color: chartColors[i%chartColors.length] }} />
                        </div>
                        <span className="font-medium text-gray-700 text-xs">{f.title}</span>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <Link to="/history" className="bg-gray-800 text-white p-4 rounded-xl shadow flex items-center justify-between">
                    <span className="font-medium">History</span>
                    <HistoryIcon size={20} />
                </Link>
                 <Link to="/settings" className="bg-white border text-gray-700 p-4 rounded-xl shadow-sm flex items-center justify-between">
                    <span className="font-medium">Profile</span>
                    <Settings size={20} />
                </Link>
            </div>
            
            {lastSync && <p className="text-center text-xs text-gray-400 mt-6">Synced: {new Date(lastSync).toLocaleTimeString()}</p>}
        </Layout>
    );
};

// --- History Screen (Updated for Generic Data) ---
const HistoryScreen = ({ isOnline }: { isOnline: boolean }) => {
    const [items, setItems] = useState<Submission[]>([]);
    const [syncing, setSyncing] = useState(false);

    const load = () => setItems(getSubmissions());
    useEffect(load, []);

    const handleSync = async () => {
        if (!isOnline) return alert("You are offline.");
        setSyncing(true);
        const count = await syncAllPending();
        setSyncing(false);
        load();
        if(count > 0) alert(`Synced ${count} items!`);
    };

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === 'synced') return <CheckCircle size={18} className="text-green-500" />;
        if (status === 'failed') return <AlertCircle size={18} className="text-red-500" />;
        return <CloudOff size={18} className="text-amber-500" />;
    };

    return (
        <Layout title="History" showBack isOnline={isOnline}>
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">{items.length} Submissions</span>
                <button onClick={handleSync} disabled={syncing || !isOnline} className="text-primary-600 text-sm font-semibold flex items-center gap-1 disabled:opacity-50">
                    <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? '...' : 'Sync'}
                </button>
            </div>
            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded text-white bg-primary-500">{item.formTitle?.substring(0, 10)}</span>
                                <span className="text-xs text-gray-400">{new Date(item.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="font-medium text-gray-800 mt-1 text-sm">
                                {item.volunteerCode ? `Vol: ${item.volunteerCode}` : `ID: ${item.id.substring(0,8)}`}
                            </p>
                        </div>
                        <StatusIcon status={item.status} />
                    </div>
                ))}
            </div>
        </Layout>
    );
};

// --- Settings/Profile Screen ---
const SettingsScreen = ({ user, onLogout, onUpdateUser }: { user: User, onLogout: () => void, onUpdateUser: (u: User) => void }) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || ''
    });

    const handleSave = () => {
        const updatedUser = { ...user, ...formData };
        saveUser(updatedUser);
        onUpdateUser(updatedUser);
        setEditMode(false);
    };

    return (
        <Layout title="Profile & Settings" showBack isOnline={true}>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200 mb-3 overflow-hidden relative group">
                        {formData.photoURL ? (
                            <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-300">
                                <UserCircle size={48} />
                            </div>
                        )}
                        {editMode && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                <span className="text-white text-xs">URL</span>
                            </div>
                        )}
                    </div>
                    {!editMode ? (
                        <>
                            <h2 className="text-xl font-bold text-gray-800">{user.name || 'Volunteer'}</h2>
                            <p className="text-gray-500">{user.email || 'Guest'}</p>
                            <span className="text-xs mt-2 px-2 py-1 bg-gray-100 rounded uppercase font-semibold text-gray-500">{user.role}</span>
                        </>
                    ) : (
                        <div className="w-full space-y-3">
                             <Input 
                                label="Photo URL" 
                                value={formData.photoURL} 
                                onChange={e => setFormData({...formData, photoURL: e.target.value})} 
                                placeholder="https://..."
                            />
                        </div>
                    )}
                </div>

                {editMode ? (
                    <div className="space-y-4">
                        <Input 
                            label="Full Name" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                        <Input 
                            label="Phone Number" 
                            value={formData.phoneNumber} 
                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                        />
                        <div className="flex gap-3 mt-4">
                            <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Profile</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm">Phone</span>
                            <span className="font-medium">{user.phoneNumber || '-'}</span>
                        </div>
                         <Button variant="outline" onClick={() => setEditMode(true)} className="mt-4">
                            <Edit3 size={16} /> Edit Profile
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <Button variant="outline" onClick={() => seedDemoData(user.uid)}>Load Demo Data</Button>
                <Button variant="outline" onClick={clearData} className="!text-red-600 !border-red-200">Clear Local Storage</Button>
                <Button variant="secondary" onClick={onLogout}><LogOut size={18} /> Sign Out</Button>
            </div>
        </Layout>
    )
}

// --- Main App Logic ---
const AppContent = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();

    useEffect(() => {
        const handleStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        const storedUser = localStorage.getItem('snp_user');
        
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            // Immediate redirect for admin roles if on root
            if (window.location.hash === '#/' && (u.role === 'admin' || u.role === 'manager')) {
                navigate('/admin', { replace: true });
            }
        }
        
        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }, [navigate]); // Added navigate dependency

    const handleLogin = (u: User) => {
        setUser(u);
        localStorage.setItem('snp_user', JSON.stringify(u));
        if (u.role === 'admin' || u.role === 'manager') {
            navigate('/admin', { replace: true });
        } else {
            navigate('/');
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('snp_user');
        navigate('/');
    };

    const handleUpdateUser = (updated: User) => {
        setUser(updated);
        localStorage.setItem('snp_user', JSON.stringify(updated));
    };

    if (!user) return <AuthScreen onLogin={handleLogin} />;

    return (
        <Routes>
            <Route path="/" element={<Dashboard user={user} isOnline={isOnline} />} />
            <Route path="/history" element={<HistoryScreen isOnline={isOnline} />} />
            <Route path="/settings" element={<SettingsScreen user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />} />
            {/* Admin Route */}
            <Route path="/admin" element={(user.role === 'admin' || user.role === 'manager') ? <AdminDashboard currentUser={user} isOnline={isOnline} onLogout={handleLogout} /> : <div className="p-4">Access Denied</div>} />
            {/* Dynamic Form Route */}
            <Route path="/form/:formId" element={<DynamicFormScreen user={user} isOnline={isOnline} />} />
        </Routes>
    );
};

export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}