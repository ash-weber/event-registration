const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter(req, file, cb) {
    const okExt = /\.(csv|xlsx|xls)$/i.test(file.originalname);
    const okMime = ALLOWED_MIME.includes(file.mimetype) || file.mimetype === 'application/octet-stream';
    if (okExt || okMime) return cb(null, true);
    cb(new ApiError(400, 'Only .csv, .xlsx or .xls files are allowed.'));
  },
});

module.exports = upload;