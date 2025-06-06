
import { useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    pomodoroTime: number;
    breakTime: number;
  };
}

const defaultProfile: UserProfile = {
  name: 'Usuário',
  email: 'usuario@exemplo.com',
  preferences: {
    theme: 'light',
    notifications: true,
    pomodoroTime: 25,
    breakTime: 5,
  }
};

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  const updatePreferences = (preferences: Partial<UserProfile['preferences']>) => {
    const newProfile = {
      ...profile,
      preferences: { ...profile.preferences, ...preferences }
    };
    setProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  return {
    profile,
    updateProfile,
    updatePreferences
  };
};
