import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
    Users, Home, Baby, Activity, 
    LogOut, History as HistoryIcon, 
    RefreshCw, CloudOff, CheckCircle, AlertCircle, 
    Settings
} from 'lucide-react';
import { Layout, Button, Input } from './components/Shared';
import { MenstrualScreen, HouseScreen, ANCScreen, PNCScreen } from './components/FormScreens';
import { getSubmissions, syncAllPending, clearData, seedDemoData } from './services/storage';
import { User, AnySubmission } from './types';

// --- Auth Component ---
const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
    const [loading, setLoading] = useState(false);

    const handleGoogle = () => {
        setLoading(true);
        setTimeout(() => {
            onLogin({ uid: 'user-google-123', email: 'volunteer@snp.org', isAnonymous: false });
        }, 800);
    };

    const handleGuest = () => {
        onLogin({ uid: 'guest-' + Math.random().toString(36).substr(2, 5), email: null, isAnonymous: true });
    };

    return (
        <div className="min-h-screen bg-primary-50 flex flex-col items-center justify-center p-6 max-w-md mx-auto border-x bg-white">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <Activity className="text-primary-600" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">SNP Field Data</h1>
            <p className="text-gray-500 text-center mb-8">Secure data collection for field volunteers.</p>

            <div className="w-full space-y-4">
                <Button onClick={handleGoogle} disabled={loading} className="bg-white border text-gray-700 hover:bg-gray-50 shadow-sm">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
                    Sign in with Google
                </Button>
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <Button variant="secondary" onClick={handleGuest}>Continue as Guest</Button>
            </div>
            <p className="mt-8 text-xs text-gray-400">Version 1.0.0 (PWA)</p>
        </div>
    );
};

// --- Dashboard Component ---
const Dashboard = ({ user, isOnline }: { user: User, isOnline: boolean }) => {
    const [stats, setStats] = useState<AnySubmission[]>([]);
    const [lastSync, setLastSync] = useState<number | null>(null);

    useEffect(() => {
        const data = getSubmissions();
        setStats(data);
        const synced = data.filter(d => d.status === 'synced').sort((a,b) => (b.syncedAt || 0) - (a.syncedAt || 0));
        if (synced.length > 0) setLastSync(synced[0].syncedAt || null);
    }, []);

    const countByType = (type: string) => stats.filter(s => s.formType === type).length;
    const chartData = [
        { name: 'Menst.', count: countByType('menstrual'), color: '#ec4899' },
        { name: 'House', count: countByType('house'), color: '#3b82f6' },
        { name: 'ANC', count: countByType('anc'), color: '#8b5cf6' },
        { name: 'PNC', count: countByType('pnc'), color: '#10b981' },
    ];

    const MenuCard = ({ title, icon: Icon, to, color }: any) => (
        <Link to={to} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow active:scale-95">
            <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <span className="font-medium text-gray-700 text-sm">{title}</span>
        </Link>
    );

    return (
        <Layout title="Dashboard" isOnline={isOnline}>
            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Overview</h2>
                    <span className="text-xs text-gray-500">Total: {stats.length}</span>
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

            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Forms</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <MenuCard title="Menstrual Surv." icon={Activity} to="/form/menstrual" color="bg-pink-500 text-pink-600" />
                <MenuCard title="House Reg." icon={Home} to="/form/house" color="bg-blue-500 text-blue-600" />
                <MenuCard title="ANC Follow-up" icon={Users} to="/form/anc" color="bg-purple-500 text-purple-600" />
                <MenuCard title="PNC & Baby" icon={Baby} to="/form/pnc" color="bg-emerald-500 text-emerald-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <Link to="/history" className="bg-gray-800 text-white p-4 rounded-xl shadow flex items-center justify-between">
                    <span className="font-medium">History & Sync</span>
                    <HistoryIcon size={20} />
                </Link>
                 <Link to="/settings" className="bg-white border text-gray-700 p-4 rounded-xl shadow-sm flex items-center justify-between">
                    <span className="font-medium">Settings</span>
                    <Settings size={20} />
                </Link>
            </div>

            {lastSync && (
                <p className="text-center text-xs text-gray-400 mt-6">
                    Last synced: {new Date(lastSync).toLocaleTimeString()}
                </p>
            )}
        </Layout>
    );
};

// --- History Screen ---
const HistoryScreen = ({ isOnline }: { isOnline: boolean }) => {
    const [items, setItems] = useState<AnySubmission[]>([]);
    const [syncing, setSyncing] = useState(false);

    const load = () => setItems(getSubmissions());

    useEffect(load, []);

    const handleSync = async () => {
        if (!isOnline) return alert("You are offline.");
        setSyncing(true);
        const count = await syncAllPending();
        setSyncing(false);
        load();
        if(count > 0) alert(`Synced ${count} items successfully!`);
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
                <button 
                    onClick={handleSync} 
                    disabled={syncing || !isOnline}
                    className="text-primary-600 text-sm font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
            </div>

            <div className="space-y-3">
                {items.length === 0 && <div className="text-center py-10 text-gray-400">No submissions found.</div>}
                {items.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${
                                    item.formType === 'menstrual' ? 'bg-pink-500' :
                                    item.formType === 'house' ? 'bg-blue-500' :
                                    item.formType === 'anc' ? 'bg-purple-500' : 'bg-emerald-500'
                                }`}>
                                    {item.formType.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(item.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="font-medium text-gray-800 mt-1">
                                {item.formType === 'house' ? (item as any).headOfFamily : 
                                 item.formType === 'anc' ? (item as any).ancName :
                                 item.formType === 'pnc' ? (item as any).motherName :
                                 (item as any).snpHouseNumber}
                            </p>
                        </div>
                        <StatusIcon status={item.status} />
                    </div>
                ))}
            </div>
        </Layout>
    );
};

// --- Settings Screen ---
const SettingsScreen = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
    const handleReset = () => {
        if(confirm("Delete all local data?")) {
            clearData();
            window.location.reload();
        }
    }
    return (
        <Layout title="Settings" showBack isOnline={true}>
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">Signed in as</p>
                <p className="font-medium">{user.email || 'Guest User'}</p>
                <p className="text-xs text-gray-400 mt-1">UID: {user.uid}</p>
            </div>

            <div className="space-y-3">
                <Button variant="outline" onClick={() => seedDemoData(user.uid)}>Load Demo Data</Button>
                <Button variant="outline" onClick={handleReset} className="!text-red-600 !border-red-200">Clear Local Storage</Button>
                <Button variant="secondary" onClick={onLogout}>
                    <LogOut size={18} /> Sign Out
                </Button>
            </div>
        </Layout>
    )
}

// --- Main App Logic ---
const AppContent = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        
        // Check session
        const storedUser = localStorage.getItem('snp_user');
        if (storedUser) setUser(JSON.parse(storedUser));

        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }, []);

    const handleLogin = (u: User) => {
        setUser(u);
        localStorage.setItem('snp_user', JSON.stringify(u));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('snp_user');
    };

    if (!user) {
        return <AuthScreen onLogin={handleLogin} />;
    }

    return (
        <Routes>
            <Route path="/" element={<Dashboard user={user} isOnline={isOnline} />} />
            <Route path="/history" element={<HistoryScreen isOnline={isOnline} />} />
            <Route path="/settings" element={<SettingsScreen user={user} onLogout={handleLogout} />} />
            
            {/* Forms */}
            <Route path="/form/menstrual" element={<MenstrualScreen user={user} isOnline={isOnline} />} />
            <Route path="/form/house" element={<HouseScreen user={user} isOnline={isOnline} />} />
            <Route path="/form/anc" element={<ANCScreen user={user} isOnline={isOnline} />} />
            <Route path="/form/pnc" element={<PNCScreen user={user} isOnline={isOnline} />} />
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
