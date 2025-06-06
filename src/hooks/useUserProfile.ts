
import { useState, useEffect } from 'react';
import { validateEmail, validateURL, sanitizeText, VALIDATION_PATTERNS, validateInput } from '@/utils/security';
import { useSecureLocalStorage } from './useSecureLocalStorage';

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
  const [profile, setProfile, clearProfile] = useSecureLocalStorage<UserProfile>('userProfile', defaultProfile);

  const validateProfileData = (updates: Partial<UserProfile>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (updates.name !== undefined) {
      const sanitizedName = sanitizeText(updates.name);
      if (!validateInput(sanitizedName, VALIDATION_PATTERNS.name)) {
        errors.push('Nome deve conter apenas letras e espaços (máximo 50 caracteres)');
      }
    }

    if (updates.email !== undefined) {
      if (!validateEmail(updates.email)) {
        errors.push('Email deve ter um formato válido');
      }
    }

    if (updates.avatar !== undefined && updates.avatar) {
      if (!validateURL(updates.avatar)) {
        errors.push('URL do avatar deve ser uma URL válida (https:// ou http://)');
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const updateProfile = (updates: Partial<UserProfile>): boolean => {
    const validation = validateProfileData(updates);
    
    if (!validation.isValid) {
      console.warn('Dados do perfil inválidos:', validation.errors);
      return false;
    }

    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.name) {
      sanitizedUpdates.name = sanitizeText(sanitizedUpdates.name);
    }

    const newProfile = { ...profile, ...sanitizedUpdates };
    setProfile(newProfile);
    return true;
  };

  const updatePreferences = (preferences: Partial<UserProfile['preferences']>): boolean => {
    // Validate pomodoro times
    if (preferences.pomodoroTime !== undefined) {
      if (preferences.pomodoroTime < 1 || preferences.pomodoroTime > 60) {
        console.warn('Tempo de pomodoro deve estar entre 1 e 60 minutos');
        return false;
      }
    }

    if (preferences.breakTime !== undefined) {
      if (preferences.breakTime < 1 || preferences.breakTime > 30) {
        console.warn('Tempo de pausa deve estar entre 1 e 30 minutos');
        return false;
      }
    }

    const newProfile = {
      ...profile,
      preferences: { ...profile.preferences, ...preferences }
    };
    setProfile(newProfile);
    return true;
  };

  return {
    profile,
    updateProfile,
    updatePreferences,
    clearProfile
  };
};
