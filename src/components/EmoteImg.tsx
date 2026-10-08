import { localThumbPath } from '../emote-image';

interface Props {
  url: string;
  alt: string;
  class?: string;
  loading?: 'lazy' | 'eager';
}

export default function EmoteImg({ url, alt, class: className, loading }: Props) {
  const local = localThumbPath(url);
  return (
    <img
      src={local ?? url}
      alt={alt}
      class={className}
      loading={loading}
      decoding="async"
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src !== url) img.src = url;
      }}
    />
  );
}
