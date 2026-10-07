import { describe, expect, it } from 'vitest';
import { getDefaultPrefixes, hasTalentTransform, stripEmoteDelimiters, toSlackName } from './index';
import { sanitizeSlug, splitCamelCaseWords } from './shared';

// Emote names below are real entries from public/emotes/*.json.

describe('stripEmoteDelimiters', () => {
  it('removes the ": name:" wrapper the wiki uses', () => {
    expect(stripEmoteDelimiters(': CeCeLaugh:')).toBe('CeCeLaugh');
    expect(stripEmoteDelimiters(':grem:')).toBe('grem');
    expect(stripEmoteDelimiters('plain')).toBe('plain');
  });
});

describe('toSlackName with the default transform (no talent override)', () => {
  const talent = 'Ayunda Risu';

  it('lowercases and keeps alphanumerics', () => {
    expect(toSlackName(talent, ': Brr:')).toBe('brr');
    expect(toSlackName(talent, ': LightStick:')).toBe('lightstick');
    expect(toSlackName(talent, ': LetrUBrown:')).toBe('letrubrown');
  });

  it('turns runs of punctuation into one separator and trims the ends', () => {
    expect(toSlackName(talent, ': Hello  World!:')).toBe('hello-world');
    expect(toSlackName(talent, ': Hello  World!:', { separator: '_', prefixes: {} })).toBe('hello_world');
    expect(toSlackName(talent, ': Hello World:', { separator: '', prefixes: {} })).toBe('helloworld');
  });

  it('falls back to "emote" when nothing survives', () => {
    expect(toSlackName(talent, ': :')).toBe('emote');
    expect(toSlackName(talent, ': ***:')).toBe('emote');
  });
});

describe('Gigi Murin transform', () => {
  const talent = 'Gigi Murin';

  it('splits the gigi/popo/grem prefixes from the body', () => {
    expect(toSlackName(talent, ': gigiwave:')).toBe('gigi-wave');
    expect(toSlackName(talent, ': gigihappy:')).toBe('gigi-happy');
    expect(toSlackName(talent, ': popocheer:')).toBe('gigi-popo-cheer');
    expect(toSlackName(talent, ': popogg:')).toBe('gigi-popo-gg');
    expect(toSlackName(talent, ': gremfull:')).toBe('gigi-grem-full');
    expect(toSlackName(talent, ': gremwoa:')).toBe('gigi-grem-woa');
  });

  it('uses the exact-match table for names that are not prefix-shaped', () => {
    expect(toSlackName(talent, ': grem:')).toBe('gigi-grem');
    expect(toSlackName(talent, ': frewup:')).toBe('gigi-frew-up');
    expect(toSlackName(talent, ': stopfight:')).toBe('gigi-stop-fight');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': gigiwave:', { separator: '_', prefixes: {} })).toBe('gigi_wave');
    expect(toSlackName(talent, ': gigiwave:', { separator: '', prefixes: {} })).toBe('gigiwave');
    expect(toSlackName(talent, ': popocheer:', { separator: '-', prefixes: { [talent]: 'gg' } })).toBe('gg-popo-cheer');
    expect(toSlackName(talent, ': stopfight:', { separator: '_', prefixes: { [talent]: 'GG' } })).toBe('gg_stop_fight');
  });
});

describe('Cecilia Immergreen transform', () => {
  const talent = 'Cecilia Immergreen';

  it('replaces the CeCe prefix and splits camel case', () => {
    expect(toSlackName(talent, ': CeCeLaugh:')).toBe('cece-laugh');
    expect(toSlackName(talent, ': CeCeLetHerCook:')).toBe('cece-let-her-cook');
    expect(toSlackName(talent, ': CeCeOtoStare:')).toBe('cece-oto-stare');
  });

  it('keeps digits and acronyms attached', () => {
    expect(toSlackName(talent, ': CeCeHeart2:')).toBe('cece-heart2');
    expect(toSlackName(talent, ': CeCeSPIN:')).toBe('cece-spin');
    expect(toSlackName(talent, ': CeCeSpiin:')).toBe('cece-spiin');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': CeCeLetHerCook:', { separator: '_', prefixes: {} })).toBe('cece_let_her_cook');
    expect(toSlackName(talent, ': CeCeLaugh:', { separator: '-', prefixes: { [talent]: 'cc' } })).toBe('cc-laugh');
    expect(toSlackName(talent, ': CeCeLaugh:', { separator: '', prefixes: {} })).toBe('cecelaugh');
  });
});

describe('Raora Panthera transform', () => {
  const talent = 'Raora Panthera';

  it('prefixes every emote with rao and lowercases', () => {
    expect(toSlackName(talent, ': bonk:')).toBe('rao-bonk');
    expect(toSlackName(talent, ': LOL:')).toBe('rao-lol');
    expect(toSlackName(talent, ': 4090eyes:')).toBe('rao-4090eyes');
    expect(toSlackName(talent, ': LETHERCOOK:')).toBe('rao-lethercook');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': bonk:', { separator: '_', prefixes: {} })).toBe('rao_bonk');
    expect(toSlackName(talent, ': bonk:', { separator: '', prefixes: {} })).toBe('raobonk');
    expect(toSlackName(talent, ': bonk:', { separator: '-', prefixes: { [talent]: 'raora' } })).toBe('raora-bonk');
  });
});

describe('registry helpers', () => {
  it('reports which talents have a transform', () => {
    expect(hasTalentTransform('Gigi Murin')).toBe(true);
    expect(hasTalentTransform('Ayunda Risu')).toBe(false);
  });

  it('returns default prefixes only for registered talents', () => {
    expect(getDefaultPrefixes(['Gigi Murin', 'Cecilia Immergreen', 'Raora Panthera', 'Ayunda Risu'])).toEqual({
      'Gigi Murin': 'gigi',
      'Cecilia Immergreen': 'cece',
      'Raora Panthera': 'rao',
    });
  });
});

describe('shared helpers', () => {
  it('splitCamelCaseWords handles acronyms followed by a word', () => {
    expect(splitCamelCaseWords('OtoStare', '-')).toBe('Oto-Stare');
    expect(splitCamelCaseWords('SPINFast', '-')).toBe('SPIN-Fast');
    expect(splitCamelCaseWords('SPIN', '-')).toBe('SPIN');
  });

  it('sanitizeSlug keeps only alphanumerics and the literal separator', () => {
    expect(sanitizeSlug('Gigi--Wave!', '-')).toBe('gigi-wave');
    expect(sanitizeSlug('a__b', '__')).toBe('a__b');
    expect(sanitizeSlug('!!!', '-')).toBe('emote');
    expect(sanitizeSlug('A B', '')).toBe('ab');
  });
});
