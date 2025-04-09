// pages/api/resize.js
import fs from 'fs';
import formidable from 'formidable';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js’s default body parser so we can use formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Initialize formidable with a 10MB file size limit
  const form = new formidable.IncomingForm({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: 'Error parsing the form data' });
    }
    
    // Determine target dimensions—defaulting to 112x112 if not specified
    const width = parseInt(fields.width) || 112;
    const height = parseInt(fields.height) || 112;
    
    // Get the uploaded file information
    const file = files.image;
    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    try {
      // Read the uploaded file into a buffer
      const inputBuffer = await fs.promises.readFile(file.filepath);
      
      // Use sharp to resize the image to specified dimensions
      const resizedBuffer = await sharp(inputBuffer)
        .resize(width, height, { fit: 'cover' })
        .toBuffer();
      
      // Determine the MIME type and filename; if not available, fall back to defaults.
      const contentType = file.mimetype || 'image/png';
      const originalFilename = file.originalFilename || 'image.png';
      
      // Set response headers to force a file download (optional)
      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="resized_${originalFilename}"`
      );
      
      // Send the resized image buffer as the response
      return res.status(200).send(resizedBuffer);
    } catch (error) {
      console.error('Error during image processing:', error);
      return res.status(500).json({ error: 'Image processing error' });
    }
  });
}
