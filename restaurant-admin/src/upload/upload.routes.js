import { Router } from 'express';
import { upload } from '../../configs/upload.configuration.js';

const router = Router();

/**
 * POST /restaurantAdmin/v1/upload
 * Field name: "file"  |  Max size: 5 MB  |  Types: jpg, png, webp, gif
 * Returns { success: true, url: "http://host/uploads/filename.ext" }
 */
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });
  }
  const protocol = req.protocol;
  const host     = req.get('host');
  const url      = `${protocol}://${host}/uploads/${req.file.filename}`;
  return res.status(201).json({ success: true, url });
});

// Multer error handler
router.use((err, _req, res, _next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'La imagen no puede superar los 5 MB' });
  }
  return res.status(400).json({ success: false, message: err?.message ?? 'Error al subir archivo' });
});

export default router;
