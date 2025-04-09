// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [resizedUrl, setResizedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    // Call the API route for image resizing
    const response = await fetch('/api/resize', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      // Convert the response to a Blob and generate an object URL to display the image
      const blob = await response.blob();
      setResizedUrl(URL.createObjectURL(blob));
    } else {
      const error = await response.json();
      alert(error.error || 'Image processing error.');
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1>Image Resizer</h1>
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
          {loading ? 'Resizing...' : 'Resize Image'}
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
