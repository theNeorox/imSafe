/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenType = 'home' | 'contacts' | 'timer' | 'history' | 'settings' | 'numbers' | 'permissions' | 'twilio';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkInInterval: number; // in hours (1, 6, 12, 24)
  lastCheckIn: string; // ISO String
  nextCheckIn: string; // ISO String
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface EmergencyNumbers {
  police: string;
  samu: string;
  firefighters: string;
}

export interface CheckInLog {
  id: string;
  timestamp: string;
  status: 'alive' | 'missed' | 'alert_sent' | 'not_well' | 'danger' | 'cancelled';
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  notes?: string;
}

export interface SystemState {
  currentUser: User | null;
  contacts: EmergencyContact[];
  history: CheckInLog[];
  missedCheckInsCount: number; // Max 3 before alert
  remindersSent: number; // 0, 1, 2, 3
  isTimerRunning: boolean;
  timeLeft: number; // in seconds
  alertStatus: 'normal' | 'warning' | 'alerted';
  simulatedNotification: {
    visible: boolean;
    title: string;
    body: string;
    type: 'checkin' | 'reminder' | 'alert';
  } | null;
}
