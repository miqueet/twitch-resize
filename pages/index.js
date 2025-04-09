// pages/index.js
import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export default function Home() {
  const [resizedUrl, setResizedUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const fileInput = form.image;
    const file = fileInput.files[0];

    // Define maximum allowed file size (e.g., 5MB)
    const maxAllowedSize = 5 * 1024 * 1024; // 5MB in bytes

    let fileToUpload = file;

    // If the file exceeds the limit, compress it
    if (file.size > maxAllowedSize) {
      try {
        // Options for image compression (adjust as needed)
        const options = {
          maxSizeMB: 1, // Compress target size in MB.
          maxWidthOrHeight: 1920, // You can adjust to control the dimensions.
          useWebWorker: true,
        };

        fileToUpload = await imageCompression(file, options);
        console.log('Image compressed from:', file.size, 'to:', fileToUpload.size);
      } catch (error) {
        console.error('Error during image compression:', error);
      }
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('width', form.width.value);
    formData.append('height', form.height.value);
    formData.append('image', fileToUpload);

    // Call the API route for resizing
    try {
      const response = await fetch('/api/resize', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        setResizedUrl(URL.createObjectURL(blob));
      } else {
        const errorText = await response.text();
        alert('Error processing image: ' + errorText);
      }
    } catch (error) {
      console.error('Request error:', error);
      alert('An error occurred while processing your image.');
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1>Image Resizer with Client-Side Compression</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>
            Width (px):{' '}
            <input type="number" name="width" defaultValue="112" required />
          </label>
        </div>
        <br />
        <div>
          <label>
            Height (px):{' '}
            <input type="number" name="height" defaultValue="112" required />
          </label>
        </div>
        <br />
        <div>
          <input type="file" name="image" accept="image/*" required />
        </div>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Resize Image'}
        </button>
      </form>
      {resizedUrl && (
        <div style={{ marginTop: 20 }}>
          <h2>Resized Image:</h2>
          <img src={resizedUrl} alt="Resized" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}
