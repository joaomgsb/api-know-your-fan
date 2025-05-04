import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { analyzeDocument } from '../services/googleVisionService';
import { validateCPF } from '../utils/cpfValidator';

const upload = multer({ dest: 'uploads/' });
export const uploadMiddleware = upload.single('document');

export async function verifyDocument(req: Request, res: Response): Promise<any> {
  let filePath: string | undefined;
  let mimeType: string | undefined;

  try {
    if (req.file) {
      filePath = req.file.path;
      mimeType = req.file.mimetype;
    } 
    else if (req.body?.base64) {
      const base64Data = req.body.base64;
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);

      if (!matches) {
        return res.status(400).json({ error: 'Invalid base64 format' });
      }

      mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');

      const extensionMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'application/pdf': '.pdf',
      };
      const ext = mimeType && extensionMap[mimeType] ? extensionMap[mimeType] : '.tmp';

      const hash = crypto.randomBytes(16).toString('hex');
      filePath = path.join('uploads', `${hash}${ext}`);

      fs.writeFileSync(filePath, buffer);
    } 
    else {
      return res.status(400).json({ error: 'No file uploaded or base64 provided' });
    }

    if (!mimeType || (!mimeType.startsWith('image/') && mimeType !== 'application/pdf')) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const { text, confidence } = await analyzeDocument(filePath);


    const cpfRegex = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/;
    const cpfMatch = text.match(cpfRegex);

    let isCPFValid = false;
    let extractedCPF = null;

    if (cpfMatch) {
      extractedCPF = cpfMatch[0];
      isCPFValid = validateCPF(extractedCPF);
    }

    const containsName = text.toLowerCase().includes('nome');
    const containsCPF = cpfMatch !== null;
    const isDocumentValid = isCPFValid && containsName && containsCPF;

    return res.json({
      isDocumentValid,
      extractedCPF,
      isCPFValid,
      containsName,
      confidence,
      extractedText: text,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to process document', details: errorMessage });
  } finally {
    if (filePath) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
}