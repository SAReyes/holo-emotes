import { describe, expect, it } from 'vitest';
import { getDefaultPrefixes, hasTalentTransform, stripEmoteDelimiters, toSlackName } from './index';
import { sanitizeSlug, splitCamelCaseWords } from './shared';

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

describe('Mori Calliope transform', () => {
  const talent = 'Mori Calliope';

  it('prefixes plain words and splits the lowercase compounds', () => {
    expect(toSlackName(talent, ': bonk:')).toBe('calli-bonk');
    expect(toSlackName(talent, ': nosalt:')).toBe('calli-no-salt');
    expect(toSlackName(talent, ': happymori:')).toBe('calli-happy');
    expect(toSlackName(talent, ': moriguh:')).toBe('calli-guh');
    expect(toSlackName(talent, ': calliopog:')).toBe('calli-pog');
    expect(toSlackName(talent, ': neuron1:')).toBe('calli-neuron1');
  });

  it('spells RIP across the three Rip emotes', () => {
    expect(toSlackName(talent, ': Ripr:')).toBe('calli-rip-r');
    expect(toSlackName(talent, ': RipI:')).toBe('calli-rip-i');
    expect(toSlackName(talent, ': RipP:')).toBe('calli-rip-p');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': hearteyes:', { separator: '_', prefixes: {} })).toBe('calli_heart_eyes');
    expect(toSlackName(talent, ': bonk:', { separator: '-', prefixes: { [talent]: 'mori' } })).toBe('mori-bonk');
  });
});

describe('Takanashi Kiara transform', () => {
  const talent = 'Takanashi Kiara';

  it('prefixes the short codes as they are', () => {
    expect(toSlackName(talent, ': mgn:')).toBe('kiara-mgn');
    expect(toSlackName(talent, ': YLS:')).toBe('kiara-yls');
    expect(toSlackName(talent, ': 1010:')).toBe('kiara-1010');
    expect(toSlackName(talent, ': bokbok:')).toBe('kiara-bokbok');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': mgn:', { separator: '', prefixes: {} })).toBe('kiaramgn');
    expect(toSlackName(talent, ': mgn:', { separator: '-', prefixes: { [talent]: 'tenchou' } })).toBe('tenchou-mgn');
  });
});

describe("Ninomae Ina'nis transform", () => {
  const talent = "Ninomae Ina'nis";

  it('lowercases shouted names without splitting digits or OxO', () => {
    expect(toSlackName(talent, ': DROOL:')).toBe('ina-drool');
    expect(toSlackName(talent, ': 10Q:')).toBe('ina-10q');
    expect(toSlackName(talent, ': OxO:')).toBe('ina-oxo');
    expect(toSlackName(talent, ': LOVE4EVER:')).toBe('ina-love4ever');
    expect(toSlackName(talent, ': INA:')).toBe('ina-ina');
  });

  it('splits the shouted compounds', () => {
    expect(toSlackName(talent, ': RIGHTGLOW:')).toBe('ina-right-glow');
    expect(toSlackName(talent, ': GONEXT:')).toBe('ina-go-next');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': LEFTGLOW:', { separator: '_', prefixes: {} })).toBe('ina_left_glow');
    expect(toSlackName(talent, ': DROOL:', { separator: '-', prefixes: { [talent]: 'inanis' } })).toBe('inanis-drool');
  });
});

describe('Gawr Gura transform', () => {
  const talent = 'Gawr Gura';

  it('drops the Gura / Gur self prefix and splits camel case', () => {
    expect(toSlackName(talent, ': GuraSmug:')).toBe('gura-smug');
    expect(toSlackName(talent, ': GuraHUH:')).toBe('gura-huh');
    expect(toSlackName(talent, ': gurapat:')).toBe('gura-pat');
    expect(toSlackName(talent, ': GurNya:')).toBe('gura-nya');
    expect(toSlackName(talent, ': GuDuh:')).toBe('gura-duh');
    expect(toSlackName(talent, ': EbiNANI:')).toBe('gura-ebi-nani');
    expect(toSlackName(talent, ': ThumbsUp:')).toBe('gura-thumbs-up');
    expect(toSlackName(talent, ': ChadGura:')).toBe('gura-chad-gura');
  });

  it('keeps guWAT distinct from GuraWat and expands L/R to left/right', () => {
    expect(toSlackName(talent, ': GuraWat:')).toBe('gura-wat');
    expect(toSlackName(talent, ': guWAT:')).toBe('gura-guwat');
    expect(toSlackName(talent, ': BloopYAYL:')).toBe('gura-bloop-yay-left');
    expect(toSlackName(talent, ': EyeR:')).toBe('gura-eye-right');
    expect(toSlackName(talent, ': RedOwO:')).toBe('gura-red-owo');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': BloopYAYL:', { separator: '_', prefixes: {} })).toBe('gura_bloop_yay_left');
    expect(toSlackName(talent, ': GuraSmug:', { separator: '-', prefixes: { [talent]: 'goob' } })).toBe('goob-smug');
  });
});

describe('Watson Amelia transform', () => {
  const talent = 'Watson Amelia';

  it('drops the ame prefix and splits camel case', () => {
    expect(toSlackName(talent, ': ameUhh:')).toBe('ame-uhh');
    expect(toSlackName(talent, ': ameGatorIdol:')).toBe('ame-gator-idol');
    expect(toSlackName(talent, ': ameHic1:')).toBe('ame-hic1');
    expect(toSlackName(talent, ': ame100:')).toBe('ame-100');
    expect(toSlackName(talent, ': ameTTT:')).toBe('ame-ttt');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ameGatorIdol:', { separator: '_', prefixes: {} })).toBe('ame_gator_idol');
    expect(toSlackName(talent, ': ameUhh:', { separator: '-', prefixes: { [talent]: 'watson' } })).toBe('watson-uhh');
  });
});

describe('IRyS transform', () => {
  const talent = 'IRyS';

  it('drops the irys prefix and splits camel case', () => {
    expect(toSlackName(talent, ': irysHirys:')).toBe('irys-hirys');
    expect(toSlackName(talent, ': irysEncore2:')).toBe('irys-encore2');
    expect(toSlackName(talent, ': irys116:')).toBe('irys-116');
    expect(toSlackName(talent, ': irysSocool:')).toBe('irys-so-cool');
  });

  it('expands the paired l/r emotes to left/right', () => {
    expect(toSlackName(talent, ': irysWingl:')).toBe('irys-wing-left');
    expect(toSlackName(talent, ': irysGloomr:')).toBe('irys-gloom-right');
    expect(toSlackName(talent, ': irysBloompat:')).toBe('irys-bloom-pat');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': irysWingl:', { separator: '_', prefixes: {} })).toBe('irys_wing_left');
    expect(toSlackName(talent, ': irysMad:', { separator: '-', prefixes: { [talent]: 'nephilim' } })).toBe('nephilim-mad');
  });
});

describe('Ceres Fauna transform', () => {
  const talent = 'Ceres Fauna';

  it('prefixes plain words and splits the lowercase compounds', () => {
    expect(toSlackName(talent, ': comfy:')).toBe('fauna-comfy');
    expect(toSlackName(talent, ': UUUU:')).toBe('fauna-uuuu');
    expect(toSlackName(talent, ': wide1:')).toBe('fauna-wide1');
    expect(toSlackName(talent, ': hugsnail:')).toBe('fauna-hug-snail');
    expect(toSlackName(talent, ': nemusmug:')).toBe('fauna-nemu-smug');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': greenlight:', { separator: '_', prefixes: {} })).toBe('fauna_green_light');
    expect(toSlackName(talent, ': comfy:', { separator: '-', prefixes: { [talent]: 'faufau' } })).toBe('faufau-comfy');
  });
});

describe('Ouro Kronii transform', () => {
  const talent = 'Ouro Kronii';

  it('drops the kro / kronii self prefix', () => {
    expect(toSlackName(talent, ': krogwak:')).toBe('kronii-gwak');
    expect(toSlackName(talent, ': kromegalol:')).toBe('kronii-mega-lol');
    expect(toSlackName(talent, ': kroniikoko:')).toBe('kronii-koko');
    expect(toSlackName(talent, ': kroniigws:')).toBe('kronii-gws');
  });

  it('keeps puns whole and treats kronie / boros as sub-prefixes', () => {
    expect(toSlackName(talent, ': kronichiwa:')).toBe('kronii-kronichiwa');
    expect(toSlackName(talent, ': kronfused:')).toBe('kronii-kronfused');
    expect(toSlackName(talent, ': yukkronii:')).toBe('kronii-yukkronii');
    expect(toSlackName(talent, ': kroniebonk:')).toBe('kronii-kronie-bonk');
    expect(toSlackName(talent, ': borospet:')).toBe('kronii-boros-pet');
  });

  it('splits the unprefixed phrases', () => {
    expect(toSlackName(talent, ': timetostop:')).toBe('kronii-time-to-stop');
    expect(toSlackName(talent, ': whatadeal:')).toBe('kronii-what-a-deal');
    expect(toSlackName(talent, ': gaslight:')).toBe('kronii-gaslight');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': kroniebonk:', { separator: '_', prefixes: {} })).toBe('kronii_kronie_bonk');
    expect(toSlackName(talent, ': krogwak:', { separator: '-', prefixes: { [talent]: 'kro' } })).toBe('kro-gwak');
  });
});

describe('Nanashi Mumei transform', () => {
  const talent = 'Nanashi Mumei';

  it('prefixes plain words, splits camel case and lowercase compounds', () => {
    expect(toSlackName(talent, ': processing:')).toBe('mumei-processing');
    expect(toSlackName(talent, ': colonD:')).toBe('mumei-colon-d');
    expect(toSlackName(talent, ': friendHap:')).toBe('mumei-friend-hap');
    expect(toSlackName(talent, ': thisisfine:')).toBe('mumei-this-is-fine');
    expect(toSlackName(talent, ': glowstickL:')).toBe('mumei-glowstick-left');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': thumbsup:', { separator: '_', prefixes: {} })).toBe('mumei_thumbs_up');
    expect(toSlackName(talent, ': happy:', { separator: '-', prefixes: { [talent]: 'moom' } })).toBe('moom-happy');
  });
});

describe('Hakos Baelz transform', () => {
  const talent = 'Hakos Baelz';

  it('lowercases shouted names and splits the multi-word ones', () => {
    expect(toSlackName(talent, ': RESPECC:')).toBe('bae-respecc');
    expect(toSlackName(talent, ': boom1:')).toBe('bae-boom1');
    expect(toSlackName(talent, ': bae:')).toBe('bae-bae');
    expect(toSlackName(talent, ': squeakyay:')).toBe('bae-squeak-yay');
    expect(toSlackName(talent, ': JDONMYSOUL:')).toBe('bae-jdon-my-soul');
    expect(toSlackName(talent, ': OUIOUIPP:')).toBe('bae-oui-oui-pp');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': BESTFRIEND:', { separator: '_', prefixes: {} })).toBe('bae_best_friend');
    expect(toSlackName(talent, ': BRUH:', { separator: '-', prefixes: { [talent]: 'baelz' } })).toBe('baelz-bruh');
  });
});

describe('registry helpers', () => {
  it('reports which talents have a transform', () => {
    expect(hasTalentTransform('Gigi Murin')).toBe(true);
    expect(hasTalentTransform('Ayunda Risu')).toBe(false);
  });

  it('returns default prefixes only for registered talents', () => {
    expect(
      getDefaultPrefixes(['Gigi Murin', 'Cecilia Immergreen', 'Raora Panthera', 'Elizabeth Rose Bloodflame', 'Mori Calliope', 'Ouro Kronii', 'Ayunda Risu']),
    ).toEqual({
      'Gigi Murin': 'gigi',
      'Cecilia Immergreen': 'cece',
      'Raora Panthera': 'rao',
      'Elizabeth Rose Bloodflame': 'liz',
      'Mori Calliope': 'calli',
      'Ouro Kronii': 'kronii',
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
