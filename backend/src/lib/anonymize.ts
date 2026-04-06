/**
 * GDPR-compliant PII anonymizer for production log text.
 */

export type PiiCategory =
  | 'email'
  | 'phone'
  | 'personal_id'
  | 'company_id'
  | 'ip'
  | 'address'
  | 'name';

export interface AnonymizeResult {
  text: string;
  redactedCount: number;
  redactedTypes: Partial<Record<PiiCategory, number>>;
}

type ReplaceFn = (match: string, ...args: unknown[]) => string;

interface Rule {
  category: PiiCategory;
  pattern: RegExp;
  replacement: string | ReplaceFn;
}

const RULES: Rule[] = [
  {
    category: 'email',
    pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: '[EMAIL]',
  },
  {
    category: 'personal_id',
    pattern: /\b[1-6]\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{4}\b/g,
    replacement: '[ISIKUKOOD]',
  },
  {
    category: 'company_id',
    pattern: /\b(?:reg(?:\.?\s*(?:kood|nr|number|код))?\.?:?\s*)\d{8}\b/gi,
    replacement: '[REG_CODE]',
  },
  {
    category: 'phone',
    pattern: /\+372[\s\-]?\d{3,4}[\s\-]?\d{3,4}/g,
    replacement: '[PHONE]',
  },
  {
    category: 'phone',
    pattern: /\+\d{1,3}[\s\-]?(?:\d[\s\-]?){6,13}\d/g,
    replacement: '[PHONE]',
  },
  {
    category: 'phone',
    pattern: /\b(?:5|8)\d{7}\b/g,
    replacement: '[PHONE]',
  },
  {
    category: 'ip',
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    replacement: '[IP]',
  },
  {
    category: 'ip',
    pattern: /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/g,
    replacement: '[IP]',
  },
  {
    category: 'address',
    pattern:
      /[A-ZÄÖÜÕ][a-zäöüõ\s]+?\s+(?:tn|tee|pst|puiestee|allee|plats|väljak|mnt|maantee)\.?\s*\d+[a-z]?(?:[-\/]\d+[a-z]?)?\b/gi,
    replacement: '[ADDRESS]',
  },
  {
    category: 'address',
    pattern:
      /(?:ул\.|улица|пр\.|проспект|пер\.|переулок|бул\.|бульвар|пл\.|площадь)\s+[А-ЯЁа-яё\s\-]+(?:,?\s*д\.?\s*\d+)?/gi,
    replacement: '[ADDRESS]',
  },
  {
    category: 'address',
    pattern:
      /\d+\s+[A-Z][a-zA-Z\s]+\s+(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\.?\b/gi,
    replacement: '[ADDRESS]',
  },
  {
    category: 'name',
    pattern:
      /(?:оператор|мастер|техник|наладчик|слесарь|ответственный|инженер|диспетчер|оператора|operator|technician|engineer|mechanic|dispatcher|responsible|by|reported\s+by|submitted\s+by|inspector)[\s:.\-–—]+([A-ZÄÖÜÕА-ЯЁ][a-zäöüõа-яё]+(?:\s+[A-ZÄÖÜÕА-ЯЁ][a-zäöüõа-яё]+){1,2})/gi,
    replacement: (match: string) =>
      match.replace(/[A-ZÄÖÜÕА-ЯЁ][a-zäöüõа-яё]+(?:\s+[A-ZÄÖÜÕА-ЯЁ][a-zäöüõа-яё]+){1,2}$/, '[NAME]'),
  },
];

export function anonymizeText(raw: string): AnonymizeResult {
  const redactedTypes: Partial<Record<PiiCategory, number>> = {};
  let text = raw;
  let redactedCount = 0;

  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    const { replacement } = rule;
    text = text.replace(rule.pattern, (match: string, ...args: unknown[]) => {
      redactedCount++;
      redactedTypes[rule.category] = (redactedTypes[rule.category] ?? 0) + 1;
      return typeof replacement === 'function' ? replacement(match, ...args) : replacement;
    });
    rule.pattern.lastIndex = 0;
  }

  return { text, redactedCount, redactedTypes };
}
