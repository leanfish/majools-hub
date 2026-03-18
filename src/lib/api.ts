import { mockUser, mockProposals, mockActivity, createDefaultSections, type Proposal, type User } from './mock-data';

// In-memory store (resets on refresh)
let proposals = [...mockProposals];
let nextId = 6;

function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getToken(): string | null {
  return localStorage.getItem('majools_token');
}

function requireAuth(): void {
  if (!getToken()) {
    window.location.href = '/login';
    throw new Error('Not authenticated');
  }
}

// Auth
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  await delay(500);
  if (email && password) {
    const token = 'mock-jwt-' + Date.now();
    return { token, user: mockUser };
  }
  throw new Error('Invalid credentials');
}

export async function register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  await delay(500);
  if (name && email && password) {
    const token = 'mock-jwt-' + Date.now();
    return { token, user: { ...mockUser, name, email } };
  }
  throw new Error('Registration failed');
}

export function getCurrentUser(): User {
  return mockUser;
}

export function logout(): void {
  localStorage.removeItem('majools_token');
  window.location.href = '/login';
}

// Proposals — filter out soft-deleted
export async function getProposals(): Promise<Proposal[]> {
  requireAuth();
  await delay();
  return proposals.filter(p => !p.isDeleted);
}

export async function getProposal(id: string): Promise<Proposal> {
  requireAuth();
  await delay();
  const p = proposals.find(p => p.id === id && !p.isDeleted);
  if (!p) throw new Error('Proposal not found');
  return { ...p, sections: p.sections.map(s => ({ ...s })) };
}

export async function createProposal(data: Partial<Proposal>): Promise<Proposal> {
  requireAuth();
  await delay();
  const id = `prop-${nextId++}`;
  const now = new Date().toISOString();
  const proposal: Proposal = {
    id,
    title: data.title || 'Untitled Proposal',
    client: data.client || '',
    clientEmail: data.clientEmail || '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    value: data.value || 0,
    sections: data.sections || createDefaultSections(),
  };
  proposals.unshift(proposal);
  return proposal;
}

export async function updateProposal(id: string, data: Partial<Proposal>): Promise<Proposal> {
  requireAuth();
  await delay();
  const idx = proposals.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Proposal not found');
  proposals[idx] = { ...proposals[idx], ...data, updatedAt: new Date().toISOString() };
  return proposals[idx];
}

// Soft delete
export async function deleteProposal(id: string): Promise<void> {
  requireAuth();
  await delay();
  const idx = proposals.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Proposal not found');
  proposals[idx] = {
    ...proposals[idx],
    isDeleted: true,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function sendProposal(id: string, accessType: 'link' | 'password', password?: string): Promise<{ link: string; token: string }> {
  requireAuth();
  await delay(500);
  const idx = proposals.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Proposal not found');
  const publicToken = `tk-${id}-${Date.now()}`;
  proposals[idx] = {
    ...proposals[idx],
    status: 'sent',
    publicToken,
    accessType,
    password: accessType === 'password' ? password : undefined,
    updatedAt: new Date().toISOString(),
  };
  return { link: `${window.location.origin}/p/${publicToken}`, token: publicToken };
}

// Public (no auth)
export async function getPublicProposal(token: string): Promise<Proposal & { requiresPassword: boolean }> {
  await delay();
  const p = proposals.find(p => p.publicToken === token);
  if (!p) throw new Error('Proposal not found');
  return { ...p, requiresPassword: p.accessType === 'password' };
}

export async function respondToProposal(token: string, action: 'accept' | 'decline', message?: string): Promise<void> {
  await delay(500);
  const idx = proposals.findIndex(p => p.publicToken === token);
  if (idx === -1) throw new Error('Proposal not found');
  proposals[idx] = { ...proposals[idx], status: action === 'accept' ? 'accepted' : 'declined', updatedAt: new Date().toISOString() };
}

// Activity
export async function getActivity() {
  requireAuth();
  await delay();
  return mockActivity;
}
