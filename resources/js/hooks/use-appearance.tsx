import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light';

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    // Always ensure light mode by removing dark class
    document.documentElement.classList.remove('dark');
};

export function initializeTheme() {
    // Always apply light theme
    applyTheme('light');
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance('light'); // Always set to light

        // Store in localStorage for consistency
        localStorage.setItem('appearance', 'light');

        // Store in cookie for SSR
        setCookie('appearance', 'light');

        applyTheme('light');
    }, []);

    useEffect(() => {
        // Always use light mode regardless of saved preference
        updateAppearance('light');
    }, [updateAppearance]);

    return { appearance, updateAppearance } as const;
}
