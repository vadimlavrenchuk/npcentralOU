export interface ExtractResult {
  text?: string;
  error?: string;
  fileName?: string;
  detectedType?: string;
}

/**
 * Plain text from buffer (PDF, DOCX, images OCR, text).
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mime: string,
  fileName: string
): Promise<ExtractResult> {
  const m = mime.toLowerCase();

  try {
    let text = '';

    if (m === 'application/pdf') {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      try {
        const textResult = await parser.getText();
        text = textResult.text;
      } finally {
        await parser.destroy();
      }
    } else if (
      m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      m === 'application/msword'
    ) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (m.startsWith('image/')) {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(['eng', 'rus']);
      const {
        data: { text: ocrText },
      } = await worker.recognize(buffer);
      await worker.terminate();
      text = ocrText;
    } else if (m === 'text/plain' || m === '' || m === 'text/csv') {
      text = buffer.toString('utf-8');
    } else {
      text = buffer.toString('utf-8');
    }

    const cleaned = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    if (!cleaned) {
      return { error: 'Could not extract any text from this file.' };
    }

    return { text: cleaned, fileName, detectedType: mime };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Extraction failed.';
    return { error: msg };
  }
}
