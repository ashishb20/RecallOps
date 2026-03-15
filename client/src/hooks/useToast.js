import { useState, useCallback, useEffect } from "react";

//  secure toast notifications state management

const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, []);

    useEffect(() => {
        if (toasts.length === 0) return;

        const timers = toasts.map((toast) => {
            return setTimeout(() => {
                removeToast(toast.id);
            }, toast.duration);
        });

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [toasts, removeToast]);

    const sanitizeMessage = (message) => {
        if (typeof message !== 'string') {
            return String(message);
        }

        return message
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[<>]/g, '') // Remove  < and > 
            .trim()
            .slice(0, 200); // limit length to prevent abuse
    };

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const validTypes = ['success', 'error', 'info', 'warning'];
        const safeType = validTypes.includes(type) ? type : 'info';

        const safeDuration = Math.min(Math.max(duration, 1000), 10000); // between 1s and 10s

        const safeMessage = sanitizeMessage(message);
        if (!safeMessage) {
            console.warn('Empty message blocked');
            return;
        }
        // Rate  limit : max 10
        setToasts((prev) => {
            if (prev.length >= 10) {
                console.warn('Toast rate limit reached');
                return prev;
            }

            const newToast = {
                id: Date.now() + Math.random(),
                message: safeMessage,
                type: safeType,
                duration: safeDuration,
            };
            return [...prev, newToast];
        });
    }, []);


    const showSuccess = useCallback((message, duration) => {
        addToast(message, 'success', duration);
    }, [addToast]);

    const showError = useCallback((message, duration) => {
        addToast(message, 'error', duration);
    }, [addToast]);
    const showInfo = useCallback((message, duration) => {
        addToast(message, 'info', duration);
    }, [addToast]);

    const showWarning = useCallback((message, duration) => {
        addToast(message, 'warning', duration);
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
    };
};
export default useToast;