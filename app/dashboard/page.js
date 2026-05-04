'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

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
    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">StoryForge</h1>
                    <div>
                        <span className="mr-4">Welcome, {user.username}</span>
                        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
                            Logout
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
                >
                    Create Story
                </button>

                {showCreate && (
                    <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow mb-4">
                        <h2 className="text-xl font-bold mb-2">New Story</h2>
                        {error && <p className="text-red-500">{error}</p>}
                        <div className="mb-2">
                            <label className="block text-sm">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-sm">Genre</label>
                            <input
                                type="text"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                                className="w-full border px-3 py-2 rounded"
                                placeholder="Fantasy, Sci-Fi, etc."
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-sm">Max Authors</label>
                            <input
                                type="number"
                                value={maxAuthors}
                                onChange={(e) => setMaxAuthors(Number(e.target.value))}
                                className="w-full border px-3 py-2 rounded"
                                min="2"
                                max="10"
                            />
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                            Create
                        </button>
                    </form>
                )}

                <div className="bg-white rounded shadow">
                    <h2 className="text-xl font-bold p-4 border-b">Stories</h2>
                    {stories.length === 0 && <p className="p-4">No stories yet.</p>}
                    <ul>
                        {stories.map(story => (
                            <li key={story.id} className="p-4 border-b hover:bg-gray-50">
                                <Link href={`/story/${story.id}`} className="block">
                                    <div className="flex justify-between">
                                        <div>
                                            <span className="font-semibold">{story.title}</span>
                                            <span className="ml-2 text-sm text-gray-500">by {story.owner}</span>
                                        </div>
                                        <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                                            {story.status} ({story.participant_count} participants)
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}