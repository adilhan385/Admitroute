export interface WorldUniversity {
  name: string;
  country: string;
  countryCode: string;
  stateProvince: string;
  domain: string;
  website: string;
}

let directoryPromise: Promise<WorldUniversity[]> | null = null;

export function loadWorldUniversities(): Promise<WorldUniversity[]> {
  if (!directoryPromise) {
    directoryPromise = fetch('/world-universities.json')
      .then(response => {
        if (!response.ok) throw new Error(`Справочник вузов недоступен: HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Некорректный формат справочника вузов');
        return data as WorldUniversity[];
      })
      .catch(error => {
        directoryPromise = null;
        throw error;
      });
  }
  return directoryPromise;
}

const normalize = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();

export function searchWorldUniversities(directory: WorldUniversity[], query: string, limit = 5): WorldUniversity[] {
  const term = normalize(query);
  if (term.length < 2) return [];

  const matches: Array<{ university: WorldUniversity; score: number }> = [];
  for (const university of directory) {
    const name = normalize(university.name);
    const domain = normalize(university.domain);
    const country = normalize(university.country);
    let score = 0;
    if (name === term || domain === term) score = 4;
    else if (name.startsWith(term) || domain.startsWith(term)) score = 3;
    else if (name.includes(term) || domain.includes(term)) score = 2;
    else if (country === term) score = 1;
    if (score) matches.push({ university, score });
  }
  matches.sort((a, b) => b.score - a.score || a.university.name.localeCompare(b.university.name));
  return matches.slice(0, limit).map(item => item.university);
}

export function findExactWorldUniversity(directory: WorldUniversity[], query: string): WorldUniversity | undefined {
  const term = normalize(query);
  return directory.find(university => normalize(university.name) === term || normalize(university.domain) === term);
}
