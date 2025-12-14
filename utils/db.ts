import { CaseData } from '../types';

const DB_KEY = 'family_court_case_data';

export const db = {
  saveCase: (data: CaseData) => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save case data', e);
    }
  },

  loadCase: (): CaseData | null => {
    try {
      const stored = localStorage.getItem(DB_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to load case data', e);
      return null;
    }
  },

  clearCase: () => {
    localStorage.removeItem(DB_KEY);
  }
};
