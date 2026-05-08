'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    LogOut, 
    BookOpen, 
    Users, 
    Clock, 
    ChevronRight, 
    Sparkles,
    Search,
    LayoutDashboard,
    Settings,
    Bell
} from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [maxAuthors, setMaxAuthors] = useState(5);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchStories();
    }, [user]);

    const fetchStories = async () => {
        try {
            const { data } = await api.get('/stories/');
            setStories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/stories/', { title, genre, max_authors: maxAuthors });
            setShowCreate(false);
            setTitle('');
            setGenre('');
            router.push(`/story/${data.id}`);
        } catch (err) {
            setError(err.response?.data?.title?.[0] || 'Creation failed');
        }
    };

    if (!user) return null;

    const filteredStories = stories.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                StoryForge
                            </span>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {user.username}
                            </div>
                            <button 
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold text-white tracking-tight"
                        >
                            Your Library
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400 mt-2"
                        >
                            Continue your adventures or forge a new path.
                        </motion.p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search stories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 w-full md:w-64 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                        >
                            <Plus size={18} />
                            <span>Create New</span>
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="glass-card h-48 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredStories.length === 0 ? (
                            <div className="col-span-full py-20 text-center glass-card rounded-3xl border-dashed">
                                <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
                                <h3 className="text-xl font-semibold text-slate-300">No stories found</h3>
                                <p className="text-slate-500 mt-1">Start your first adventure today!</p>
                            </div>
                        ) : (
                            filteredStories.map((story, index) => (
                                <motion.div
                                    key={story.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/story/${story.id}`} className="group block h-full">
                                        <div className="glass-card h-full p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 hover:bg-white/5 transition-all relative overflow-hidden flex flex-col">
                                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="text-indigo-400" size={20} />
                                            </div>
                                            
                                            <div className="mb-4">
                                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                                                    {story.genre || 'Unknown Genre'}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
                                                {story.title}
                                            </h3>
                                            
                                            <p className="text-slate-400 text-sm mb-6 flex items-center gap-1.5">
                                                <Users size={14} className="text-slate-500" />
                                                By {story.owner} • {story.participant_count} participants
                                            </p>
                                            
                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Clock size={14} />
                                                    <span>{story.status}</span>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${story.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </main>

            {/* Create Story Modal Overlay */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreate(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg glass-card p-8 rounded-3xl border border-white/10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                                        <Plus className="text-indigo-400" size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">New Story</h2>
                                </div>
                                <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                                        placeholder="Enter an epic title"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Genre</label>
                                    <input
                                        type="text"
                                        value={genre}
                                        onChange={(e) => setGenre(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                                        placeholder="Fantasy, Sci-Fi, Horror..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Max Authors</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="2"
                                            max="10"
                                            value={maxAuthors}
                                            onChange={(e) => setMaxAuthors(Number(e.target.value))}
                                            className="flex-1 accent-indigo-600"
                                        />
                                        <span className="w-12 h-10 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center justify-center font-bold text-indigo-400">
                                            {maxAuthors}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                                    >
                                        Create Adventure
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}