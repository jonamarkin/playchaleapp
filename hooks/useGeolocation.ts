'use client';

import { useState, useEffect } from 'react';

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    error: GeolocationPositionError | null;
    isLoading: boolean;
}

interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

/**
 * Custom hook for accessing browser geolocation
 * @param options - Geolocation options
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        isLoading: true,
    });

    useEffect(() => {
        let isActive = true;

        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            queueMicrotask(() => {
                if (!isActive) return;

                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: {
                        code: 0,
                        message: 'Geolocation is not supported',
                        PERMISSION_DENIED: 1,
                        POSITION_UNAVAILABLE: 2,
                        TIMEOUT: 3,
                    } as GeolocationPositionError,
                }));
            });

            return () => {
                isActive = false;
            };
        }

        const handleSuccess = (position: GeolocationPosition) => {
            if (!isActive) return;

            setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                error: null,
                isLoading: false,
            });
        };

        const handleError = (error: GeolocationPositionError) => {
            if (!isActive) return;

            setState((prev) => ({
                ...prev,
                error,
                isLoading: false,
            }));
        };

        const geoOptions: PositionOptions = {
            enableHighAccuracy: options.enableHighAccuracy ?? false,
            timeout: options.timeout ?? 10000,
            maximumAge: options.maximumAge ?? 0,
        };

        navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            geoOptions
        );

        return () => {
            isActive = false;
        };
    }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

    return {
        ...state,
        coords: state.latitude && state.longitude
            ? { lat: state.latitude, lng: state.longitude }
            : null,
    };
}
