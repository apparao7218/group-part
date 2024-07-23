const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const ExcelSheet = require('../models/excel');
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const workbook = XLSX.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const rows = data.map((row, index) => ({
    row: index + 1,
    columns: row.reduce((acc, value, colIndex) => {
      acc[`column${colIndex + 1}`] = value;
      return acc;
    }, {}),
  }));

  const excelSheet = new ExcelSheet({
    name: req.file.originalname,
    data: rows,
  });

  try {
    await excelSheet.save();
    res.status(201).send('File uploaded and data stored successfully.');
  } catch (error) {
    res.status(500).send('Error storing data.');
  }
});

module.exports = router;
