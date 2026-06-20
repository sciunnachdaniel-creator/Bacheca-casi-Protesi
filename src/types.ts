/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UrgencyLevel = 'routine' | 'rush' | 'urgent';

export interface AppUser {
  id: string;
  name: string;
  role: 'dentist' | 'technician' | 'assistant' | 'coordinator';
  roleLabel: string;
  email: string;
  avatarColor: string; // Tailwind color class
}

export interface CaseComment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  timestamp: string;
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ProsthodonticCase {
  id: string;
  patientName: string;
  restorationSpecifics: string; // Unified text field replacing procedure, material, elements, shade, stunt shade
  dentistId: string;     // AppUser.id
  labName: string;       // Lab name string
  dueDate: string;       // YYYY-MM-DD
  urgency: UrgencyLevel;
  stage: string;         // Dynamic board column ID
  notes: string;         // Clinical notes
  labInstructions?: string;
  comments: CaseComment[];
  activities: ActivityLogItem[];
  createdAt: string;
}

export interface BoardColumn {
  id: string;            // Dynamic column ID
  title: string;
  color: string;         // accent color class
  description: string;
}

