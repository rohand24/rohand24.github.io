import fs from 'node:fs';

const configPath = new URL('../../site.config.json', import.meta.url);
const rawConfig = fs.readFileSync(configPath, 'utf-8');

export const siteConfig = JSON.parse(rawConfig);
