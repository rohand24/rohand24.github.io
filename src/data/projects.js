import fs from 'node:fs/promises';

const projectsPath = new URL('../../projects.json', import.meta.url);

export const loadProjects = async () => {
  const raw = await fs.readFile(projectsPath, 'utf-8');
  return JSON.parse(raw);
};
