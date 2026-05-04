'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';

export default function StoryLobby() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');

    const fetchStory = async () => {
        try {
            const { data } = await api.get(`/stories/${id}/`);
            setStory(data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Story not found');
            } else if (err.response?.status === 403) {
                setError('You are not part of this story');
            } else {
                setError('Failed to fetch story details');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchStory();
    }, [id, user]);

    const isParticipant = story?.participants?.some(p => p.user.id === user?.id);
    const isOwner = story?.owner?.id === user?.id;

    const handleJoin = async () => {
        try {
            await api.post(`/stories/${id}/join/`);
            fetchStory(); // refresh
        } catch (err) {
            setActionError(err.response?.data?.error || 'Cannot join');
        }
    };

    const handleLeave = async () => {
        try {
            await api.post(`/stories/${id}/leave/`);
            fetchStory();
        } catch (err) {
            setActionError(err.response?.data?.detail || 'Cannot leave');
        }
    };

    const handleStart = async () => {
        try {
            await api.post(`/stories/${id}/start/`);
            router.push(`/story/${id}/play`); // Will be built in Phase 2
        } catch (err) {
            setActionError(err.response?.data?.error || 'Cannot start');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!story) return null;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
                <Link href="/dashboard" className="text-blue-500 mb-4 inline-block">&larr; Back</Link>
                <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
                <p className="text-gray-600 mb-4">Genre: {story.genre || 'Any'} | Status: {story.status}</p>
                <p>Owner: {story.owner.username}</p>
                <p>Max Authors: {story.max_authors}</p>

                {actionError && <p className="text-red-500 mt-2">{actionError}</p>}

                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-2">Participants ({story.participants.length})</h2>
                    <ul className="list-disc pl-5">
                        {story.participants.map(p => (
                            <li key={p.id}>
                                {p.user.username} — {p.role}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 flex gap-4">
                    {!isParticipant && story.status === 'lobby' && (
                        <button onClick={handleJoin} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Join Story
                        </button>
                    )}
                    {isParticipant && !isOwner && story.status === 'lobby' && (
                        <button onClick={handleLeave} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                            Leave Story
                        </button>
                    )}
                    {isOwner && story.status === 'lobby' && (
                        <button onClick={handleStart} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            Start Story
                        </button>
                    )}
                    {story.status === 'active' && !isParticipant && (
                        <p className="text-gray-500">Story already active (join not allowed).</p>
                    )}
                </div>

                {story.status === 'active' && isParticipant && (
                    <div className="mt-4">
                        <Link href={`/story/${id}/play`} className="bg-purple-600 text-white px-4 py-2 rounded inline-block">
                            Enter Story
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}