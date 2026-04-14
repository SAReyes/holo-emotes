import { splitCamelCaseWords, type TalentNamingExports } from '../shared';

const CECE_PREFIX = 'cece-';

export default {
  'Cecilia Immergreen': (inner: string): string => {
    let rest = inner;
    if (rest.startsWith('CeCe')) {
      rest = `${CECE_PREFIX}${rest.slice(4)}`;
    }
    if (rest.toLowerCase().startsWith(CECE_PREFIX)) {
      const suffix = rest.slice(CECE_PREFIX.length);
      rest = CECE_PREFIX + splitCamelCaseWords(suffix);
    } else {
      rest = splitCamelCaseWords(rest);
    }
    return rest.toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
  },
} satisfies TalentNamingExports;
