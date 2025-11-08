import { allowedImageDomains as compiledAllowedImageDomains } from './allowedDomains.js';

export const allowedImageDomains = compiledAllowedImageDomains as (string | RegExp)[];
