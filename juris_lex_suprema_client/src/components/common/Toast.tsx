import React, { useEffect } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
    message, 
    type, 
    onClose, 
    duration = 3000 
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '';
        }
    };

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-icon">{getIcon()}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
}; 