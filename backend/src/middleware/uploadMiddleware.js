const multer = require('multer');
const path = require('path');
const mime = require('mime-types');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const validMimeTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
  const mimeType = mime.lookup(file.originalname);

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
