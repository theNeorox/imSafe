/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, EmergencyContact, CheckInLog, EmergencyNumbers, TwilioConfig, EmailConfig } from '../types';

const USER_KEY = 'imsafe_user';
const CONTACTS_KEY = 'imsafe_contacts';
const HISTORY_KEY = 'imsafe_history';
const NUMBERS_KEY = 'imsafe_numbers';
const TWILIO_KEY = 'imsafe_twilio';
const EMAIL_KEY = 'imsafe_email';

const DEFAULT_TWILIO_CONFIG: TwilioConfig = {
  accountSid: '',
  authToken: '',
  fromNumber: '',
};

const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  fromEmail: '',
};

const DEFAULT_USER: User = {
  id: 'usr_1',
  name: 'Ana Silva',
  email: 'ana.silva@email.com',
  phone: '(11) 98765-4321',
  checkInInterval: 6, // 6 hours
  lastCheckIn: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  nextCheckIn: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // in 2 hours
};

const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'c_1',
    name: 'Carlos Silva',
    phone: '(11) 99999-1111',
    email: 'carlos.silva@email.com',
    relationship: 'Filho',
  },
  {
    id: 'c_2',
    name: 'Mariana Costa',
    phone: '(11) 98888-2222',
    email: 'mariana.costa@email.com',
    relationship: 'Vizinha de Confiança',
  }
];

const DEFAULT_NUMBERS: EmergencyNumbers = {
  police: '190',
  samu: '192',
  firefighters: '193'
};

const DEFAULT_HISTORY: CheckInLog[] = [
  {
    id: 'h_1',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'alive',
    location: {
      latitude: -23.55052,
      longitude: -46.633308,
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    },
    notes: 'Check-in manual realizado com sucesso',
  },
  {
    id: 'h_2',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    status: 'alive',
    location: {
      latitude: -23.55052,
      longitude: -46.633308,
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    },
    notes: 'Check-in regular - Respondeu "Estou bem"',
  },
  {
    id: 'h_3',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'alive',
    location: {
      latitude: -23.55100,
      longitude: -46.63400,
      address: 'Av. Paulista, 1100 - Bela Vista, São Paulo - SP',
    },
    notes: 'Check-in regular - Respondeu pelo celular',
  }
];

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) {
    // Seed default user
    localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  }
  return JSON.parse(data);
}

export function saveStoredUser(user: User | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getStoredContacts(): EmergencyContact[] {
  const data = localStorage.getItem(CONTACTS_KEY);
  if (!data) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(DEFAULT_CONTACTS));
    return DEFAULT_CONTACTS;
  }
  return JSON.parse(data);
}

export function saveStoredContacts(contacts: EmergencyContact[]): void {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

export function getStoredHistory(): CheckInLog[] {
  const data = localStorage.getItem(HISTORY_KEY);
  if (!data) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(DEFAULT_HISTORY));
    return DEFAULT_HISTORY;
  }
  return JSON.parse(data);
}

export function saveStoredHistory(history: CheckInLog[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getStoredNumbers(): EmergencyNumbers {
  const data = localStorage.getItem(NUMBERS_KEY);
  if (!data) {
    localStorage.setItem(NUMBERS_KEY, JSON.stringify(DEFAULT_NUMBERS));
    return DEFAULT_NUMBERS;
  }
  return JSON.parse(data);
}

export function saveStoredNumbers(numbers: EmergencyNumbers): void {
  localStorage.setItem(NUMBERS_KEY, JSON.stringify(numbers));
}

export function getStoredTwilioConfig(): TwilioConfig {
  const data = localStorage.getItem(TWILIO_KEY);
  if (!data) {
    localStorage.setItem(TWILIO_KEY, JSON.stringify(DEFAULT_TWILIO_CONFIG));
    return DEFAULT_TWILIO_CONFIG;
  }
  return JSON.parse(data);
}

export function saveStoredTwilioConfig(config: TwilioConfig): void {
  localStorage.setItem(TWILIO_KEY, JSON.stringify(config));
}

export function getStoredEmailConfig(): EmailConfig {
  const data = localStorage.getItem(EMAIL_KEY);
  if (!data) {
    localStorage.setItem(EMAIL_KEY, JSON.stringify(DEFAULT_EMAIL_CONFIG));
    return DEFAULT_EMAIL_CONFIG;
  }
  return JSON.parse(data);
}

export function saveStoredEmailConfig(config: EmailConfig): void {
  localStorage.setItem(EMAIL_KEY, JSON.stringify(config));
}

export function clearAllStorage(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CONTACTS_KEY);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(NUMBERS_KEY);
  localStorage.removeItem(TWILIO_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
