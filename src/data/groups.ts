import { Group } from '../types';

export const DEFAULT_GROUPS: Partial<Group>[] = [
  {
    title: 'WhatsApp Tips & Tricks',
    link: 'https://chat.whatsapp.com/example1',
    category: 'Tips',
    country: 'Global',
    description: 'A group for sharing the latest WhatsApp tips and tricks.',
    status: 'approved',
    createdAt: new Date().toISOString(),
    type: 'group',
    authorUid: 'hworldplayz'
  },
  {
    title: 'Privacy Experts',
    link: 'https://chat.whatsapp.com/example2',
    category: 'Privacy',
    country: 'Global',
    description: 'Discuss privacy settings and how to stay safe on WhatsApp.',
    status: 'approved',
    createdAt: new Date().toISOString(),
    type: 'group',
    authorUid: 'hworldplayz'
  }
];
