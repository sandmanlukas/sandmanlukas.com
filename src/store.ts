import { writable } from 'svelte/store';
import type { Activity, Athlete, UserStats } from './types';

export const userData = writable<Athlete | null>(null);
export const userStats = writable<UserStats | null>(null);
export const userActivities = writable<Activity[]>([]);