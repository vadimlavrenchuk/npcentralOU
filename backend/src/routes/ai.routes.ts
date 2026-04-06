import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { analyzeLog, spotPrice } from '../controllers/aiController';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

function maybeMultipart(req: Request, res: Response, next: NextFunction): void {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    upload.single('file')(req, res, next);
  } else {
    next();
  }
}

router.get('/spot-price', spotPrice);
router.post('/analyze', maybeMultipart, analyzeLog);

export default router;
