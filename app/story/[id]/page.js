'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import useStoryWebSocket from '@/lib/useStoryWebSocket';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, 
    Send, 
    Sparkles, 
    Users, 
    Info, 
    MessageSquare,
    Zap,
    Clock,
    Circle
} from 'lucide-react';

export default function PlayPage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [story, setStory] = useState(null);
    const [segments, setSegments] = useState([]);
    const [currentTurnUserId, setCurrentTurnUserId] = useState(null);
    const [typingUsers, setTypingUsers] = useState({});
    const [paragraph, setParagraph] = useState('');
    const [error, setError] = useState('');
    const [loadingData, setLoadingData] = useState(true);
    
    const scrollRef = useRef(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const handleWebSocketMessage = useCallback((msg) => {
        switch (msg.type) {
            case 'new_segment':
                setSegments(prev => [...prev, msg.segment]);
                setTypingUsers(prev => {
                    const updated = { ...prev };
                    delete updated[msg.segment.author_user];
                    return updated;
                });
                break;
            case 'turn_changed':
                setCurrentTurnUserId(msg.user_id);
                setTypingUsers({});
                break;
            case 'user_typing':
                setTypingUsers(prev => ({
                    ...prev,
                    [msg.username]: msg.is_typing
                }));
                if (msg.is_typing) {
                    setTimeout(() => {
                        setTypingUsers(prev => {
                            const updated = { ...prev };
                            if (updated[msg.username] === true) {
                                updated[msg.username] = false;
                            }
                            return updated;
                        });
                    }, 3000);
                }
                break;
            default:
                break;
        }
    }, []);

    const { sendMessage, connected } = useStoryWebSocket(id, token, handleWebSocketMessage);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!id || !user) return;
        
        if (id === 'undefined') {
            setError('Invalid Story ID.');
            setLoadingData(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [storyRes, segmentsRes] = await Promise.all([
                    api.get(`/stories/${id}/`),
                    api.get(`/stories/${id}/segments/`)
                ]);
                setStory(storyRes.data);
                setSegments(segmentsRes.data);
            } catch (err) {
                if (err.response?.status === 403) {
                    setError('You are not a participant of this story.');
                } else {
                    setError('Failed to load story.');
                }
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [id, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [segments, typingUsers]);

    const isMyTurn = currentTurnUserId === user?.id;
    const currentTurnUser = story?.participants?.find(p => p.user.id === currentTurnUserId);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!paragraph.trim()) return;
        sendMessage({ type: 'submit_paragraph', content: paragraph });
        setParagraph('');
    };

    const handleTyping = (e) => {
        const val = e.target.value;
        setParagraph(val);
        if (isMyTurn) {
            sendMessage({ type: 'typing', is_typing: val.length > 0 });
        }
    };

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-slate-400 animate-pulse">Loading story...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
                <div className="glass-card p-8 rounded-3xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <Info className="text-red-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <Link href="/dashboard" className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-colors">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-50 border-b border-white/5 bg-[#0f172a]/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <ChevronLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-none">{story.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                    {connected ? 'Live Sync' : 'Connecting...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Users size={18} />
                            <span className="text-sm font-medium">{story.participant_count} Authors</span>
                        </div>
                        <div className="h-6 w-px bg-white/5" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <span className="text-xs font-bold text-indigo-400">{user.username[0].toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Turn Indicator Banner */}
            <div className="relative z-40 bg-indigo-600/10 border-b border-indigo-500/10 py-3">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
                    {currentTurnUser ? (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3"
                        >
                            <Zap size={16} className={isMyTurn ? "text-yellow-400 animate-pulse" : "text-indigo-400"} />
                            <span className="text-sm font-medium">
                                {isMyTurn ? (
                                    <span className="text-white font-bold">It&apos;s your turn! Forge the next path...</span>
                                ) : (
                                    <span>Waiting for <span className="text-indigo-400 font-bold">{currentTurnUser.user.username}</span> to write</span>
                                )}
                            </span>
                        </motion.div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-500 italic text-sm">
                            <Clock size={16} />
                            <span>Waiting for story to commence...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Story Content Area */}
            <main 
                ref={scrollRef}
                className="relative z-10 flex-1 overflow-y-auto px-4 py-8 custom-scrollbar"
            >
                <div className="max-w-3xl mx-auto space-y-8">
                    {segments.length === 0 && (
                        <div className="text-center py-20 opacity-40">
                            <MessageSquare className="mx-auto mb-4" size={48} />
                            <p className="italic text-lg">The ink is dry, the parchment is fresh.<br/>Waiting for the first words to be spoken...</p>
                        </div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {segments.map((seg, index) => (
                            <motion.div 
                                key={seg.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className={`group relative p-6 rounded-2xl border transition-all ${
                                    seg.author_type === 'ai' 
                                    ? 'bg-purple-500/5 border-purple-500/20' 
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                            seg.author_type === 'ai' 
                                            ? 'bg-purple-500/20 border-purple-500/30' 
                                            : 'bg-indigo-500/20 border-indigo-500/30'
                                        }`}>
                                            {seg.author_type === 'ai' ? <Sparkles size={14} className="text-purple-400" /> : <Users size={14} className="text-indigo-400" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-none">
                                                {seg.author_user || 'The AI Weaver'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                                {seg.author_type === 'ai' ? 'Collaborative AI' : 'Human Author'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-medium">
                                        {new Date(seg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                                    {seg.content}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing Indicators */}
                    <div className="h-6 flex items-center gap-4">
                        {Object.entries(typingUsers).map(([username, isTyping]) => (
                            isTyping && (
                                <motion.div 
                                    key={username}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="flex gap-1">
                                        <Circle size={4} className="fill-indigo-400 animate-bounce" />
                                        <Circle size={4} className="fill-indigo-400 animate-bounce [animation-delay:0.2s]" />
                                        <Circle size={4} className="fill-indigo-400 animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">{username} is writing...</span>
                                </motion.div>
                            )
                        ))}
                    </div>
                </div>
            </main>

            {/* Input Footer */}
            <footer className="relative z-50 p-4 border-t border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto">
                    {isMyTurn ? (
                        <form onSubmit={handleSubmit} className="relative group">
                            <textarea
                                value={paragraph}
                                onChange={handleTyping}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-4 pr-16 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-white placeholder:text-slate-600 min-h-[100px] max-h-[300px] resize-none"
                                placeholder="Whisper your part of the legend..."
                                disabled={!connected}
                            />
                            <button
                                type="submit"
                                disabled={!connected || !paragraph.trim()}
                                className="absolute bottom-4 right-4 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    ) : (
                        <div className="py-8 text-center text-slate-500">
                            <p className="text-sm font-medium italic">
                                {currentTurnUser 
                                    ? `Listen closely as ${currentTurnUser.user.username} weaves their tale...` 
                                    : "Patience... the story will begin shortly."}
                            </p>
                        </div>
                    )}
                </div>
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}