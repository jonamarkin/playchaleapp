import { isMockBackend } from './api';
import type { BackendClient } from './backendTypes';
import { httpBackend } from './httpBackend';
import { mockBackend } from './mockBackend';

// This is the seam the frontend should depend on. The mock implementation keeps
// the full app usable today; a real HTTP implementation can replace it here
// once the backend service contract is ready.
export type { BackendClient };

export const backendMode = isMockBackend() ? 'mock' : 'http';

export const backend: BackendClient = backendMode === 'mock' ? mockBackend : httpBackend;
