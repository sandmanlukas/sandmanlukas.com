import Redis from 'ioredis';
import { env } from '$env/dynamic/private';

let redis: Redis | null = null;

export function getRedis(): Redis {
	if (!redis) {
		redis = new Redis(env.REDIS_URL!);
	}
	return redis;
}
