import fs from 'node:fs/promises';

const bibPath = new URL('../../publications.bib', import.meta.url);

const normalizeWhitespace = (value) => value.replace(/\s+/g, ' ').trim();

const stripWrapping = (value) => {
  let cleaned = value.trim();
  cleaned = cleaned.replace(/#\s*/g, ' ');
  cleaned = cleaned.replace(/\\&/g, '&');
  while (
    (cleaned.startsWith('{') && cleaned.endsWith('}')) ||
    (cleaned.startsWith('"') && cleaned.endsWith('"'))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return normalizeWhitespace(cleaned);
};

const splitTopLevel = (input) => {
  const parts = [];
  let current = '';
  let depth = 0;
  let inQuote = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const prev = input[i - 1];
    if (char === '"' && prev !== '\\') {
      inQuote = !inQuote;
    }

    if (!inQuote) {
      if (char === '{') depth += 1;
      if (char === '}') depth = Math.max(0, depth - 1);
    }

    if (char === ',' && depth === 0 && !inQuote) {
      if (current.trim()) {
        parts.push(current.trim());
      }
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
};

const parseEntryFields = (fieldsText) => {
  const fields = {};
  const parts = splitTopLevel(fieldsText);

  for (const part of parts) {
    const splitIndex = part.indexOf('=');
    if (splitIndex === -1) continue;
    const key = part.slice(0, splitIndex).trim().toLowerCase();
    const value = stripWrapping(part.slice(splitIndex + 1));
    if (!value) continue;
    fields[key] = value;
  }

  return fields;
};

const parseEntries = (bibtex) => {
  const entries = [];
  let cursor = 0;

  while (cursor < bibtex.length) {
    const atIndex = bibtex.indexOf('@', cursor);
    if (atIndex === -1) break;
    const braceIndex = bibtex.indexOf('{', atIndex);
    if (braceIndex === -1) break;

    let depth = 1;
    let endIndex = braceIndex + 1;
    while (endIndex < bibtex.length && depth > 0) {
      const char = bibtex[endIndex];
      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;
      endIndex += 1;
    }

    const rawEntry = bibtex.slice(atIndex + 1, endIndex - 1).trim();
    entries.push(rawEntry);
    cursor = endIndex;
  }

  return entries;
};

export const loadPublications = async () => {
  const bibtex = await fs.readFile(bibPath, 'utf-8');
  const parsed = parseEntries(bibtex).map((entry) => {
    const braceIndex = entry.indexOf('{');
    const type = entry.slice(0, braceIndex).trim().toLowerCase();
    const rest = entry.slice(braceIndex + 1);
    const commaIndex = rest.indexOf(',');
    const key = rest.slice(0, commaIndex).trim();
    const fields = parseEntryFields(rest.slice(commaIndex + 1));

    const year = fields.year ? Number.parseInt(fields.year, 10) : 0;
    const venue =
      fields.journal ||
      fields.booktitle ||
      fields.school ||
      fields.organization ||
      fields.publisher ||
      fields.note ||
      '';

    return {
      key,
      type,
      title: fields.title || 'Untitled',
      author: fields.author || '',
      year,
      venue: normalizeWhitespace(venue),
      raw: fields,
    };
  });

  return parsed
    .filter((entry) => entry.title)
    .sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
};
