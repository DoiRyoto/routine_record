'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    if (localStorage.theme === 'light') {
      setThemeState('light');
    } else if (localStorage.theme === 'dark') {
      setThemeState('dark');
    } else {
      setThemeState('system');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    if (newTheme === 'light') {
      // Whenever the user explicitly chooses light mode
      localStorage.theme = 'light';
    } else if (newTheme === 'dark') {
      // Whenever the user explicitly chooses dark mode
      localStorage.theme = 'dark';
    } else {
      // Whenever the user explicitly chooses to respect the OS preference
      localStorage.removeItem('theme');
    }

    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    document.documentElement.classList.toggle(
      'dark',
      localStorage.theme === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  };

  return {
    theme,
    setTheme,
  };
}
