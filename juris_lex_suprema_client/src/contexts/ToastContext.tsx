import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const showToast = (message: string, type: ToastType) => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'info':
                toast(message);
                break;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            <Toaster position="top-right" />
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}; 