'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(username, email, password);
            router.push('/dashboard');
        } catch (err) {
            const data = err.response?.data;
            if (data) {
                const firstKey = Object.keys(data)[0];
                setError(data[firstKey]?.[0] || 'Registration failed');
            } else {
                setError('Registration failed');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Register</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                    Register
                </button>
                <p className="mt-4 text-center text-sm">
                    Already have an account? <Link href="/login" className="text-blue-500">Login</Link>
                </p>
            </form>
        </div>
    );
}