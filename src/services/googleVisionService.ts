import dotenv from 'dotenv';
dotenv.config();

import { ImageAnnotatorClient } from '@google-cloud/vision';

const client = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }
});

export async function analyzeDocument(filePath: string): Promise<{ text: string; confidence: number }> {
  const [result] = await client.documentTextDetection(filePath);
  const fullText = result.fullTextAnnotation?.text || '';
  const pages = result.fullTextAnnotation?.pages || [];

  let totalConfidence = 0;
  let count = 0;

  for (const page of pages) {
    for (const block of page.blocks ?? []) {
      totalConfidence += block.confidence ?? 0;
      count++;
    }
  }

  const averageConfidence = count > 0 ? totalConfidence / count : 0;

  return {
    text: fullText,
    confidence: averageConfidence
  };
}
