import { writable } from 'svelte/store';
import type { Activity } from './types';

export const userData = writable(null);
export const userStats = writable(null);
export const userActivities = writable<Activity[]>([]);