const multer = require('multer');
const path = require('path');
const mime = require('mime-types');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const validMimeTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
  const mimeType = mime.lookup(file.originalname);

  console.log('File originalname:', file.originalname);
  console.log('File extension:', path.extname(file.originalname).toLowerCase());
  console.log('File mimetype:', file.mimetype);
  console.log('MIME type from mime-types library:', mimeType);

  if (validMimeTypes.includes(file.mimetype) || mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Excel files only!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
