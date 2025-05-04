import express from 'express';
import cors from 'cors';
import { verifyDocument, uploadMiddleware } from './controllers/verifyDocumentController';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.post('/verify-document', uploadMiddleware, verifyDocument);

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});