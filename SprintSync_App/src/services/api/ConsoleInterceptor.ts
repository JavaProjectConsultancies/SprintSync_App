/**
 * Console Interceptor
 * Captures all console.* calls and sends them to the backend API.
 * Suppresses original console output to keep the browser console clean.
 */

import { API_CONFIG } from './config';

const LOG_ENDPOINT = '/logs/browser';
const BATCH_INTERVAL = 5000; // 5 seconds
const MAX_BATCH_SIZE = 50;

interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
}

class ConsoleInterceptor {
    private logBuffer: LogEntry[] = [];
    private originalConsole: any = {};
    private isInitializing = false;

    constructor() {
        this.originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
        };
    }

    public init() {
        if (this.isInitializing) return;
        this.isInitializing = true;

        // Override console methods
        console.log = (...args: any[]) => this.capture('info', args);
        console.info = (...args: any[]) => this.capture('info', args);
        console.warn = (...args: any[]) => this.capture('warn', args);
        console.error = (...args: any[]) => this.capture('error', args);

        // Capture unhandled errors
        window.onerror = (message, source, lineno, colno, error) => {
            this.originalConsole.error('Captured window.onerror:', message, error); // Internal dev trace
            this.capture('error', [`Window Error: ${message} at ${source}:${lineno}:${colno}`]);
            return true; // Suppress default browser error log
        };

        window.onunhandledrejection = (event) => {
            this.capture('error', [`Unhandled Promise Rejection: ${event.reason}`]);
        };

        // Start background sync
        setInterval(() => this.flush(), BATCH_INTERVAL);

        // Final flush on page unload
        window.addEventListener('beforeunload', () => this.flush(true));
    }

    private capture(level: string, args: any[]) {
        // 1. Format the message
        const message = args
            .map((arg) => {
                try {
                    if (typeof arg === 'object') {
                        return JSON.stringify(arg, getCircularReplacer());
                    }
                    return String(arg);
                } catch (e) {
                    return '[Unserializable Object]';
                }
            })
            .join(' ');

        // 2. Add to buffer
        this.logBuffer.push({
            level,
            message,
            timestamp: new Date().toISOString(),
        });

        // 3. Immediate flush if buffer is local-full
        if (this.logBuffer.length >= MAX_BATCH_SIZE) {
            this.flush();
        }
    }

    private async flush(isSync = false) {
        if (this.logBuffer.length === 0) return;

        const logsToSend = [...this.logBuffer];
        this.logBuffer = [];

        const payload = JSON.stringify(logsToSend);
        const url = `${API_CONFIG.BASE_URL}${LOG_ENDPOINT}`;

        try {
            if (isSync && navigator.sendBeacon) {
                // Use beacon for reliable delivery during unload
                navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
            } else {
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true,
                });
            }
        } catch (err) {
            // If logging fails, we silently drop them to avoid infinite recursion
            // or we could put them back in the buffer, but that's risky if the server is down.
        }
    }
}

// Helper to handle circular references in JSON.stringify
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key: string, value: any) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    };
};

export const consoleInterceptor = new ConsoleInterceptor();
