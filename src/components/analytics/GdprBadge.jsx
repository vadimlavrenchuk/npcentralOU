import { useTranslation } from 'react-i18next';

/**
 * @param {{ gdpr?: { redactedCount: number; redactedTypes?: Record<string, number> } }} props
 */
export default function GdprBadge({ gdpr }) {
  const { t } = useTranslation();

  const count = gdpr?.redactedCount ?? 0;
  const hasRedactions = count > 0;

  const breakdown = gdpr?.redactedTypes
    ? Object.entries(gdpr.redactedTypes)
        .filter(([, n]) => n > 0)
        .map(([cat, n]) => `${t(`analytics.gdpr.categories.${cat}`)}×${n}`)
        .join(', ')
    : '';

  return (
    <div
      title={t('analytics.gdpr.tooltip')}
      className={`analytics-gdpr-badge ${hasRedactions ? 'analytics-gdpr-badge--ok' : 'analytics-gdpr-badge--muted'}`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l5.59-5.58L18 8l-7 7z" />
      </svg>
      <span>{t('analytics.gdpr.badge')}</span>
      {gdpr !== undefined && (
        <span className="analytics-gdpr-badge__meta">
          {hasRedactions
            ? `· ${t('analytics.gdpr.itemsRedacted', { count })}`
            : `· ${t('analytics.gdpr.noneFound')}`}
        </span>
      )}
      {hasRedactions && breakdown && (
        <span className="analytics-gdpr-badge__breakdown" title={breakdown}>
          ({breakdown})
        </span>
      )}
    </div>
  );
}
