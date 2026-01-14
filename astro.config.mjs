// @ts-check
import fs from 'node:fs';
import { defineConfig } from 'astro/config';

const configPath = new URL('./site.config.json', import.meta.url);
const siteConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const owner = process.env.GITHUB_REPOSITORY?.split('/')[0];
const isUserSite = repo && owner && repo === `${owner}.github.io`;
// Base defaults to "/<repo>/" for project pages; override with BASE_PATH when needed.
const base =
  process.env.BASE_PATH ?? (repo && !isUserSite ? `/${repo}/` : '/');

const baseUrl = siteConfig.site?.baseUrl ?? 'https://example.com';
const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
const normalizedBase = base === '/' ? '' : base.replace(/\/$/, '');

// https://astro.build/config
export default defineConfig({
  site: `${normalizedBaseUrl}${normalizedBase}`,
  base,
});
