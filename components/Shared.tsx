import React from 'react';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

// Layout
export const Layout: React.FC<{ children: React.ReactNode; title: string; showBack?: boolean; isOnline: boolean }> = ({ 
  children, title, showBack = false, isOnline 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl bg-white border-x border-gray-200">
      <header className="bg-primary-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {showBack && (
                    <Link to="/" className="p-1 hover:bg-primary-700 rounded-full">
                        <ArrowLeft size={24} />
                    </Link>
                )}
                <h1 className="text-xl font-semibold tracking-wide">{title}</h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium bg-primary-700 px-2 py-1 rounded">
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>
    </div>
  );
};

// Form UI Elements
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      ref={ref}
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
));

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, options, error, ...props }, ref) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
        <select
        ref={ref}
        className={`w-full p-3 bg-white border rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 outline-none ${error ? 'border-red-500' : 'border-gray-300'}`}
        {...props}
        >
        <option value="">Select an option</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
));

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }> = ({ 
  children, variant = 'primary', className, ...props 
}) => {
  const base = "w-full py-3.5 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95 transform duration-100";
  const styles = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200",
    secondary: "bg-gray-800 text-white hover:bg-gray-900",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
  };
  
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const CheckboxGroup: React.FC<{ 
    label: string; 
    options: string[]; 
    selected: string[]; 
    onChange: (val: string[]) => void 
}> = ({ label, options, selected, onChange }) => {
    const toggle = (opt: string) => {
        if (selected.includes(opt)) onChange(selected.filter(s => s !== opt));
        else onChange([...selected, opt]);
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="grid grid-cols-2 gap-2">
                {options.map(opt => (
                    <div 
                        key={opt}
                        onClick={() => toggle(opt)}
                        className={`p-2 rounded border cursor-pointer text-sm flex items-center transition-colors ${selected.includes(opt) ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-200'}`}
                    >
                        <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${selected.includes(opt) ? 'bg-primary-500 border-primary-500' : 'border-gray-400'}`}>
                            {selected.includes(opt) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                        {opt}
                    </div>
                ))}
            </div>
        </div>
    );
};
