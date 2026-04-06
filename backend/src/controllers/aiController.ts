import { Request, Response } from 'express';
import { extractTextFromBuffer } from '../services/extractText';
import { processRawLog } from '../services/processRawLog';
import { getSpotPriceEE } from '../lib/energyApi';

/**
 * POST /api/ai/analyze
 * JSON body: { text?: string, locale?: string }
 * multipart: file (optional), text (optional), locale (optional)
 */
export const spotPrice = async (_req: Request, res: Response): Promise<void> => {
  try {
    const info = await getSpotPriceEE();
    res.json(info);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch spot price.';
    res.status(500).json({ error: msg });
  }
};

export const analyzeLog = async (req: Request, res: Response): Promise<void> => {
  try {
    let rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const locale = typeof req.body?.locale === 'string' ? req.body.locale : 'en';

    if (req.file) {
      const buf = req.file.buffer;
      const mime = req.file.mimetype || 'application/octet-stream';
      const extracted = await extractTextFromBuffer(buf, mime, req.file.originalname);
      if (extracted.error) {
        res.status(400).json({ success: false, error: extracted.error });
        return;
      }
      if (extracted.text) {
        rawText = extracted.text;
      }
    }

    if (!rawText) {
      res.status(400).json({
        success: false,
        error: 'Provide non-empty "text" in JSON or upload a file field named "file".',
      });
      return;
    }

    const result = await processRawLog(rawText, locale);
    const status = result.success ? 200 : 422;
    res.status(status).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Analysis failed.';
    res.status(500).json({ success: false, error: msg });
  }
};
