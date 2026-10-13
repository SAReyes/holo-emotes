import { describe, expect, it } from 'vitest';
import { generationLabel } from './generation-label';

describe('generationLabel', () => {
  it.each([
    ['Hololive English', 'Hololive English -Myth-', 'Myth'],
    ['Hololive English', 'Hololive English -Promise-', 'Promise'],
    ['Hololive (Japan)', 'Hololive 0th Generation', '0th Generation'],
    ['Hololive (Japan)', 'Hololive Gamers', 'Gamers'],
    ['Hololive DEV_IS', 'Hololive DEV_IS ReGLOSS', 'ReGLOSS'],
    ['Hololive DEV_IS', 'Hololive DEV_IS FLOW GLOW', 'FLOW GLOW'],
    ['Hololive Indonesia', 'Hololive Indonesia 1st Generation', '1st Generation'],
    ['Holostars English', 'HOLOSTARS English TEMPUS', 'TEMPUS'],
  ])('%s / %s -> %s', (branch, generation, expected) => {
    expect(generationLabel(branch, generation)).toBe(expected);
  });

  it('keeps a name that does not start with the branch', () => {
    expect(generationLabel('Hololive English', 'Council')).toBe('Council');
  });

  it('keeps a name that is only the branch', () => {
    expect(generationLabel('Hololive English', 'Hololive English')).toBe('Hololive English');
  });
});
