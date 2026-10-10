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
  const talent = 'Unmapped Talent';

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

describe('Tokino Sora transform', () => {
  const talent = 'Tokino Sora';

  it('romanizes kana names and keeps trailing digits', () => {
    expect(toSlackName(talent, ': ぬんぬん1:')).toBe('sora-nunnun1');
    expect(toSlackName(talent, ': いかないで:')).toBe('sora-ikanaide');
    expect(toSlackName(talent, ': そっか:')).toBe('sora-sokka');
    expect(toSlackName(talent, ': やったー:')).toBe('sora-yattaa');
    expect(toSlackName(talent, ': きゅっ:')).toBe('sora-kyu');
    expect(toSlackName(talent, ': はい1:')).toBe('sora-hai1');
    expect(toSlackName(talent, ': Hi1:')).toBe('sora-hi1');
  });

  it('reads kanji and splits words through the readings table', () => {
    expect(toSlackName(talent, ': 止まらねえぞ:')).toBe('sora-tomaranee-zo');
    expect(toSlackName(talent, ': 泣いちゃう:')).toBe('sora-naichau');
    expect(toSlackName(talent, ': 新ぬんぬん:')).toBe('sora-shin-nunnun');
    expect(toSlackName(talent, ': ああ迷子:')).toBe('sora-aa-maigo');
    expect(toSlackName(talent, ': あん肝ペンラ青:')).toBe('sora-ankimo-penlight-ao');
    expect(toSlackName(talent, ': 赤ちゃん:')).toBe('sora-akachan');
    expect(toSlackName(talent, ': ぬんぬんちゃん:')).toBe('sora-nunnun-chan');
    expect(toSlackName(talent, ': かさの絵文字:')).toBe('sora-kasa-no-emoji');
    expect(toSlackName(talent, ': じゃあ敵だね:')).toBe('sora-jaa-teki-da-ne');
    expect(toSlackName(talent, ': Imびっくり:')).toBe('sora-im-bikkuri');
  });

  it('turns katakana loanwords back into English and strips her own name', () => {
    expect(toSlackName(talent, ': ミニソーダちゃん:')).toBe('sora-mini-soda-chan');
    expect(toSlackName(talent, ': スンスタンプ:')).toBe('sora-sun-stamp');
    expect(toSlackName(talent, ': ナイス:')).toBe('sora-nice');
    expect(toSlackName(talent, ': そらザウルス:')).toBe('sora-saurus');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ミニソーダちゃん:', { separator: '_', prefixes: {} })).toBe('sora_mini_soda_chan');
    expect(toSlackName(talent, ': そらザウルス:', { separator: '', prefixes: {} })).toBe('sorasaurus');
    expect(toSlackName(talent, ': あん肝ペンラ青:', { separator: '-', prefixes: { [talent]: 'Tokino' } })).toBe('tokino-ankimo-penlight-ao');
  });
});

describe('Roboco transform', () => {
  const talent = 'Roboco';

  it('strips rbc, camel-splits, and uses the split table', () => {
    expect(toSlackName(talent, ': rbcHappiness:')).toBe('rbc-happiness');
    expect(toSlackName(talent, ': rbcThankyou:')).toBe('rbc-thank-you');
    expect(toSlackName(talent, ': rbcHighspec:')).toBe('rbc-high-spec');
    expect(toSlackName(talent, ': rbcMinus100hp:')).toBe('rbc-minus-100hp');
    expect(toSlackName(talent, ': rbcFAQ:')).toBe('rbc-faq');
    expect(toSlackName(talent, ': rbc1ha:')).toBe('rbc-1ha');
    expect(toSlackName(talent, ': rbc888:')).toBe('rbc-888');
  });

  it('romanizes the few Japanese names', () => {
    expect(toSlackName(talent, ': rbc充電中:')).toBe('rbc-juudenchuu');
    expect(toSlackName(talent, ': rbcねこたち:')).toBe('rbc-neko-tachi');
    expect(toSlackName(talent, ': rbc3ーー:')).toBe('rbc-3-oo');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': rbcThankyou:', { separator: '_', prefixes: {} })).toBe('rbc_thank_you');
    expect(toSlackName(talent, ': rbcねこたち:', { separator: '-', prefixes: { [talent]: 'roboco' } })).toBe('roboco-neko-tachi');
  });
});

describe('AZKi transform', () => {
  const talent = 'AZKi';

  it('prefixes lowercase single words and splits the few compounds', () => {
    expect(toSlackName(talent, ': clap:')).toBe('azki-clap');
    expect(toSlackName(talent, ': Creating:')).toBe('azki-creating');
    expect(toSlackName(talent, ': ICCM:')).toBe('azki-iccm');
    expect(toSlackName(talent, ': AZrium:')).toBe('azki-azrium');
    expect(toSlackName(talent, ': AZhand:')).toBe('azki-az-hand');
    expect(toSlackName(talent, ': Hitext:')).toBe('azki-hi-text');
  });

  it('collapses her own name into the prefix', () => {
    expect(toSlackName(talent, ': azki:')).toBe('azki');
    expect(toSlackName(talent, ': AZKi1:')).toBe('azki-1');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': Hitext:', { separator: '_', prefixes: {} })).toBe('azki_hi_text');
    expect(toSlackName(talent, ': AZKi1:', { separator: '-', prefixes: { [talent]: 'az' } })).toBe('az-1');
  });
});

describe('Sakura Miko transform', () => {
  const talent = 'Sakura Miko';

  it('strips miko and camel-splits', () => {
    expect(toSlackName(talent, ': mikoMiko:')).toBe('miko-miko');
    expect(toSlackName(talent, ': mikoGurasan:')).toBe('miko-gurasan');
    expect(toSlackName(talent, ': mikoHatena2:')).toBe('miko-hatena2');
    expect(toSlackName(talent, ': mikoTaiyakimi:')).toBe('miko-taiyakimi');
  });

  it('separates 35p and her own name inside compounds', () => {
    expect(toSlackName(talent, ': mikoDoya35P:')).toBe('miko-doya-35p');
    expect(toSlackName(talent, ': mikoMiko35p:')).toBe('miko-miko-35p');
    expect(toSlackName(talent, ': mikoGenkai35p:')).toBe('miko-genkai-35p');
    expect(toSlackName(talent, ': mikoMikopipipi:')).toBe('miko-miko-pipipi');
    expect(toSlackName(talent, ': mikoNakimiko:')).toBe('miko-naki-miko');
    expect(toSlackName(talent, ': mikoFxmiko:')).toBe('miko-fx-miko');
    expect(toSlackName(talent, ': mikoPenmikop:')).toBe('miko-pen-mikop');
    expect(toSlackName(talent, ': mikoKouhomikop:')).toBe('miko-kouho-mikop');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': mikoDoya35P:', { separator: '_', prefixes: {} })).toBe('miko_doya_35p');
    expect(toSlackName(talent, ': mikoKusa:', { separator: '-', prefixes: { [talent]: 'Mikochi' } })).toBe('mikochi-kusa');
  });
});

describe('Hoshimachi Suisei transform', () => {
  const talent = 'Hoshimachi Suisei';

  it('prefixes lowercase single words and camel-splits the bikkuri pair', () => {
    expect(toSlackName(talent, ': hosi:')).toBe('suisei-hosi');
    expect(toSlackName(talent, ': kyoumo:')).toBe('suisei-kyoumo');
    expect(toSlackName(talent, ': bikkuri:')).toBe('suisei-bikkuri');
    expect(toSlackName(talent, ': bikkuriB:')).toBe('suisei-bikkuri-b');
    expect(toSlackName(talent, ': bikkuriY:')).toBe('suisei-bikkuri-y');
    expect(toSlackName(talent, ': awsl:')).toBe('suisei-awsl');
  });

  it('collapses her own name into the prefix', () => {
    expect(toSlackName(talent, ': suisei:')).toBe('suisei');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': bikkuriB:', { separator: '_', prefixes: {} })).toBe('suisei_bikkuri_b');
    expect(toSlackName(talent, ': tensai:', { separator: '-', prefixes: { [talent]: 'sui' } })).toBe('sui-tensai');
  });
});

describe('Shirakami Fubuki transform', () => {
  const talent = 'Shirakami Fubuki';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': FBKOruyanke:')).toBe('fbk-oruyanke');
    expect(toSlackName(talent, ': FBKKIRARI:')).toBe('fbk-kirari');
    expect(toSlackName(talent, ': FBKNice:')).toBe('fbk-nice');
    expect(toSlackName(talent, ': FBKHEY2:')).toBe('fbk-hey2');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': FBKKIRARI:', { separator: '_', prefixes: {} })).toBe('fbk_kirari');
    expect(toSlackName(talent, ': FBKOruyanke:', { separator: '-', prefixes: { [talent]: 'Xfbk' } })).toBe('xfbk-oruyanke');
  });
});

describe('Natsuiro Matsuri transform', () => {
  const talent = 'Natsuiro Matsuri';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': まつりこまく:')).toBe('matsuri-komaku');
    expect(toSlackName(talent, ': まつりへのもじ:')).toBe('matsuri-he-no-moji');
    expect(toSlackName(talent, ': まつり虚無な感じ:')).toBe('matsuri-kyomu-na-kanji');
    expect(toSlackName(talent, ': まつりかんぱいまつりす:')).toBe('matsuri-kanpai-matsurisu');
    expect(toSlackName(talent, ': まつり待つり:')).toBe('matsuri-matsuri');
    expect(toSlackName(talent, ': まつりFightまつりす:')).toBe('matsuri-fight-matsurisu');
    expect(toSlackName(talent, ': まつりLOVE:')).toBe('matsuri-love');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': まつりへのもじ:', { separator: '_', prefixes: {} })).toBe('matsuri_he_no_moji');
    expect(toSlackName(talent, ': まつりこまく:', { separator: '-', prefixes: { [talent]: 'Xmatsuri' } })).toBe('xmatsuri-komaku');
  });
});

describe('Aki Rosenthal transform', () => {
  const talent = 'Aki Rosenthal';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': AKIROSEJOBZU:')).toBe('aki-jobzu');
    expect(toSlackName(talent, ': AKIROSEアローナ:')).toBe('aki-arona');
    expect(toSlackName(talent, ': AKIROSEおつたーる:')).toBe('aki-otsutaaru');
    expect(toSlackName(talent, ': AKIROSENextSC:')).toBe('aki-next-sc');
    expect(toSlackName(talent, ': AKIROSEBlessyou:')).toBe('aki-bless-you');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': AKIROSEアローナ:', { separator: '_', prefixes: {} })).toBe('aki_arona');
    expect(toSlackName(talent, ': AKIROSEJOBZU:', { separator: '-', prefixes: { [talent]: 'Xaki' } })).toBe('xaki-jobzu');
  });
});

describe('Akai Haato transform', () => {
  const talent = 'Akai Haato';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': ぶひぶひ:')).toBe('haachama-buhibuhi');
    expect(toSlackName(talent, ': サイリウムYEAH:')).toBe('haachama-sairium-yeah');
    expect(toSlackName(talent, ': ふぁい:')).toBe('haachama-fai');
    expect(toSlackName(talent, ': 焼きはあとん:')).toBe('haachama-yaki-haaton');
    expect(toSlackName(talent, ': 最強アイドル:')).toBe('haachama-saikyou-idol');
    expect(toSlackName(talent, ': ちゃま:')).toBe('haachama-chama');
    expect(toSlackName(talent, ': ちゃまー:')).toBe('haachama-chamaa');
    expect(toSlackName(talent, ': びっくりまーく:')).toBe('haachama-bikkuri-mark');
    expect(toSlackName(talent, ': AAA:')).toBe('haachama-aaa');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': サイリウムYEAH:', { separator: '_', prefixes: {} })).toBe('haachama_sairium_yeah');
    expect(toSlackName(talent, ': ぶひぶひ:', { separator: '-', prefixes: { [talent]: 'Xhaato' } })).toBe('xhaato-buhibuhi');
  });
});

describe('Minato Aqua transform', () => {
  const talent = 'Minato Aqua';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': aquaいかり:')).toBe('aqua-ikari');
    expect(toSlackName(talent, ': aquaあくあ狂う:')).toBe('aqua-akua-kuruu');
    expect(toSlackName(talent, ': aquaくそざこ余裕の余:')).toBe('aqua-kusozako-yoyuu-no-yo');
    expect(toSlackName(talent, ': aqua大天使あくあ:')).toBe('aqua-daitenshi-akua');
    expect(toSlackName(talent, ': aquaっっっ:')).toBe('aqua-ltu-ltu-ltu');
    expect(toSlackName(talent, ': aquaーーー:')).toBe('aqua-nobashi');
    expect(toSlackName(talent, ': aqua土下座:')).toBe('aqua-dogeza');
    expect(toSlackName(talent, ': aquaGoodGame:')).toBe('aqua-good-game');
    expect(toSlackName(talent, ': aquaNEKO顔:')).toBe('aqua-neko-kao');
    expect(toSlackName(talent, ': aquaこんあくあ:')).toBe('aqua-kon-akua');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': aquaあくあ狂う:', { separator: '_', prefixes: {} })).toBe('aqua_akua_kuruu');
    expect(toSlackName(talent, ': aquaいかり:', { separator: '-', prefixes: { [talent]: 'Xaqua' } })).toBe('xaqua-ikari');
  });
});

describe('Murasaki Shion transform', () => {
  const talent = 'Murasaki Shion';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': shionBousi:')).toBe('shion-bousi');
    expect(toSlackName(talent, ': shionたすかる:')).toBe('shion-tasukaru');
    expect(toSlackName(talent, ': shionThankyou:')).toBe('shion-thank-you');
    expect(toSlackName(talent, ': shionHeart紫:')).toBe('shion-heart-murasaki');
    expect(toSlackName(talent, ': shionペンライトピンク:')).toBe('shion-penlight-pink');
    expect(toSlackName(talent, ': shionハバ卒:')).toBe('shion-haba-sotsu');
    expect(toSlackName(talent, ': shion塩っ子1:')).toBe('shion-shiokko-1');
    expect(toSlackName(talent, ': shionーーー:')).toBe('shion-nobashi');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': shionたすかる:', { separator: '_', prefixes: {} })).toBe('shion_tasukaru');
    expect(toSlackName(talent, ': shionBousi:', { separator: '-', prefixes: { [talent]: 'Xshion' } })).toBe('xshion-bousi');
  });
});

describe('Nakiri Ayame transform', () => {
  const talent = 'Nakiri Ayame';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': yoo:')).toBe('ayame-yoo');
    expect(toSlackName(talent, ': otunakiri:')).toBe('ayame-otu-nakiri');
    expect(toSlackName(talent, ': goodgame:')).toBe('ayame-good-game');
    expect(toSlackName(talent, ': サイリウム:')).toBe('ayame-sairium');
    expect(toSlackName(talent, ': poyoyonaki:')).toBe('ayame-poyoyo-naki');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': otunakiri:', { separator: '_', prefixes: {} })).toBe('ayame_otu_nakiri');
    expect(toSlackName(talent, ': yoo:', { separator: '-', prefixes: { [talent]: 'Xayame' } })).toBe('xayame-yoo');
  });
});

describe('Yuzuki Choco transform', () => {
  const talent = 'Yuzuki Choco';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': ちょこ先生さすちょこ:')).toBe('choco-sasuchoko');
    expect(toSlackName(talent, ': ちょこ先生がちぃ:')).toBe('choco-gachii');
    expect(toSlackName(talent, ': ちょこ先生豆まき専用:')).toBe('choco-mamemaki-senyou');
    expect(toSlackName(talent, ': ちょこ先生サイリウム白ん:')).toBe('choco-sairium-shiro-n');
    expect(toSlackName(talent, ': ちょこ先生ＧＧ文字スタンプ:')).toBe('choco-gg-moji-stamp');
    expect(toSlackName(talent, ': ちょこ先生ふぇスタンプ:')).toBe('choco-fe-stamp');
    expect(toSlackName(talent, ': ちょこ先生ｱﾞ手書きスタンプ:')).toBe('choco-a-tegaki-stamp');
    expect(toSlackName(talent, ': ちょこ先生勝手書きスタンプ:')).toBe('choco-kachi-tegaki-stamp');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ちょこ先生がちぃ:', { separator: '_', prefixes: {} })).toBe('choco_gachii');
    expect(toSlackName(talent, ': ちょこ先生さすちょこ:', { separator: '-', prefixes: { [talent]: 'Xchoco' } })).toBe('xchoco-sasuchoko');
  });
});

describe('Oozora Subaru transform', () => {
  const talent = 'Oozora Subaru';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': スバルわたあめうさぎ:')).toBe('subaru-wataame-usagi');
    expect(toSlackName(talent, ': スバルスバルドダック肩幅顔:')).toBe('subaru-subaru-do-duck-katahaba-kao');
    expect(toSlackName(talent, ': スバル草草の草:')).toBe('subaru-kusa-kusa-no-kusa');
    expect(toSlackName(talent, ': スバルOK把握:')).toBe('subaru-ok-haaku');
    expect(toSlackName(talent, ': スバルすばるびっくり:')).toBe('subaru-subaru-bikkuri');
    expect(toSlackName(talent, ': スバルうれしいあひる:')).toBe('subaru-ureshii-ahiru');
    expect(toSlackName(talent, ': スバルすばるそーせーじ:')).toBe('subaru-subaru-sausage');
    expect(toSlackName(talent, ': スバルスバルK:')).toBe('subaru-subaru-k');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': スバルスバルドダック肩幅顔:', { separator: '_', prefixes: {} })).toBe('subaru_subaru_do_duck_katahaba_kao');
    expect(toSlackName(talent, ': スバルわたあめうさぎ:', { separator: '-', prefixes: { [talent]: 'Xsubaru' } })).toBe('xsubaru-wataame-usagi');
  });
});

describe('Ookami Mio transform', () => {
  const talent = 'Ookami Mio';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': mioハトタウロス:')).toBe('mio-hatotaurus');
    expect(toSlackName(talent, ': mioミオかわのミオ:')).toBe('mio-mio-kawa-no-mio');
    expect(toSlackName(talent, ': mio助かるのかる:')).toBe('mio-tasukaru-no-karu');
    expect(toSlackName(talent, ': mio待機の待:')).toBe('mio-taiki-no-tai');
    expect(toSlackName(talent, ': mioおつみぉーんのおつ:')).toBe('mio-otsu-mion-no-otsu');
    expect(toSlackName(talent, ': mioミオファの森:')).toBe('mio-miofa-no-mori');
    expect(toSlackName(talent, ': mioわおーん:')).toBe('mio-waoon');
    expect(toSlackName(talent, ': mioミオzzz:')).toBe('mio-mio-zzz');
    expect(toSlackName(talent, ': mio魂出てる:')).toBe('mio-tamashii-deteru');
    expect(toSlackName(talent, ': mioチクノカンジ:')).toBe('mio-chiku-no-kanji');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': mioミオかわのミオ:', { separator: '_', prefixes: {} })).toBe('mio_mio_kawa_no_mio');
    expect(toSlackName(talent, ': mioハトタウロス:', { separator: '-', prefixes: { [talent]: 'Xmio' } })).toBe('xmio-hatotaurus');
  });
});

describe('Nekomata Okayu transform', () => {
  const talent = 'Nekomata Okayu';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': もぐもぐ:')).toBe('okayu-mogumogu');
    expect(toSlackName(talent, ': それは草:')).toBe('okayu-soreha-kusa');
    expect(toSlackName(talent, ': シンプルおにぎり:')).toBe('okayu-simple-onigiri');
    expect(toSlackName(talent, ': 勝ち猫:')).toBe('okayu-kachineko');
    expect(toSlackName(talent, ': てまにゃん歩く:')).toBe('okayu-temanyan-aruku');
    expect(toSlackName(talent, ': 檻の中のおにぎりゃー:')).toBe('okayu-ori-no-naka-no-onigiryaa');
    expect(toSlackName(talent, ': ご飯待機おにぎりゃー:')).toBe('okayu-gohan-taiki-onigiryaa');
    expect(toSlackName(talent, ': こまっチンゲン菜:')).toBe('okayu-komacchingensai');
    expect(toSlackName(talent, ': はーと:')).toBe('okayu-heart');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': それは草:', { separator: '_', prefixes: {} })).toBe('okayu_soreha_kusa');
    expect(toSlackName(talent, ': もぐもぐ:', { separator: '-', prefixes: { [talent]: 'Xokayu' } })).toBe('xokayu-mogumogu');
  });
});

describe('Inugami Korone transform', () => {
  const talent = 'Inugami Korone';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': koroneIiyubi:')).toBe('korone-iiyubi');
    expect(toSlackName(talent, ': koroneListener1:')).toBe('korone-listener1');
    expect(toSlackName(talent, ': koroneMoziwowwow:')).toBe('korone-moziwowwow');
    expect(toSlackName(talent, ': koronePsy01a:')).toBe('korone-psy01a');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': koroneListener1:', { separator: '_', prefixes: {} })).toBe('korone_listener1');
    expect(toSlackName(talent, ': koroneIiyubi:', { separator: '-', prefixes: { [talent]: 'Xkorone' } })).toBe('xkorone-iiyubi');
  });
});

describe('Usada Pekora transform', () => {
  const talent = 'Usada Pekora';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': pekoぺごぉ:')).toBe('peko-pego-o');
    expect(toSlackName(talent, ': peko獅々田:')).toBe('peko-shishida');
    expect(toSlackName(talent, ': pekoPeko:')).toBe('peko-peko');
    expect(toSlackName(talent, ': peko焦り顔:')).toBe('peko-aseri-kao');
    expect(toSlackName(talent, ': pekoきｔら:')).toBe('peko-kitra');
    expect(toSlackName(talent, ': pekoびっくりまーく:')).toBe('peko-bikkuri-mark');
    expect(toSlackName(talent, ': pekoぺこぉ:')).toBe('peko-peko-o');
    expect(toSlackName(talent, ': pekoぺこー:')).toBe('peko-pekoo');
    expect(toSlackName(talent, ': pekoぺこーーー:')).toBe('peko-pekoooo');
    expect(toSlackName(talent, ': pekoドンちゃん1:')).toBe('peko-don-chan-1');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': peko獅々田:', { separator: '_', prefixes: {} })).toBe('peko_shishida');
    expect(toSlackName(talent, ': pekoぺごぉ:', { separator: '-', prefixes: { [talent]: 'Xpeko' } })).toBe('xpeko-pego-o');
  });
});

describe('Shiranui Flare transform', () => {
  const talent = 'Shiranui Flare';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': oiii:')).toBe('flare-oiii');
    expect(toSlackName(talent, ': mojiP:')).toBe('flare-moji-p');
    expect(toSlackName(talent, ': 0241:')).toBe('flare-0241');
    expect(toSlackName(talent, ': saxtu:')).toBe('flare-saxtu');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': mojiP:', { separator: '_', prefixes: {} })).toBe('flare_moji_p');
    expect(toSlackName(talent, ': oiii:', { separator: '-', prefixes: { [talent]: 'Xflare' } })).toBe('xflare-oiii');
  });
});

describe('Shirogane Noel transform', () => {
  const talent = 'Shirogane Noel';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': はてな:')).toBe('noel-hatena');
    expect(toSlackName(talent, ': ひかるぼうぼう:')).toBe('noel-hikarubou-bou');
    expect(toSlackName(talent, ': けつどりとうめい:')).toBe('noel-ketsudori-toumei');
    expect(toSlackName(talent, ': まっする:')).toBe('noel-muscle');
    expect(toSlackName(talent, ': のえるでらっくす:')).toBe('noel-noel-deluxe');
    expect(toSlackName(talent, ': いまじなりーしゃどう:')).toBe('noel-imaginary-shadow');
    expect(toSlackName(talent, ': ぽかーん:')).toBe('noel-pokaan');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ひかるぼうぼう:', { separator: '_', prefixes: {} })).toBe('noel_hikarubou_bou');
    expect(toSlackName(talent, ': はてな:', { separator: '-', prefixes: { [talent]: 'Xnoel' } })).toBe('xnoel-hatena');
  });
});

describe('Houshou Marine transform', () => {
  const talent = 'Houshou Marine';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': わーい:')).toBe('marine-waai');
    expect(toSlackName(talent, ': 泣ける:')).toBe('marine-nakeru');
    expect(toSlackName(talent, ': 晴れ着:')).toBe('marine-haregi');
    expect(toSlackName(talent, ': ルーナマリン:')).toBe('marine-luna-marin');
    expect(toSlackName(talent, ': ゲーミング圧:')).toBe('marine-gaming-atsu');
    expect(toSlackName(talent, ': 沈没船長:')).toBe('marine-chinbotsu-senchou');
    expect(toSlackName(talent, ': 78歳:')).toBe('marine-78-sai');
    expect(toSlackName(talent, ': AhoyA:')).toBe('marine-ahoy-a');
    expect(toSlackName(talent, ': きっつの大きいつ:')).toBe('marine-kittsu-no-ookii-tsu');
    expect(toSlackName(talent, ': ヨーソローのー:')).toBe('marine-yosoro-no-nobashi');
    expect(toSlackName(talent, ': 草の字:')).toBe('marine-kusa-no-ji');
    expect(toSlackName(talent, ': ムラムラのム:')).toBe('marine-muramura-no-mu');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': 泣ける:', { separator: '_', prefixes: {} })).toBe('marine_nakeru');
    expect(toSlackName(talent, ': わーい:', { separator: '-', prefixes: { [talent]: 'Xmarine' } })).toBe('xmarine-waai');
  });
});

describe('Amane Kanata transform', () => {
  const talent = 'Amane Kanata';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': kanataHey:')).toBe('kanata-hey');
    expect(toSlackName(talent, ': kanataKanata:')).toBe('kanata-kanata');
    expect(toSlackName(talent, ': kanataLightblue:')).toBe('kanata-light-blue');
    expect(toSlackName(talent, ': kanataKaka2:')).toBe('kanata-kaka2');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': kanataKanata:', { separator: '_', prefixes: {} })).toBe('kanata_kanata');
    expect(toSlackName(talent, ': kanataHey:', { separator: '-', prefixes: { [talent]: 'Xkanata' } })).toBe('xkanata-hey');
  });
});

describe('Tsunomaki Watame transform', () => {
  const talent = 'Tsunomaki Watame';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': ねぇはてな:')).toBe('watame-nee-hatena');
    expect(toSlackName(talent, ': ダークテーマ用のド:')).toBe('watame-dark-theme-you-no-do');
    expect(toSlackName(talent, ': っ文字:')).toBe('watame-ltu-moji');
    expect(toSlackName(talent, ': ナンバー1:')).toBe('watame-number-1');
    expect(toSlackName(talent, ': 桐生ココ絵:')).toBe('watame-kiryu-coco-e');
    expect(toSlackName(talent, ': 紫ペンラ:')).toBe('watame-murasaki-penlight');
    expect(toSlackName(talent, ': zzZ:')).toBe('watame-zzz');
    expect(toSlackName(talent, ': 臭くさ:')).toBe('watame-kusai-kusa');
    expect(toSlackName(talent, ': 誕生日ケーキ:')).toBe('watame-tanjoubi-cake');
    expect(toSlackName(talent, ': 嬉し涙:')).toBe('watame-ureshi-namida');
    expect(toSlackName(talent, ': キッ怒:')).toBe('watame-kiddo');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ダークテーマ用のド:', { separator: '_', prefixes: {} })).toBe('watame_dark_theme_you_no_do');
    expect(toSlackName(talent, ': ねぇはてな:', { separator: '-', prefixes: { [talent]: 'Xwatame' } })).toBe('xwatame-nee-hatena');
  });
});

describe('Tokoyami Towa transform', () => {
  const talent = 'Tokoyami Towa';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': てんQスタンプ:')).toBe('towa-ten-q-stamp');
    expect(toSlackName(talent, ': トワ様ズーン:')).toBe('towa-zuun');
    expect(toSlackName(talent, ': ビビフレフレ:')).toBe('towa-bibi-furefure');
    expect(toSlackName(talent, ': トワ文字:')).toBe('towa-towa-moji');
    expect(toSlackName(talent, ': 草です:')).toBe('towa-kusa-desu');
    expect(toSlackName(talent, ': トワ様指差し:')).toBe('towa-yubisashi');
    expect(toSlackName(talent, ': 虎太郎:')).toBe('towa-kotarou');
    expect(toSlackName(talent, ': エイチピー:')).toBe('towa-hp');
    expect(toSlackName(talent, ': goodgame2:')).toBe('towa-good-game2');
    expect(toSlackName(talent, ': psyllium12:')).toBe('towa-psyllium12');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': トワ様ズーン:', { separator: '_', prefixes: {} })).toBe('towa_zuun');
    expect(toSlackName(talent, ': てんQスタンプ:', { separator: '-', prefixes: { [talent]: 'Xtowa' } })).toBe('xtowa-ten-q-stamp');
  });
});

describe('Himemori Luna transform', () => {
  const talent = 'Himemori Luna';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': るーなな:')).toBe('luna-ruunana');
    expect(toSlackName(talent, ': ちゅーー:')).toBe('luna-chuuu');
    expect(toSlackName(talent, ': メンバーズカード:')).toBe('luna-members-card');
    expect(toSlackName(talent, ': ペンライトブルー:')).toBe('luna-penlight-blue');
    expect(toSlackName(talent, ': ペンラ11:')).toBe('luna-penlight-11');
    expect(toSlackName(talent, ': NOBABYNANO:')).toBe('luna-nobabynano');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ちゅーー:', { separator: '_', prefixes: {} })).toBe('luna_chuuu');
    expect(toSlackName(talent, ': るーなな:', { separator: '-', prefixes: { [talent]: 'Xluna' } })).toBe('xluna-ruunana');
  });
});

describe('Yukihana Lamy transform', () => {
  const talent = 'Yukihana Lamy';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': さんっ:')).toBe('lamy-san');
    expect(toSlackName(talent, ': 乾杯っ:')).toBe('lamy-kanpai');
    expect(toSlackName(talent, ': ねねちゃん:')).toBe('lamy-nene-chan');
    expect(toSlackName(talent, ': ラミィ:')).toBe('lamy-lamy');
    expect(toSlackName(talent, ': えらいのえ:')).toBe('lamy-erai-no-e');
    expect(toSlackName(talent, ': もぐMOGU:')).toBe('lamy-mogumogu');
    expect(toSlackName(talent, ': ひぃーん:')).toBe('lamy-hiin');
    expect(toSlackName(talent, ': よっぱラミィ:')).toBe('lamy-yoppa-lamy');
    expect(toSlackName(talent, ': 雪民さん01:')).toBe('lamy-yukimin-san-01');
    expect(toSlackName(talent, ': サイリウム青:')).toBe('lamy-sairium-ao');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': 乾杯っ:', { separator: '_', prefixes: {} })).toBe('lamy_kanpai');
    expect(toSlackName(talent, ': さんっ:', { separator: '-', prefixes: { [talent]: 'Xlamy' } })).toBe('xlamy-san');
  });
});

describe('Momosuzu Nene transform', () => {
  const talent = 'Momosuzu Nene';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': nene:')).toBe('nene-nene');
    expect(toSlackName(talent, ': nenechigod:')).toBe('nene-nenechigod');
    expect(toSlackName(talent, ': ドッッ:')).toBe('nene-do');
    expect(toSlackName(talent, ': マイクちゃん:')).toBe('nene-mic-chan');
    expect(toSlackName(talent, ': smileN1:')).toBe('nene-smile-n1');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': nenechigod:', { separator: '_', prefixes: {} })).toBe('nene_nenechigod');
    expect(toSlackName(talent, ': nene:', { separator: '-', prefixes: { [talent]: 'Xnene' } })).toBe('xnene-nene');
  });
});

describe('Shishiro Botan transform', () => {
  const talent = 'Shishiro Botan';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': ssrbぽいっ:')).toBe('botan-poi');
    expect(toSlackName(talent, ': ssrbらみぃ:')).toBe('botan-ramii');
    expect(toSlackName(talent, ': ssrbーーー:')).toBe('botan-nobashi');
    expect(toSlackName(talent, ': ssrbわらう英語:')).toBe('botan-warau-eigo');
    expect(toSlackName(talent, ': ssrbIQ200:')).toBe('botan-iq200');
    expect(toSlackName(talent, ': ssrbSsrb01:')).toBe('botan-ssrb-01');
    expect(toSlackName(talent, ': ssrbSsrbcamo:')).toBe('botan-ssrb-camo');
    expect(toSlackName(talent, ': ssrbTyakkazumi:')).toBe('botan-tyakkazumi');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ssrbらみぃ:', { separator: '_', prefixes: {} })).toBe('botan_ramii');
    expect(toSlackName(talent, ': ssrbぽいっ:', { separator: '-', prefixes: { [talent]: 'Xssrb' } })).toBe('xssrb-poi');
  });
});

describe('Omaru Polka transform', () => {
  const talent = 'Omaru Polka';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': heart:')).toBe('polka-heart');
    expect(toSlackName(talent, ': polka:')).toBe('polka-polka');
    expect(toSlackName(talent, ': nenenoe1:')).toBe('polka-nenenoe1');
    expect(toSlackName(talent, ': ltu:')).toBe('polka-ltu');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': polka:', { separator: '_', prefixes: {} })).toBe('polka_polka');
    expect(toSlackName(talent, ': heart:', { separator: '-', prefixes: { [talent]: 'Xpolka' } })).toBe('xpolka-heart');
  });
});

describe('La+ Darknesss transform', () => {
  const talent = 'La+ Darknesss';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': 200IQ:')).toBe('laplus-200-iq');
    expect(toSlackName(talent, ': つよｗ:')).toBe('laplus-tsuyo-w');
    expect(toSlackName(talent, ': 勝利のスタンプ:')).toBe('laplus-shouri-no-stamp');
    expect(toSlackName(talent, ': イカリノカオ:')).toBe('laplus-ikari-no-kao');
    expect(toSlackName(talent, ': いい声:')).toBe('laplus-ii-koe');
    expect(toSlackName(talent, ': げーみんぐ:')).toBe('laplus-gaming');
    expect(toSlackName(talent, ': ぎむのぎ:')).toBe('laplus-gimu-no-gi');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': つよｗ:', { separator: '_', prefixes: {} })).toBe('laplus_tsuyo_w');
    expect(toSlackName(talent, ': 200IQ:', { separator: '-', prefixes: { [talent]: 'Xlaplus' } })).toBe('xlaplus-200-iq');
  });
});

describe('Takane Lui transform', () => {
  const talent = 'Takane Lui';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': Psyllium:')).toBe('lui-psyllium');
    expect(toSlackName(talent, ': koltu:')).toBe('lui-koltu');
    expect(toSlackName(talent, ': goodgame:')).toBe('lui-good-game');
    expect(toSlackName(talent, ': socool:')).toBe('lui-so-cool');
    expect(toSlackName(talent, ': mojido:')).toBe('lui-mojido');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': koltu:', { separator: '_', prefixes: {} })).toBe('lui_koltu');
    expect(toSlackName(talent, ': Psyllium:', { separator: '-', prefixes: { [talent]: 'Xlui' } })).toBe('xlui-psyllium');
  });
});

describe('Hakui Koyori transform', () => {
  const talent = 'Hakui Koyori';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': わーい:')).toBe('koyo-waai');
    expect(toSlackName(talent, ': サイリウムコヨーテ:')).toBe('koyo-sairium-coyote');
    expect(toSlackName(talent, ': 尻尾振るコヨーテ:')).toBe('koyo-shippo-furu-coyote');
    expect(toSlackName(talent, ': こko:')).toBe('koyo-ko');
    expect(toSlackName(talent, ': んnn:')).toBe('koyo-n');
    expect(toSlackName(talent, ': 草lol:')).toBe('koyo-kusa-lol');
    expect(toSlackName(talent, ': さすsus:')).toBe('koyo-sasu-sus');
    expect(toSlackName(talent, ': 疑問顔:')).toBe('koyo-gimon-kao');
    expect(toSlackName(talent, ': サムズアップ:')).toBe('koyo-thumbs-up');
    expect(toSlackName(talent, ': 無罪muzai:')).toBe('koyo-muzai');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': サイリウムコヨーテ:', { separator: '_', prefixes: {} })).toBe('koyo_sairium_coyote');
    expect(toSlackName(talent, ': わーい:', { separator: '-', prefixes: { [talent]: 'Xkoyo' } })).toBe('xkoyo-waai');
  });
});

describe('Sakamata Chloe transform', () => {
  const talent = 'Sakamata Chloe';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': うけｗ:')).toBe('chloe-uke-w');
    expect(toSlackName(talent, ': ばくーん:')).toBe('chloe-bakuun');
    expect(toSlackName(talent, ': 激アツ:')).toBe('chloe-geki-atsu');
    expect(toSlackName(talent, ': 寿司っ:')).toBe('chloe-sushi');
    expect(toSlackName(talent, ': 勝ち確:')).toBe('chloe-kachikaku');
    expect(toSlackName(talent, ': フラグ:')).toBe('chloe-flag');
    expect(toSlackName(talent, ': 26810:')).toBe('chloe-26810');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ばくーん:', { separator: '_', prefixes: {} })).toBe('chloe_bakuun');
    expect(toSlackName(talent, ': うけｗ:', { separator: '-', prefixes: { [talent]: 'Xchloe' } })).toBe('xchloe-uke-w');
  });
});

describe('Kazama Iroha transform', () => {
  const talent = 'Kazama Iroha';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': pokoheart:')).toBe('iroha-pokoheart');
    expect(toSlackName(talent, ': iroha1:')).toBe('iroha-1');
    expect(toSlackName(talent, ': gozarusan:')).toBe('iroha-gozarusan');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': iroha1:', { separator: '_', prefixes: {} })).toBe('iroha_1');
    expect(toSlackName(talent, ': pokoheart:', { separator: '-', prefixes: { [talent]: 'Xiroha' } })).toBe('xiroha-pokoheart');
  });
});

describe('Hiodoshi Ao transform', () => {
  const talent = 'Hiodoshi Ao';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': PON:')).toBe('ao-pon');
    expect(toSlackName(talent, ': くさｗ:')).toBe('ao-kusa-w');
    expect(toSlackName(talent, ': うんー:')).toBe('ao-unn');
    expect(toSlackName(talent, ': 高い酒:')).toBe('ao-takai-sake');
    expect(toSlackName(talent, ': シャンパンタワー:')).toBe('ao-champagne-tower');
    expect(toSlackName(talent, ': クラゲくん:')).toBe('ao-kurage-kun');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': くさｗ:', { separator: '_', prefixes: {} })).toBe('ao_kusa_w');
    expect(toSlackName(talent, ': PON:', { separator: '-', prefixes: { [talent]: 'Xao' } })).toBe('xao-pon');
  });
});

describe('Otonose Kanade transform', () => {
  const talent = 'Otonose Kanade';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': うめうめ:')).toBe('kanade-umeume');
    expect(toSlackName(talent, ': ｗｗｗ:')).toBe('kanade-www');
    expect(toSlackName(talent, ': おつのせイラスト:')).toBe('kanade-otsunose-illust');
    expect(toSlackName(talent, ': こんのせ文字:')).toBe('kanade-konnose-moji');
    expect(toSlackName(talent, ': ビックリマーク:')).toBe('kanade-bikkuri-mark');
    expect(toSlackName(talent, ': 音符1:')).toBe('kanade-onpu-1');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ｗｗｗ:', { separator: '_', prefixes: {} })).toBe('kanade_www');
    expect(toSlackName(talent, ': うめうめ:', { separator: '-', prefixes: { [talent]: 'Xkanade' } })).toBe('xkanade-umeume');
  });
});

describe('Ichijou Ririka transform', () => {
  const talent = 'Ichijou Ririka';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': lol:')).toBe('ririka-lol');
    expect(toSlackName(talent, ': Kanpai:')).toBe('ririka-kanpai');
    expect(toSlackName(talent, ': goodjob:')).toBe('ririka-good-job');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': Kanpai:', { separator: '_', prefixes: {} })).toBe('ririka_kanpai');
    expect(toSlackName(talent, ': lol:', { separator: '-', prefixes: { [talent]: 'Xririka' } })).toBe('xririka-lol');
  });
});

describe('Juufuutei Raden transform', () => {
  const talent = 'Juufuutei Raden';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': こんばんは:')).toBe('raden-konbanwa');
    expect(toSlackName(talent, ': お酒を飲みまあす:')).toBe('raden-osake-wo-nomimaasu');
    expect(toSlackName(talent, ': さようならでん:')).toBe('raden-sayounara-den');
    expect(toSlackName(talent, ': 六根清浄:')).toBe('raden-rokkon-shoujou');
    expect(toSlackName(talent, ': OKです:')).toBe('raden-ok-desu');
    expect(toSlackName(talent, ': 座布団:')).toBe('raden-zabuton');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': お酒を飲みまあす:', { separator: '_', prefixes: {} })).toBe('raden_osake_wo_nomimaasu');
    expect(toSlackName(talent, ': こんばんは:', { separator: '-', prefixes: { [talent]: 'Xraden' } })).toBe('xraden-konbanwa');
  });
});

describe('Todoroki Hajime transform', () => {
  const talent = 'Todoroki Hajime';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': doya:')).toBe('hajime-doya');
    expect(toSlackName(talent, ': maltucho:')).toBe('hajime-maltucho');
    expect(toSlackName(talent, ': penraito:')).toBe('hajime-penraito');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': maltucho:', { separator: '_', prefixes: {} })).toBe('hajime_maltucho');
    expect(toSlackName(talent, ': doya:', { separator: '-', prefixes: { [talent]: 'Xhajime' } })).toBe('xhajime-doya');
  });
});

describe('Isaki Riona transform', () => {
  const talent = 'Isaki Riona';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': rionaBrrr:')).toBe('riona-brrr');
    expect(toSlackName(talent, ': rionalight:')).toBe('riona-light');
    expect(toSlackName(talent, ': rionaWww:')).toBe('riona-www');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': rionalight:', { separator: '_', prefixes: {} })).toBe('riona_light');
    expect(toSlackName(talent, ': rionaBrrr:', { separator: '-', prefixes: { [talent]: 'Xriona' } })).toBe('xriona-brrr');
  });
});

describe('Koganei Niko transform', () => {
  const talent = 'Koganei Niko';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': 鎖ペンライト:')).toBe('niko-kusari-penlight');
    expect(toSlackName(talent, ': 照れるニコ担:')).toBe('niko-tereru-niko-tan');
    expect(toSlackName(talent, ': ニコの字:')).toBe('niko-niko-no-ji');
    expect(toSlackName(talent, ': ぅの字:')).toBe('niko-u-no-ji');
    expect(toSlackName(talent, ': ッッッ:')).toBe('niko-ltu-ltu-ltu');
    expect(toSlackName(talent, ': ざぁーこ:')).toBe('niko-zaako');
    expect(toSlackName(talent, ': 酒がうまい:')).toBe('niko-sake-ga-umai');
    expect(toSlackName(talent, ': 困り顔:')).toBe('niko-komarigao');
    expect(toSlackName(talent, ': 萌えッ:')).toBe('niko-moe');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': 照れるニコ担:', { separator: '_', prefixes: {} })).toBe('niko_tereru_niko_tan');
    expect(toSlackName(talent, ': 鎖ペンライト:', { separator: '-', prefixes: { [talent]: 'Xniko' } })).toBe('xniko-kusari-penlight');
  });
});

describe('Mizumiya Su transform', () => {
  const talent = 'Mizumiya Su';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': ペンライト:')).toBe('su-penlight');
    expect(toSlackName(talent, ': すうの圧:')).toBe('su-suu-no-atsu');
    expect(toSlackName(talent, ': わらうすう:')).toBe('su-warau-suu');
    expect(toSlackName(talent, ': えーん:')).toBe('su-een');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': すうの圧:', { separator: '_', prefixes: {} })).toBe('su_suu_no_atsu');
    expect(toSlackName(talent, ': ペンライト:', { separator: '-', prefixes: { [talent]: 'Xsu' } })).toBe('xsu-penlight');
  });
});

describe('Rindo Chihaya transform', () => {
  const talent = 'Rindo Chihaya';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': heart:')).toBe('chihaya-heart');
    expect(toSlackName(talent, ': bbu:')).toBe('chihaya-bbu');
    expect(toSlackName(talent, ': penlight:')).toBe('chihaya-penlight');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': bbu:', { separator: '_', prefixes: {} })).toBe('chihaya_bbu');
    expect(toSlackName(talent, ': heart:', { separator: '-', prefixes: { [talent]: 'Xchihaya' } })).toBe('xchihaya-heart');
  });
});

describe('Kikirara Vivi transform', () => {
  const talent = 'Kikirara Vivi';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': すっぴん:')).toBe('vivi-suppin');
    expect(toSlackName(talent, ': ヴィヴィ:')).toBe('vivi-vivi');
    expect(toSlackName(talent, ': ニヤニヤ:')).toBe('vivi-niyaniya');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ヴィヴィ:', { separator: '_', prefixes: {} })).toBe('vivi_vivi');
    expect(toSlackName(talent, ': すっぴん:', { separator: '-', prefixes: { [talent]: 'Xvivi' } })).toBe('xvivi-suppin');
  });
});

describe('Ayunda Risu transform', () => {
  const talent = 'Ayunda Risu';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': Brr:')).toBe('risu-brr');
    expect(toSlackName(talent, ': LightStick:')).toBe('risu-light-stick');
    expect(toSlackName(talent, ': LetrUBrown:')).toBe('risu-letter-u-brown');
    expect(toSlackName(talent, ': LetterR:')).toBe('risu-letter-r');
    expect(toSlackName(talent, ': nesoberisu:')).toBe('risu-nesobe-risu');
    expect(toSlackName(talent, ': risuheart:')).toBe('risu-risu-heart');
    expect(toSlackName(talent, ': LEMAO:')).toBe('risu-lemao');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': LightStick:', { separator: '_', prefixes: {} })).toBe('risu_light_stick');
    expect(toSlackName(talent, ': Brr:', { separator: '-', prefixes: { [talent]: 'Xrisu' } })).toBe('xrisu-brr');
  });
});

describe('Moona Hoshinova transform', () => {
  const talent = 'Moona Hoshinova';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': Cry:')).toBe('moona-cry');
    expect(toSlackName(talent, ': Youcandoit:')).toBe('moona-you-can-do-it');
    expect(toSlackName(talent, ': GoodGame:')).toBe('moona-good-game');
    expect(toSlackName(talent, ': CoolMoona:')).toBe('moona-cool-moona');
    expect(toSlackName(talent, ': LSL:')).toBe('moona-lightstick-left');
    expect(toSlackName(talent, ': Doki2:')).toBe('moona-doki2');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': Youcandoit:', { separator: '_', prefixes: {} })).toBe('moona_you_can_do_it');
    expect(toSlackName(talent, ': Cry:', { separator: '-', prefixes: { [talent]: 'Xmoona' } })).toBe('xmoona-cry');
  });
});

describe('Airani Iofifteen transform', () => {
  const talent = 'Airani Iofifteen';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': LetterO:')).toBe('iofi-letter-o');
    expect(toSlackName(talent, ': Letterbi:')).toBe('iofi-letter-bi');
    expect(toSlackName(talent, ': LSleft:')).toBe('iofi-lightstick-left');
    expect(toSlackName(talent, ': chiyopiL:')).toBe('iofi-chiyopi-left');
    expect(toSlackName(talent, ': bigbrain:')).toBe('iofi-big-brain');
    expect(toSlackName(talent, ': tenQ:')).toBe('iofi-ten-q');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': Letterbi:', { separator: '_', prefixes: {} })).toBe('iofi_letter_bi');
    expect(toSlackName(talent, ': LetterO:', { separator: '-', prefixes: { [talent]: 'Xiofi' } })).toBe('xiofi-letter-o');
  });
});

describe('Kureiji Ollie transform', () => {
  const talent = 'Kureiji Ollie';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': lightstick:')).toBe('ollie-lightstick');
    expect(toSlackName(talent, ': ollien:')).toBe('ollie-ollien');
    expect(toSlackName(talent, ': hypeollie:')).toBe('ollie-hype');
    expect(toSlackName(talent, ': OllieHug:')).toBe('ollie-hug');
    expect(toSlackName(talent, ': AlphaI1:')).toBe('ollie-alpha-i1');
    expect(toSlackName(talent, ': CepolL:')).toBe('ollie-cepol-left');
    expect(toSlackName(talent, ': UdinPat:')).toBe('ollie-udin-pat');
    expect(toSlackName(talent, ': OllieIKZ:')).toBe('ollie-ikz');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ollien:', { separator: '_', prefixes: {} })).toBe('ollie_ollien');
    expect(toSlackName(talent, ': lightstick:', { separator: '-', prefixes: { [talent]: 'Xollie' } })).toBe('xollie-lightstick');
  });
});

describe('Anya Melfissa transform', () => {
  const talent = 'Anya Melfissa';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': thisisfine:')).toBe('anya-this-is-fine');
    expect(toSlackName(talent, ': glowkris:')).toBe('anya-glow-kris');
    expect(toSlackName(talent, ': byebye:')).toBe('anya-byebye');
    expect(toSlackName(talent, ': onduty:')).toBe('anya-on-duty');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': glowkris:', { separator: '_', prefixes: {} })).toBe('anya_glow_kris');
    expect(toSlackName(talent, ': thisisfine:', { separator: '-', prefixes: { [talent]: 'Xanya' } })).toBe('xanya-this-is-fine');
  });
});

describe('Pavolia Reine transform', () => {
  const talent = 'Pavolia Reine';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': lightstick:')).toBe('reine-lightstick');
    expect(toSlackName(talent, ': bigX:')).toBe('reine-big-x');
    expect(toSlackName(talent, ': thumbsup:')).toBe('reine-thumbs-up');
    expect(toSlackName(talent, ': meloncube:')).toBe('reine-melon-cube');
    expect(toSlackName(talent, ': breine:')).toBe('reine-breine');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': bigX:', { separator: '_', prefixes: {} })).toBe('reine_big_x');
    expect(toSlackName(talent, ': lightstick:', { separator: '-', prefixes: { [talent]: 'Xreine' } })).toBe('xreine-lightstick');
  });
});

describe('Vestia Zeta transform', () => {
  const talent = 'Vestia Zeta';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': flushed:')).toBe('zeta-flushed');
    expect(toSlackName(talent, ': o7zeta:')).toBe('zeta-o7');
    expect(toSlackName(talent, ': zetaGG:')).toBe('zeta-gg');
    expect(toSlackName(talent, ': zetamin:')).toBe('zeta-zetamin');
    expect(toSlackName(talent, ': gitgud:')).toBe('zeta-git-gud');
    expect(toSlackName(talent, ': ZZZ:')).toBe('zeta-zzz');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': o7zeta:', { separator: '_', prefixes: {} })).toBe('zeta_o7');
    expect(toSlackName(talent, ': flushed:', { separator: '-', prefixes: { [talent]: 'Xzeta' } })).toBe('xzeta-flushed');
  });
});

describe('Kaela Kovalskia transform', () => {
  const talent = 'Kaela Kovalskia';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': comfy:')).toBe('kaela-comfy');
    expect(toSlackName(talent, ': ggez:')).toBe('kaela-gg-ez');
    expect(toSlackName(talent, ': aletters:')).toBe('kaela-letter-a');
    expect(toSlackName(talent, ': hammeright:')).toBe('kaela-hammer-right');
    expect(toSlackName(talent, ': smallNT:')).toBe('kaela-small-nt');
    expect(toSlackName(talent, ': adios1:')).toBe('kaela-adios1');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': ggez:', { separator: '_', prefixes: {} })).toBe('kaela_gg_ez');
    expect(toSlackName(talent, ': comfy:', { separator: '-', prefixes: { [talent]: 'Xkaela' } })).toBe('xkaela-comfy');
  });
});

describe('Kobo Kanaeru transform', () => {
  const talent = 'Kobo Kanaeru';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': tch:')).toBe('kobo-tch');
    expect(toSlackName(talent, ': lightleft:')).toBe('kobo-light-left');
    expect(toSlackName(talent, ': kletter:')).toBe('kobo-letter-k');
    expect(toSlackName(talent, ': Q3Q:')).toBe('kobo-q3q');
    expect(toSlackName(talent, ': kobominus:')).toBe('kobo-minus');
    expect(toSlackName(talent, ': kobonk:')).toBe('kobo-kobonk');
    expect(toSlackName(talent, ': koboGG:')).toBe('kobo-gg');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': lightleft:', { separator: '_', prefixes: {} })).toBe('kobo_light_left');
    expect(toSlackName(talent, ': tch:', { separator: '-', prefixes: { [talent]: 'Xkobo' } })).toBe('xkobo-tch');
  });
});

describe('Machina X Flayon transform', () => {
  const talent = 'Machina X Flayon';

  it('names real emotes from the fetched JSON', () => {
    expect(toSlackName(talent, ': LiesOfP:')).toBe('flayon-lies-of-p');
    expect(toSlackName(talent, ': MachiLMAO:')).toBe('flayon-lmao');
    expect(toSlackName(talent, ': MachiRTRUS:')).toBe('flayon-rtrus');
    expect(toSlackName(talent, ': MrTrus:')).toBe('flayon-mr-trus');
    expect(toSlackName(talent, ': RoonAhh:')).toBe('flayon-roon-ahh');
    expect(toSlackName(talent, ': RoonEepy:')).toBe('flayon-roon-eepy');
  });

  it('respects the separator and prefix chosen in the export modal', () => {
    expect(toSlackName(talent, ': MachiLMAO:', { separator: '_', prefixes: {} })).toBe('flayon_lmao');
    expect(toSlackName(talent, ': LiesOfP:', { separator: '-', prefixes: { [talent]: 'Xflayon' } })).toBe('xflayon-lies-of-p');
  });
});

describe('registry helpers', () => {
  it('reports which talents have a transform', () => {
    expect(hasTalentTransform('Gigi Murin')).toBe(true);
    expect(hasTalentTransform('Unmapped Talent')).toBe(false);
  });

  it('returns default prefixes only for registered talents', () => {
    expect(
      getDefaultPrefixes(['Gigi Murin', 'Cecilia Immergreen', 'Raora Panthera', 'Elizabeth Rose Bloodflame', 'Mori Calliope', 'Ouro Kronii', 'Unmapped Talent']),
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
