import type { TalentNamingExports } from '../shared';

const RAO_PREFIX = 'rao-';

export default {
  'Raora Panthera': (inner: string): string => {
    return (RAO_PREFIX + inner).toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
  },
} satisfies TalentNamingExports;
