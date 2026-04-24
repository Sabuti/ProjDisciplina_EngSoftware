import { Router } from 'express';
import multer from 'multer';
import pocketbaseClient from '../utils/pocketbaseClient.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import logger from '../utils/logger.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

/**
 * Native JavaScript CSV parser
 * Handles quoted fields, commas within quotes, and whitespace trimming
 */
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const records = [];
  let headers = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      continue;
    }

    // Parse the CSV line, respecting quoted fields
    const fields = parseCSVLine(line);

    // First non-empty line is headers
    if (!headers) {
      headers = fields.map(field => field.trim());
      continue;
    }

    // Create object with header keys
    const record = {};
    headers.forEach((header, index) => {
      record[header] = fields[index] ? fields[index].trim() : '';
    });

    records.push(record);
  }

  return records;
}

/**
 * Parse a single CSV line, respecting quoted fields
 * Handles: "field with, comma", normal_field, "quoted \"nested\" quotes"
 */
function parseCSVLine(line) {
  const fields = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" becomes "
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    }

    if (char === ',' && !insideQuotes) {
      // Field separator found outside quotes
      fields.push(currentField);
      currentField = '';
      i++;
      continue;
    }

    // Regular character
    currentField += char;
    i++;
  }

  // Add the last field
  fields.push(currentField);

  return fields;
}

function validateCSVFormat(records, tipo) {
  if (!records || records.length === 0) {
    throw new Error('CSV file is empty');
  }

  if (tipo === 'grade_curricular') {
    // Expected columns: codigo, nome, creditos, periodo, prerequisitos
    const requiredColumns = ['codigo', 'nome', 'creditos', 'periodo'];
    const firstRecord = records[0];
    const hasRequiredColumns = requiredColumns.every(col => col in firstRecord);
    
    if (!hasRequiredColumns) {
      throw new Error(`CSV must contain columns: ${requiredColumns.join(', ')}`);
    }
  } else if (tipo === 'historico_escolar') {
    // Expected columns: matricula, disciplina, nota, periodo
    const requiredColumns = ['matricula', 'disciplina', 'nota', 'periodo'];
    const firstRecord = records[0];
    const hasRequiredColumns = requiredColumns.every(col => col in firstRecord);
    
    if (!hasRequiredColumns) {
      throw new Error(`CSV must contain columns: ${requiredColumns.join(', ')}`);
    }
  } else {
    throw new Error('tipo must be either "grade_curricular" or "historico_escolar"');
  }

  return true;
}

router.post('/upload', upload.single('file'), async (req, res) => {
  const { tipo } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  if (!tipo) {
    return res.status(400).json({ error: 'tipo parameter is required (grade_curricular or historico_escolar)' });
  }

  // Parse CSV using native JavaScript parser
  const csvContent = req.file.buffer.toString('utf-8');
  const records = parseCSV(csvContent);

  // Validate CSV format
  validateCSVFormat(records, tipo);

  // Create record in PocketBase with status='processado'
  const uploadRecord = await pocketbaseClient.collection('csv_uploads').create({
    tipo,
    status: 'processado',
    data_upload: new Date().toISOString(),
    arquivo_nome: req.file.originalname,
    linhas_processadas: records.length,
  });

  logger.info(`CSV upload successful: ${uploadRecord.id}, tipo: ${tipo}, records: ${records.length}`);

  res.json({
    success: true,
    message: `CSV file uploaded successfully with ${records.length} records`,
    uploadId: uploadRecord.id,
  });
});

router.get('/uploads', pocketbaseAuth, async (req, res) => {
  // Require authentication
  if (!req.pocketbaseUserId) {
    throw new Error('Authentication required');
  }

  const uploads = await pocketbaseClient.collection('csv_uploads').getFullList({
    sort: '-data_upload',
  });

  const formattedUploads = uploads.map(upload => ({
    id: upload.id,
    tipo: upload.tipo,
    status: upload.status,
    data_upload: upload.data_upload,
    mensagem_erro: upload.mensagem_erro || null,
    arquivo_nome: upload.arquivo_nome,
    linhas_processadas: upload.linhas_processadas,
  }));

  res.json(formattedUploads);
});

export default router;
