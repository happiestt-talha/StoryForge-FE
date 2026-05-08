'use client';
import { useEffect, useRef, useCallback, useState } from 'react';

const useStoryWebSocket = (storyId, token, onMessage) => {
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const [connected, setConnected] = useState(false);

    const connect = useCallback(() => {
        if (!storyId || !token) return;

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const url = `${protocol}://localhost:8000/ws/story/${storyId}/?token=${token}`;

        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log('WebSocket connected');
            setConnected(true);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        socket.onclose = (event) => {
            console.log('WebSocket closed, reconnecting...');
            setConnected(false);
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 3000);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            socket.close();
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (e) {
                console.error('Invalid message:', e);
            }
        };

        wsRef.current = socket;
    }, [storyId, token, onMessage]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    const sendMessage = useCallback((msg) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        }
    }, []);

    return { sendMessage, connected };
};

export default useStoryWebSocket;