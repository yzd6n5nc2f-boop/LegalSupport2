export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  isFinal?: boolean;
}

export interface AudioConfig {
  sampleRate: number;
}

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

export interface CaseData {
  applicantName?: string;
  children?: string[]; // Names of children
  formType?: 'C100' | 'Form E' | 'Unknown';
  currentStatus?: string; // e.g., "Gathering personal details"
  financials?: {
    income?: string;
    assets?: string;
    debts?: string;
  };
  contactRequirements?: string;
  safetyConcerns?: boolean;
}

export interface Solicitor {
  id: 'sarah' | 'james';
  name: string;
  gender: 'female' | 'male';
  voiceName: string;
  imageUrl: string;
  description: string;
}
