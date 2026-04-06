import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import GdprBadge from './GdprBadge.jsx';
import SessionChart from './SessionChart.jsx';
import { exportToPdf } from '../../lib/ai/exportPdf';
import { exportToExcel } from '../../lib/ai/exportExcel';

/** @typedef {import('../../types/aiProcessLog').ProcessResult} ProcessResult */
/** @typedef {import('../../types/aiProcessLog').ParsedLogEntry} ParsedLogEntry */
/** @typedef {import('../../types/aiProcessLog').FinancialSummary} FinancialSummary */
/** @typedef {import('../../types/aiProcessLog').SpotPriceInfo} SpotPriceInfo */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EVENT_STYLES = {
  setup: { bg: 'analytics-event--setup' },
  work: { bg: 'analytics-event--work' },
  downtime: { bg: 'analytics-event--downtime' },
  failure: { bg: 'analytics-event--failure' },
};

function fmt(n) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function getDuration(start, end) {
  try {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  } catch {
    return '—';
  }
}

function mapUiLocale(lang) {
  const m = { en: 'en', et: 'et', ru: 'ru', fi: 'en' };
  return m[lang] || 'en';
}

function authHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** @param {string} text @param {string} locale */
async function analyzeWithText(text, locale) {
  const { data } = await axios.post(
    `${API_BASE}/ai/analyze`,
    { text, locale },
    { headers: { ...authHeaders() } }
  );
  return data;
}

/** @param {File} file @param {string} locale */
async function analyzeWithFile(file, locale) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('locale', locale);
  const { data } = await axios.post(`${API_BASE}/ai/analyze`, fd, {
    headers: {
      ...authHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

async function fetchSpotPrice() {
  const { data } = await axios.get(`${API_BASE}/ai/spot-price`, { headers: { ...authHeaders() } });
  return data;
}

function StatCell({ label, value, highlight }) {
  return (
    <div className="analytics-stat-cell">
      <span className="analytics-stat-cell__label">{label}</span>
      <span className={highlight ? 'analytics-stat-cell__value analytics-stat-cell__value--alert' : 'analytics-stat-cell__value'}>
        {value}
      </span>
    </div>
  );
}

function FinancialSummaryBlock({ summary, analystConclusion, tFin }) {
  const hasLeak = summary.totalProfitLeak > 0;
  return (
    <div className="analytics-summary">
      <div className="analytics-summary__grid">
        <div className="analytics-summary__box">
          <p className="analytics-summary__label">{tFin('totalCost')}</p>
          <p className="analytics-summary__value">€{fmt(summary.totalCost)}</p>
          <p className="analytics-summary__hint">{tFin('totalCostDesc')}</p>
        </div>
        <div className={`analytics-summary__box ${hasLeak ? 'analytics-summary__box--leak' : ''}`}>
          <p className="analytics-summary__label">{tFin('profitLeak')}</p>
          <p className={hasLeak ? 'analytics-summary__value analytics-summary__value--red' : 'analytics-summary__value'}>
            €{fmt(summary.totalProfitLeak)}
          </p>
          <p className="analytics-summary__hint">{hasLeak ? tFin('profitLeakDesc') : tFin('profitLeakNone')}</p>
        </div>
      </div>
      {analystConclusion && (
        <div className="analytics-summary__ai">
          <div className="analytics-summary__ai-head">
            <span className="analytics-summary__ai-badge">AI</span>
            <span className="analytics-summary__ai-title">{tFin('aiTitle')}</span>
          </div>
          <p className="analytics-summary__ai-text">{analystConclusion}</p>
        </div>
      )}
    </div>
  );
}

function EventCard({ entry, index, tCard, tTypes }) {
  const cfg = EVENT_STYLES[entry.type] ?? { bg: 'analytics-event--default' };
  const f = entry.financials;
  const hasLeak = f.profitLeak > 0;
  const label = tTypes(entry.type);

  return (
    <div className={`analytics-event ${cfg.bg}`}>
      <div className="analytics-event__head">
        <div className="analytics-event__machine">
          <span className="analytics-event__dot" />
          <span className="analytics-event__id">{entry.machineId}</span>
          <span className="analytics-event__num">#{index + 1}</span>
        </div>
        <span className="analytics-event__type">{label}</span>
      </div>
      <div className="analytics-event__grid">
        <StatCell label={tCard('start')} value={formatDateTime(entry.startTime)} />
        <StatCell label={tCard('end')} value={formatDateTime(entry.endTime)} />
        <StatCell label={tCard('duration')} value={getDuration(entry.startTime, entry.endTime)} />
        <StatCell label={tCard('wear')} value={`${entry.toolWear}%`} highlight={entry.toolWear > 70} />
        <StatCell label={tCard('energy')} value={`${entry.energyConsumed} kWh`} />
        <StatCell label={tCard('air')} value={`${entry.airConsumed} m³`} />
        <StatCell label={tCard('cost')} value={`€${fmt(f.totalCost)}`} />
        {hasLeak && <StatCell label={tCard('profitLeak')} value={`€${fmt(f.profitLeak)}`} highlight />}
      </div>
      <div className="analytics-event__pills">
        <span className="analytics-pill">
          {tCard('laborOverhead')}: €{fmt(f.laborCost)}
        </span>
        <span className="analytics-pill">
          {tCard('energyCost')}: €{fmt(f.energyCost)}
        </span>
        <span className="analytics-pill">
          {tCard('airCost')}: €{fmt(f.airCost)}
        </span>
      </div>
      {entry.notes && <p className="analytics-event__notes">{entry.notes}</p>}
    </div>
  );
}

function ActionPlanCard({ items, t }) {
  return (
    <div className="analytics-action-plan">
      <div className="analytics-action-plan__head">
        <div className="analytics-action-plan__icon">✓</div>
        <div>
          <p className="analytics-action-plan__title">{t('analytics.actionPlan.title')}</p>
          <p className="analytics-action-plan__sub">{t('analytics.actionPlan.subtitle')}</p>
        </div>
      </div>
      <ol className="analytics-action-plan__list">
        {items.map((item, i) => (
          <li key={i} className="analytics-action-plan__item">
            <span className="analytics-action-plan__num">{i + 1}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ExportButtons({ data, summary, analystConclusion, actionPlan, t, tFin }) {
  const tExp = (k) => t(`analytics.export.${k}`);
  const tTypes = (k) => t(`analytics.eventTypes.${k}`);
  const eventTypes = {
    setup: tTypes('setup'),
    work: tTypes('work'),
    downtime: tTypes('downtime'),
    failure: tTypes('failure'),
  };
  const columns = {
    machine: tExp('columns.machine'),
    type: tExp('columns.type'),
    start: tExp('columns.start'),
    end: tExp('columns.end'),
    durationH: tExp('columns.durationH'),
    energy: tExp('columns.energy'),
    air: tExp('columns.air'),
    wear: tExp('columns.wear'),
    cost: tExp('columns.cost'),
    laborCost: tExp('columns.laborCost'),
    energyCost: tExp('columns.energyCost'),
    airCost: tExp('columns.airCost'),
    profitLeak: tExp('columns.profitLeak'),
    notes: tExp('columns.notes'),
  };

  const handlePdf = () => {
    try {
      exportToPdf(data, summary, analystConclusion, actionPlan, {
        reportTitle: tExp('reportTitle'),
        generatedOn: tExp('generatedOn'),
        machinesLabel: tExp('machinesLabel'),
        gdprFooter: tExp('gdprFooter'),
        totalCost: tFin('totalCost'),
        profitLeak: tFin('profitLeak'),
        analystTitle: tFin('aiTitle'),
        actionPlanTitle: t('analytics.actionPlan.title'),
        sheetEvents: tExp('sheetEvents'),
        columns,
        eventTypes,
      });
    } catch (err) {
      alert('PDF: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleExcel = () => {
    exportToExcel(data, summary, {
      sheetEvents: tExp('sheetEvents'),
      sheetSummary: tExp('sheetSummary'),
      totalCost: tFin('totalCost'),
      profitLeak: tFin('profitLeak'),
      gdprNote: tExp('gdprNote'),
      generatedOn: tExp('generatedOn'),
      eventTypes,
      columns,
    });
  };

  return (
    <div className="analytics-export-grid">
      <button type="button" className="analytics-export-btn analytics-export-btn--pdf" onClick={handlePdf}>
        <span className="analytics-export-btn__icon">PDF</span>
        <span>
          <span className="analytics-export-btn__title">{tExp('pdf')}</span>
          <span className="analytics-export-btn__desc">{tExp('pdfDesc')}</span>
        </span>
      </button>
      <button type="button" className="analytics-export-btn analytics-export-btn--xls" onClick={handleExcel}>
        <span className="analytics-export-btn__icon">XLS</span>
        <span>
          <span className="analytics-export-btn__title">{tExp('excel')}</span>
          <span className="analytics-export-btn__desc">{tExp('excelDesc')}</span>
        </span>
      </button>
    </div>
  );
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt', '.log', '.csv'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/tiff': ['.tiff', '.tif'],
};

const EXAMPLE_LOG = `Станок: CNC-07
12.03.2024 07:45 — Переналадка на деталь А-112. Смена инструмента Т4.
12.03.2024 08:10 — Запуск серии. Производство 240 шт.
12.03.2024 12:30 — Остановка: поломка шпинделя. Вызван механик.
12.03.2024 14:00 — Ремонт завершён, возобновление работы.
12.03.2024 17:00 — Конец смены. Итого выпущено 410 шт.`;

/** @type {ProcessResult} */
const DEMO_RESULT = {
  success: true,
  savedIds: ['demo1', 'demo2', 'demo3', 'demo4'],
  financialSummary: { totalCost: 481.54, totalProfitLeak: 87.5 },
  spotPrice: {
    price: 0.0823,
    priceMWh: 82.3,
    hourLabel: '14:00',
    isFallback: false,
    fetchedAt: new Date().toISOString(),
  },
  actionPlan: [
    'Сократить время переналадки CNC-07 с 25 до 10 минут — внедрить чек-лист быстрой смены инструмента, экономия ~€87 за сессию',
    'Запланировать ТО шпинделя CNC-07 каждые 200 ч работы для предотвращения аварийных остановок (~€52/остановка)',
    'Перенести энергоёмкое производство на 02:00–06:00, когда тариф Nord Pool EE минимален (~-30% к энергозатратам)',
  ],
  analystConclusion:
    'На производстве CNC-07 наблюдаются аномально высокие затраты на переналадку: фактическое время составило 25 минут при нормативе 10 минут. Авария шпинделя привела к простою на 1,5 часа, стоимость которого составила €52.50. Если оптимизировать процесс наладки и внедрить плановое техобслуживание шпинделя, можно сэкономить примерно €320 евро в месяц.',
  data: [
    {
      machineId: 'CNC-07',
      type: 'setup',
      startTime: '2024-03-12T07:45:00',
      endTime: '2024-03-12T08:10:00',
      energyConsumed: 2.5,
      airConsumed: 1.2,
      toolWear: 5,
      notes: 'Переналадка на деталь А-112. Смена инструмента Т4.',
      financials: {
        durationHours: 0.417,
        laborCost: 14.58,
        energyCost: 0.45,
        airCost: 0.06,
        totalCost: 15.09,
        profitLeak: 87.5,
      },
    },
    {
      machineId: 'CNC-07',
      type: 'work',
      startTime: '2024-03-12T08:10:00',
      endTime: '2024-03-12T12:30:00',
      energyConsumed: 38.5,
      airConsumed: 18.0,
      toolWear: 32,
      notes: 'Производство серии. Выпущено 240 шт.',
      financials: {
        durationHours: 4.33,
        laborCost: 151.67,
        energyCost: 6.93,
        airCost: 0.9,
        totalCost: 159.5,
        profitLeak: 0,
      },
    },
    {
      machineId: 'CNC-07',
      type: 'failure',
      startTime: '2024-03-12T12:30:00',
      endTime: '2024-03-12T14:00:00',
      energyConsumed: 0,
      airConsumed: 0,
      toolWear: 0,
      notes: 'Поломка шпинделя. Вызван механик.',
      financials: {
        durationHours: 1.5,
        laborCost: 52.5,
        energyCost: 0,
        airCost: 0,
        totalCost: 52.5,
        profitLeak: 0,
      },
    },
    {
      machineId: 'CNC-07',
      type: 'work',
      startTime: '2024-03-12T14:00:00',
      endTime: '2024-03-12T17:00:00',
      energyConsumed: 27.0,
      airConsumed: 12.5,
      toolWear: 58,
      notes: 'Возобновление работы. Итого за смену: 410 шт.',
      financials: {
        durationHours: 3.0,
        laborCost: 105.0,
        energyCost: 4.86,
        airCost: 0.63,
        totalCost: 110.49,
        profitLeak: 0,
      },
    },
  ],
};

function EnergyPriceBadge({ spotPrice, t }) {
  return (
    <div className="analytics-energy-badge">
      <span className={`analytics-energy-badge__dot ${spotPrice.isFallback ? 'analytics-energy-badge__dot--warn' : ''}`} />
      <span className="analytics-energy-badge__text">
        {t('analytics.energyLabel')}: <strong>{spotPrice.price.toFixed(4)}</strong> {t('analytics.energyUnit')}
        {spotPrice.isFallback && <span className="analytics-energy-badge__fallback"> ({t('analytics.energyFallback')})</span>}
      </span>
      <span className="analytics-energy-badge__src">· {t('analytics.energySource')}</span>
    </div>
  );
}

function ProgressStepper({ stage, fileName, t }) {
  if (stage === 'idle') return null;
  const steps = [
    { id: 'analyzing', label: t('analytics.upload.step2') },
    { id: 'done', label: t('analytics.upload.step3') },
  ];
  const activeIdx = stage === 'analyzing' ? 0 : stage === 'done' ? 1 : -1;

  return (
    <div className="analytics-progress">
      {fileName && stage === 'analyzing' && (
        <p className="analytics-progress__file">
          {t('analytics.upload.extractingFile')}: <strong>{fileName}</strong>
        </p>
      )}
      <div className="analytics-progress__steps">
        {steps.map((step, i) => {
          const isDone = i < activeIdx;
          const isActive = i === activeIdx;
          return (
            <div key={step.id} className="analytics-progress__step-wrap">
              <div className="analytics-progress__step">
                <div
                  className={`analytics-progress__circle ${
                    isDone ? 'analytics-progress__circle--done' : isActive ? 'analytics-progress__circle--active' : ''
                  }`}
                >
                  {isDone ? '✓' : isActive ? '…' : i + 1}
                </div>
                <span className={isDone || isActive ? 'analytics-progress__label--on' : 'analytics-progress__label'}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`analytics-progress__bar ${i < activeIdx ? 'analytics-progress__bar--on' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LogAnalyzer() {
  const { t, i18n } = useTranslation();
  const apiLocale = mapUiLocale(i18n.language);

  const [text, setText] = useState('');
  /** @type {[ProcessResult | null, function]} */
  const [result, setResult] = useState(null);
  const [uploadStage, setUploadStage] = useState('idle');
  const [uploadFileName, setUploadFileName] = useState('');
  /** @type {[SpotPriceInfo | null, function]} */
  const [initialSpot, setInitialSpot] = useState(null);

  const isBusy = uploadStage === 'analyzing';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await fetchSpotPrice();
        if (!cancelled) setInitialSpot(p);
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displaySpotPrice = result?.spotPrice ?? initialSpot;

  /** @param {string} rawText */
  async function runAnalysis(rawText) {
    setUploadStage('analyzing');
    setResult(null);
    try {
      const res = await analyzeWithText(rawText, apiLocale);
      setResult(res);
      setUploadStage('done');
    } catch (e) {
      const msg = axios.isAxiosError(e) ? e.response?.data?.error || e.message : String(e);
      setResult({ success: false, error: msg });
      setUploadStage('error');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setUploadFileName('');
    await runAnalysis(text);
  }

  const handleFilePicked = useCallback(
    async (file) => {
      setUploadFileName(file.name);
      setUploadStage('analyzing');
      setResult(null);
      setText('');
      try {
        const res = await analyzeWithFile(file, apiLocale);
        setResult(res);
        setUploadStage('done');
      } catch (e) {
        const msg = axios.isAxiosError(e) ? e.response?.data?.error || e.message : String(e);
        setResult({ success: false, error: msg });
        setUploadStage('error');
      }
    },
    [apiLocale]
  );

  const onDrop = useCallback(
    (accepted) => {
      if (accepted[0]) handleFilePicked(accepted[0]);
    },
    [handleFilePicked]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled: isBusy,
  });

  const lastFile = acceptedFiles[0];

  return (
    <div className="analytics-log">
      <header className="analytics-log__header">
        <div className="analytics-log__header-inner">
          <div>
            <h1 className="analytics-log__title">{t('analytics.title')}</h1>
            <p className="analytics-log__subtitle">{t('analytics.subtitle')}</p>
          </div>
        </div>
        {displaySpotPrice && (
          <div className="analytics-log__energy">
            <EnergyPriceBadge spotPrice={displaySpotPrice} t={t} />
          </div>
        )}
      </header>

      <main className="analytics-log__main">
        <ProgressStepper stage={uploadStage} fileName={uploadFileName} t={t} />

        <form onSubmit={handleSubmit} className="analytics-log__form">
          <div
            {...getRootProps()}
            className={`analytics-dropzone ${isDragActive ? 'analytics-dropzone--active' : ''} ${isBusy ? 'analytics-dropzone--disabled' : ''}`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <>
                <div className="analytics-dropzone__emoji">📂</div>
                <p className="analytics-dropzone__title">{t('analytics.upload.dragActive')}</p>
              </>
            ) : lastFile ? (
              <>
                <div className="analytics-dropzone__emoji">📄</div>
                <p className="analytics-dropzone__title">{lastFile.name}</p>
                <p className="analytics-dropzone__hint">
                  {(lastFile.size / 1024).toFixed(0)} KB · {t('analytics.upload.dropzoneHint')}
                </p>
              </>
            ) : (
              <>
                <p className="analytics-dropzone__title">{t('analytics.upload.dropzoneTitle')}</p>
                <p className="analytics-dropzone__hint">{t('analytics.upload.dropzoneHint')}</p>
              </>
            )}
          </div>

          <div className="analytics-log__divider">
            <span>{t('analytics.upload.orPasteText')}</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('analytics.form.placeholder')}
            rows={8}
            disabled={isBusy}
            className="analytics-textarea"
          />

          <div className="analytics-log__actions">
            <button type="submit" disabled={isBusy || !text.trim()} className="analytics-btn analytics-btn--primary">
              {uploadStage === 'analyzing' && !uploadFileName ? t('analytics.form.submitting') : t('analytics.form.submit')}
            </button>
            <button
              type="button"
              disabled={isBusy}
              className="analytics-btn analytics-btn--ghost"
              onClick={() => {
                setText(EXAMPLE_LOG);
                setUploadStage('idle');
              }}
            >
              {t('analytics.form.example')}
            </button>
            <button
              type="button"
              disabled={isBusy}
              className="analytics-btn analytics-btn--ghost"
              onClick={() => {
                setResult(DEMO_RESULT);
                setUploadStage('done');
              }}
            >
              {t('analytics.form.demo')}
            </button>
          </div>
        </form>

        {result && (
          <>
            {result.success && result.data ? (
              <div className="analytics-results">
                <div className="analytics-results__meta">
                  <span className="analytics-badge-ok">{t('analytics.status.ready')}</span>
                  <span>
                    {t('analytics.status.events')}: <strong>{result.data.length}</strong> · {t('analytics.status.saved')}:{' '}
                    <strong>{result.savedIds?.length ?? 0}</strong>
                  </span>
                  <GdprBadge gdpr={result.gdpr} />
                </div>

                {result.financialSummary && (
                  <>
                    <FinancialSummaryBlock
                      summary={result.financialSummary}
                      analystConclusion={result.analystConclusion}
                      tFin={(k) => t(`analytics.financial.${k}`)}
                    />
                    <SessionChart data={result.data} />
                    {result.actionPlan && result.actionPlan.length > 0 && (
                      <ActionPlanCard items={result.actionPlan} t={t} />
                    )}
                    <ExportButtons
                      data={result.data}
                      summary={result.financialSummary}
                      analystConclusion={result.analystConclusion}
                      actionPlan={result.actionPlan}
                      t={t}
                      tFin={(k) => t(`analytics.financial.${k}`)}
                    />
                  </>
                )}

                <div className="analytics-events-list">
                  {result.data.map((entry, i) => (
                    <EventCard
                      key={i}
                      entry={entry}
                      index={i}
                      tCard={(k) => t(`analytics.eventCard.${k}`)}
                      tTypes={(k) => t(`analytics.eventTypes.${k}`)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="analytics-error">
                <p className="analytics-error__title">
                  {t('analytics.error.prefix')}: {result.error}
                </p>
                {result.rawResponse && (
                  <details>
                    <summary>{t('analytics.error.rawLabel')}</summary>
                    <pre className="analytics-error__pre">{result.rawResponse}</pre>
                  </details>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
