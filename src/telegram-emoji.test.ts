import { describe, expect, it } from 'vitest';
import { firstEmoji, isSingleEmoji, suggestEmoji, TALENT_EMOJI } from './telegram-emoji';

describe('suggestEmoji', () => {
  it('matches a keyword after the talent prefix is stripped', () => {
    expect(suggestEmoji('Gawr Gura', ': GuraComfy:')).toBe('😊');
    expect(suggestEmoji('Gawr Gura', ': GuraSmug:')).toBe('😏');
    expect(suggestEmoji('Momosuzu Nene', ': kusa:')).toBe('😂');
    expect(suggestEmoji('Ichijou Ririka', ': heart:')).toBe('❤️');
    expect(suggestEmoji('Mori Calliope', ': shock:')).toBe('😱');
    expect(suggestEmoji('Raora Panthera', ': eepy:')).toBe('😴');
    expect(suggestEmoji('Shiori Novella', ': shioriScissors:')).toBe('✂️');
    expect(suggestEmoji('Shiori Novella', ': shioriDeskSlam:')).toBe('💥');
    expect(suggestEmoji('Shiori Novella', ': shioriThereThere:')).toBe('🤗');
    expect(suggestEmoji('Shiori Novella', ': shioriStare:')).toBe('👀');
    expect(suggestEmoji('Shiori Novella', ': shioriDumpy:')).toBe('🍑');
    expect(suggestEmoji('Shiori Novella', ': shioriFacepaw:')).toBe('🤦');
  });

  it('prefers the earlier group when keys overlap', () => {
    expect(suggestEmoji('Gawr Gura', ': GuraBlueLight:')).toBe('💙');
    expect(suggestEmoji('Fuwawa & Mococo Abyssgard', ': fuwaLight:')).toBe('🔦');
    expect(suggestEmoji('Anya Melfissa', ': anyaThisIsFine:')).toBe('🙃');
  });

  it('ignores a numeric suffix on a word', () => {
    expect(suggestEmoji('Tokino Sora', ': hai1:')).toBe('👋');
    expect(suggestEmoji('Himemori Luna', ': penlight1:')).toBe('🔦');
  });

  it('labels letter and number stickers', () => {
    expect(suggestEmoji('Akai Haato', ': aaa:')).toBe('🔤');
    expect(suggestEmoji('Inugami Korone', ': koroneMoziro:')).toBe('🔤');
    expect(suggestEmoji('Hakui Koyori', ': こko:')).toBe('🔤');
    expect(suggestEmoji('Oozora Subaru', ': スバルすばるあ:')).toBe('🔤');
    expect(suggestEmoji('Vestia Zeta', ': o7zeta:')).toBe('🫡');
    expect(suggestEmoji('Shiranui Flare', ': 0241:')).toBe('🔢');
  });

  it('matches romanized Japanese names', () => {
    expect(suggestEmoji('Hakui Koyori', ': どやぁ:')).toBe('😏');
    expect(suggestEmoji('Tokoyami Towa', ': トワ様びっくり:')).toBe('❗');
    expect(suggestEmoji('Usada Pekora', ': pekoきらきら:')).toBe('✨');
  });

  it('matches short keywords only as whole words', () => {
    expect(suggestEmoji('Mori Calliope', ': Ripr:')).toBe('💀');
    expect(suggestEmoji('Murasaki Shion', ': shionてんさい:')).toBe('🧠');
    expect(suggestEmoji('Hoshimachi Suisei', ': suisei:')).toBe('☄️');
  });

  it("maps a reference to another talent to that talent's oshi mark", () => {
    expect(suggestEmoji("Ninomae Ina'nis", ': GURA:')).toBe('🔱');
    expect(suggestEmoji("Ninomae Ina'nis", ': CALLI:')).toBe('💀');
    expect(suggestEmoji('Shishiro Botan', ': ssrbねねち:')).toBe('🍑');
    expect(suggestEmoji('Yukihana Lamy', ': ししろん:')).toBe('♌');
    expect(suggestEmoji('Shirogane Noel', ': まりん:')).toBe('🏴‍☠️');
  });

  it('reads the talent emoji from the scraped oshi mark', () => {
    expect(TALENT_EMOJI['Momosuzu Nene']).toBe('🍑');
    expect(TALENT_EMOJI['Shishiro Botan']).toBe('♌');
    expect(TALENT_EMOJI['Tokino Sora']).toBe('🐻');
    expect(firstEmoji('♌')).toBe('♌');
    expect(firstEmoji('♥')).toBe('♥️');
    expect(firstEmoji('☄')).toBe('☄️');
    expect(firstEmoji('🍑🥟')).toBe('🍑');
    expect(firstEmoji('none')).toBeNull();
  });

  it('falls back to the talent emoji, then a star', () => {
    expect(suggestEmoji('Kaela Kovalskia', ': pimok:')).toBe('🔨');
    expect(suggestEmoji('Unknown Talent', ': pimok:')).toBe('⭐');
  });
});

describe('isSingleEmoji', () => {
  it('accepts one emoji grapheme including sequences', () => {
    expect(isSingleEmoji('😂')).toBe(true);
    expect(isSingleEmoji('🏴‍☠️')).toBe(true);
    expect(isSingleEmoji('😵‍💫')).toBe(true);
    expect(isSingleEmoji(' ❤️ ')).toBe(true);
  });

  it('rejects text, several emoji, and empty input', () => {
    expect(isSingleEmoji('a')).toBe(false);
    expect(isSingleEmoji('😂😂')).toBe(false);
    expect(isSingleEmoji('')).toBe(false);
    expect(isSingleEmoji('1')).toBe(false);
  });
});
