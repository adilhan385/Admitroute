import { describe, expect, it } from 'vitest';
import { findExactWorldUniversity, searchWorldUniversities } from './worldUniversityDirectory';
import type { WorldUniversity } from './worldUniversityDirectory';

const directory: WorldUniversity[] = [
  { name: 'University of Oxford', country: 'United Kingdom', countryCode: 'GB', stateProvince: '', domain: 'ox.ac.uk', website: 'https://www.ox.ac.uk' },
  { name: 'Oxford Brookes University', country: 'United Kingdom', countryCode: 'GB', stateProvince: '', domain: 'brookes.ac.uk', website: 'https://www.brookes.ac.uk' },
  { name: 'Massachusetts Institute of Technology', country: 'United States', countryCode: 'US', stateProvince: '', domain: 'mit.edu', website: 'https://www.mit.edu' }
];

describe('world university directory', () => {
  it('finds names and domains without case sensitivity', () => {
    expect(searchWorldUniversities(directory, 'OXFORD')).toHaveLength(2);
    expect(findExactWorldUniversity(directory, 'MIT.EDU')?.name).toBe('Massachusetts Institute of Technology');
  });

  it('requires a meaningful query and ranks name prefixes first', () => {
    expect(searchWorldUniversities(directory, 'o')).toEqual([]);
    expect(searchWorldUniversities(directory, 'oxford')[0].name).toBe('Oxford Brookes University');
  });
});
