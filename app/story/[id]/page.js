'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import useStoryWebSocket from '@/lib/useStoryWebSocket';
import Link from 'next/link';

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

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const handleWebSocketMessage = useCallback((msg) => {
        switch (msg.type) {
            case 'new_segment':
                setSegments(prev => [...prev, msg.segment]);
                // Clear typing for this user if they were typing
                setTypingUsers(prev => {
                    const updated = { ...prev };
                    delete updated[msg.segment.author_user];
                    return updated;
                });
                break;
            case 'turn_changed':
                setCurrentTurnUserId(msg.user_id);
                // Clear all typing indicators on turn change
                setTypingUsers({});
                break;
            case 'user_typing':
                setTypingUsers(prev => ({
                    ...prev,
                    [msg.username]: msg.is_typing
                }));
                // Auto-clear typing after 2 seconds if no update
                if (msg.is_typing) {
                    setTimeout(() => {
                        setTypingUsers(prev => {
                            const updated = { ...prev };
                            if (updated[msg.username] === true) {
                                updated[msg.username] = false;
                            }
                            return updated;
                        });
                    }, 2000);
                }
                break;
            case 'user_joined':
            case 'user_left':
                // We could update online participants list, but for now ignore.
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
        // Fetch story details and segments (REST)
        const fetchData = async () => {
            try {
                const [storyRes, segmentsRes] = await Promise.all([
                    api.get(`/stories/${id}/`),
                    api.get(`/stories/${id}/segments/`)
                ]);
                setStory(storyRes.data);
                setSegments(segmentsRes.data);
                // If story is active, get current turn from initial segment? No, from WebSocket.
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

    if (authLoading || loadingData) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!story) return null;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 p-4 flex justify-between items-center">
                <Link href={`/story/${id}`} className="text-blue-400">&larr; Return to Lobby</Link>
                <h1 className="text-xl font-bold">{story.title}</h1>
                <span className={`px-2 py-1 rounded ${connected ? 'bg-green-600' : 'bg-red-600'}`}>
                    {connected ? 'Live' : 'Reconnecting...'}
                </span>
            </div>

            {/* Turn indicator */}
            <div className="bg-gray-700 p-2 text-center">
                {currentTurnUser ? (
                    <span>
                        Current turn: <strong>{currentTurnUser.user.username}</strong>
                        {isMyTurn && <span className="ml-2 text-yellow-300">(It&apos;s YOUR turn!)</span>}
                    </span>
                ) : (
                    <span>Waiting for story to start...</span>
                )}
            </div>

            {/* Story log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {segments.length === 0 && <p className="text-gray-400 italic">The story is empty. Waiting for first paragraph...</p>}
                {segments.map(seg => (
                    <div key={seg.id} className={`p-3 rounded ${seg.author_type === 'human' ? 'bg-gray-800' : 'bg-gray-700 border border-purple-500'}`}>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>{seg.author_user || 'AI'}</span>
                            <span>{new Date(seg.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p>{seg.content}</p>
                    </div>
                ))}

                {/* Typing indicators */}
                {Object.entries(typingUsers).map(([username, isTyping]) => (
                    isTyping && (
                        <div key={username} className="text-gray-400 italic animate-pulse">
                            {username} is typing...
                        </div>
                    )
                ))}
            </div>

            {/* Input area (only for current turn writer) */}
            {isMyTurn && (
                <form onSubmit={handleSubmit} className="bg-gray-800 p-4">
                    <textarea
                        value={paragraph}
                        onChange={handleTyping}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                        rows="3"
                        placeholder="Write your paragraph..."
                        disabled={!connected}
                    />
                    <button
                        type="submit"
                        className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
                        disabled={!connected || !paragraph.trim()}
                    >
                        Submit Paragraph
                    </button>
                </form>
            )}

            {/* Wait message for others */}
            {!isMyTurn && currentTurnUser && (
                <div className="bg-gray-800 p-4 text-center text-gray-400">
                    Waiting for {currentTurnUser.user.username} to write...
                </div>
            )}
        </div>
    );
}