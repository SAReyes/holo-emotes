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

describe('Elizabeth Rose Bloodflame transform', () => {
  const talent = 'Elizabeth Rose Bloodflame';

  it('prefixes bare words with liz so they do not collide with other talents', () => {
    expect(toSlackName(talent, ': heart:')).toBe('liz-heart');
    expect(toSlackName(talent, ': Wha:')).toBe('liz-wha');
    expect(toSlackName(talent, ': hydrate:')).toBe('liz-hydrate');
  });

  it('splits compound words the wiki writes as one token', () => {
    expect(toSlackName(talent, ': bluestick:')).toBe('liz-blue-stick');
    expect(toSlackName(talent, ': vewynoice:')).toBe('liz-vewy-noice');
    expect(toSlackName(talent, ': dingdong:')).toBe('liz-ding-dong');
    expect(toSlackName(talent, ': warcry:')).toBe('liz-war-cry');
    expect(toSlackName(talent, ': eyel:')).toBe('liz-eye-left');
    expect(toSlackName(talent, ': eyer:')).toBe('liz-eye-right');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': redstick:', { separator: '_', prefixes: {} })).toBe('liz_red_stick');
    expect(toSlackName(talent, ': redstick:', { separator: '', prefixes: {} })).toBe('lizredstick');
    expect(toSlackName(talent, ': heart:', { separator: '-', prefixes: { [talent]: 'erb' } })).toBe('erb-heart');
  });
});

describe('Shiori Novella transform', () => {
  const talent = 'Shiori Novella';

  it('drops the shiori prefix, splits camel case, and re-prefixes', () => {
    expect(toSlackName(talent, ': shioriComfy:')).toBe('shiori-comfy');
    expect(toSlackName(talent, ': shioriDeskSlam:')).toBe('shiori-desk-slam');
    expect(toSlackName(talent, ': shioriThereThere:')).toBe('shiori-there-there');
    expect(toSlackName(talent, ': shioriWelcome1:')).toBe('shiori-welcome1');
  });

  it('splits lowercase compounds and keeps real words whole', () => {
    expect(toSlackName(talent, ': shioriNovelbonk:')).toBe('shiori-novel-bonk');
    expect(toSlackName(talent, ': shioriGiftlove:')).toBe('shiori-gift-love');
    expect(toSlackName(talent, ': shioriHeadpat:')).toBe('shiori-headpat');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': shioriDeskSlam:', { separator: '_', prefixes: {} })).toBe('shiori_desk_slam');
    expect(toSlackName(talent, ': shioriComfy:', { separator: '-', prefixes: { [talent]: 'shio' } })).toBe('shio-comfy');
  });
});

describe('Koseki Bijou transform', () => {
  const talent = 'Koseki Bijou';

  it('drops the bijou prefix and lowercases shouted words', () => {
    expect(toSlackName(talent, ': bijouBoom:')).toBe('bijou-boom');
    expect(toSlackName(talent, ': bijouOOO:')).toBe('bijou-ooo');
    expect(toSlackName(talent, ': bijouMILK:')).toBe('bijou-milk');
    expect(toSlackName(talent, ': bijoucat:')).toBe('bijou-cat');
  });

  it('treats pebble as a sub-prefix and splits swirlyeyes', () => {
    expect(toSlackName(talent, ': bijouPebblecry:')).toBe('bijou-pebble-cry');
    expect(toSlackName(talent, ': bijouPebbleAAA:')).toBe('bijou-pebble-aaa');
    expect(toSlackName(talent, ': bijouSwirlyeyes:')).toBe('bijou-swirly-eyes');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': bijouPebblecry:', { separator: '_', prefixes: {} })).toBe('bijou_pebble_cry');
    expect(toSlackName(talent, ': bijouBoom:', { separator: '-', prefixes: { [talent]: 'biboo' } })).toBe('biboo-boom');
  });
});

describe('Nerissa Ravencroft transform', () => {
  const talent = 'Nerissa Ravencroft';

  it('normalises the mixed naming styles under one rissa prefix', () => {
    expect(toSlackName(talent, ': KiraKira:')).toBe('rissa-kira-kira');
    expect(toSlackName(talent, ': RissaLove:')).toBe('rissa-love');
    expect(toSlackName(talent, ': HWA:')).toBe('rissa-hwa');
    expect(toSlackName(talent, ': bonk:')).toBe('rissa-bonk');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': KiraKira:', { separator: '_', prefixes: {} })).toBe('rissa_kira_kira');
    expect(toSlackName(talent, ': RissaLove:', { separator: '-', prefixes: { [talent]: 'nerissa' } })).toBe('nerissa-love');
  });
});

describe('Fuwawa & Mococo Abyssgard transform', () => {
  const talent = 'Fuwawa & Mococo Abyssgard';

  it('keeps the twin as prefix for FUWA/MOCO-led emotes', () => {
    expect(toSlackName(talent, ': FUWAyes:')).toBe('fuwa-yes');
    expect(toSlackName(talent, ': MOCOhuh:')).toBe('moco-huh');
    expect(toSlackName(talent, ': FUWAMOCO:')).toBe('fuwamoco');
  });

  it('gives shared emotes the duo prefix', () => {
    expect(toSlackName(talent, ': BAU:')).toBe('fwmc-bau');
    expect(toSlackName(talent, ': mochidonut:')).toBe('fwmc-mochidonut');
    expect(toSlackName(talent, ': emojiF:')).toBe('fwmc-emoji-f');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': emojiF:', { separator: '_', prefixes: {} })).toBe('fwmc_emoji_f');
    expect(toSlackName(talent, ': FUWAyes:', { separator: '', prefixes: {} })).toBe('fuwayes');
    expect(toSlackName(talent, ': BAU:', { separator: '-', prefixes: { [talent]: 'fuwamoco' } })).toBe('fuwamoco-bau');
  });
});

describe('registry helpers', () => {
  it('reports which talents have a transform', () => {
    expect(hasTalentTransform('Gigi Murin')).toBe(true);
    expect(hasTalentTransform('Ayunda Risu')).toBe(false);
  });

  it('returns default prefixes only for registered talents', () => {
    expect(
      getDefaultPrefixes(['Gigi Murin', 'Cecilia Immergreen', 'Raora Panthera', 'Elizabeth Rose Bloodflame', 'Ayunda Risu']),
    ).toEqual({
      'Gigi Murin': 'gigi',
      'Cecilia Immergreen': 'cece',
      'Raora Panthera': 'rao',
      'Elizabeth Rose Bloodflame': 'liz',
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
