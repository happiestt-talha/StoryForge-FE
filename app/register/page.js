'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Loader2, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(username, email, password);
            router.push('/dashboard');
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                // Handle standard Django error objects
                const firstKey = Object.keys(data)[0];
                const errorVal = data[firstKey];
                const message = Array.isArray(errorVal) ? errorVal[0] : (typeof errorVal === 'string' ? errorVal : 'Registration failed');
                setError(message);
            } else if (typeof data === 'string' && data.length > 0) {
                // Handle plain text errors (like "Internal Server Error")
                setError(data.includes('Internal Server Error') ? 'Server Error. Please try again later.' : data.slice(0, 100));
            } else {
                setError('Registration failed. Please check your connection.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0f172a]">
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
                style={{ backgroundImage: "url('/auth-bg.png')" }}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#0f172a]/90 via-[#0f172a]/70 to-[#0f172a]/90" />

            {/* Decorative Sparkles */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {mounted && [...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-30"
                        animate={{
                            y: [0, -120, 0],
                            opacity: [0, 0.6, 0],
                            scale: [1, 1.8, 1],
                        }}
                        transition={{
                            duration: Math.random() * 6 + 4,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-20 w-full max-w-md px-6"
            >
                <div className="glass-card p-8 rounded-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
                            <UserPlus className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
                        <p className="text-slate-400 mt-2 text-sm text-center px-4">Join our community of storytellers and build worlds together.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                                        <AlertCircle size={16} className="shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-400 text-slate-500">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-800/40 border border-slate-700 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-600 autofill:bg-slate-800/40 autofill:text-white"
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-400 text-slate-500">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800/40 border border-slate-700 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-600 autofill:bg-slate-800/40 autofill:text-white"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-400 text-slate-500">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800/40 border border-slate-700 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-600 autofill:bg-slate-800/40 autofill:text-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full relative group overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center justify-center">
                                    {isLoading ? (
                                        <Loader2 className="animate-spin mr-2" size={20} />
                                    ) : (
                                        <>
                                            <span>Create Account</span>
                                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>

                        <p className="text-center text-slate-400 text-sm pt-4">
                            Already have an account? {' '}
                            <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
                
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-xs tracking-widest uppercase">
                        Experience the art of <span className="text-emerald-400/70 font-medium">Storytelling</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}