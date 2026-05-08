'use client';
import { useEffect, useRef, useCallback, useState } from 'react';

const MAX_RECONNECT_DELAY = 30000;

const useStoryWebSocket = (storyId, token, onMessage) => {
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const isMountedRef = useRef(true);
    const [connected, setConnected] = useState(false);

    const connect = useCallback(() => {
        const isNumericId = /^\d+$/.test(String(storyId));
        if (!isNumericId || !token) {
            console.log('Aborting connection: Invalid storyId or missing token. storyId:', storyId);
            return;
        }

        // Don't open a second socket if one is already open or connecting
        if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return;

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const url = `${protocol}://localhost:8000/ws/story/${storyId}/?token=${token}`;
        console.log('Connecting to WebSocket:', url);

        const socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connected');
            reconnectAttemptsRef.current = 0;
            setConnected(true);
        };

        socket.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason, event.wasClean);
            setConnected(false);

            // Don't reconnect if component unmounted or it was a clean close
            if (!isMountedRef.current) return;
            if (event.code === 1000 || event.code === 1001) return;

            // Exponential backoff: 1s, 2s, 4s, 8s … capped at 30s
            const delay = Math.min(
                1000 * 2 ** reconnectAttemptsRef.current,
                MAX_RECONNECT_DELAY
            );
            reconnectAttemptsRef.current += 1;
            console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
            reconnectTimeoutRef.current = setTimeout(connect, delay);
        };

        socket.onerror = () => {
            // onerror always fires before onclose — let onclose handle reconnect logic.
            // Do NOT call socket.close() here; the browser closes it automatically after onerror.
            console.error('WebSocket error — waiting for close event');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (e) {
                console.error('Invalid WebSocket message:', e);
            }
        };
    }, [storyId, token, onMessage]);

    useEffect(() => {
        isMountedRef.current = true;
        connect();

        return () => {
            isMountedRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
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