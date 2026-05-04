'use client';
import { useParams } from 'next/navigation';

export default function PlayPage() {
    const { id } = useParams();
    return (
        <div className="p-8">
            <h1>Story Play Page (coming in Phase 2)</h1>
            <p>Story ID: {id}</p>
        </div>
    );
}