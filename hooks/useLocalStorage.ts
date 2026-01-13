'use client';

import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse } from '@/lib/utils';

/**
 * Custom hook for localStorage with SSR safety
 * @param key - localStorage key
 * @param initialValue - default value if key doesn't exist
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(safeJsonParse(item, initialValue));
            }
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
        }
        setIsLoaded(true);
    }, [key, initialValue]);

    // Return a wrapped version of useState's setter function
    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            try {
                // Allow value to be a function for same API as useState
                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;

                setStoredValue(valueToStore);

                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    // Remove the item from localStorage
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue, isLoaded] as const;
}
