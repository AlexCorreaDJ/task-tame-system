
import { useState, useEffect } from 'react';
import { encryptData, decryptData } from '@/utils/security';

export function useSecureLocalStorage<T>(key: string, initialValue: T, ttl?: number) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsedItem = JSON.parse(item);
      
      // Check TTL if provided
      if (ttl && parsedItem.timestamp) {
        const isExpired = Date.now() - parsedItem.timestamp > ttl;
        if (isExpired) {
          window.localStorage.removeItem(key);
          return initialValue;
        }
      }

      const decryptedData = decryptData(parsedItem.data || parsedItem);
      return decryptedData ? JSON.parse(decryptedData) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      const dataToEncrypt = JSON.stringify(valueToStore);
      const encryptedData = encryptData(dataToEncrypt);
      
      const itemToStore = ttl 
        ? { data: encryptedData, timestamp: Date.now() }
        : encryptedData;
      
      window.localStorage.setItem(key, JSON.stringify(itemToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  const clearValue = () => {
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  };

  return [storedValue, setValue, clearValue] as const;
}
