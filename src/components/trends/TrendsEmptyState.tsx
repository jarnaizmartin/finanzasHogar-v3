import { useTranslation } from 'react-i18next';
import type { Theme } from '../../theme';

interface Props {
  T: Theme;
}

export function TrendsEmptyState({ T }: Props) {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem', color: T.muted }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📉</div>
      <p style={{ fontSize: '1.125rem', fontWeight: 800, color: T.title, marginBottom: '0.5rem' }}>
        {t('trends.emptyTitle')}
      </p>
      <p style={{ fontSize: '0.875rem', color: T.muted }}>
        {t('trends.emptyBody')}
      </p>
    </div>
  );
}
