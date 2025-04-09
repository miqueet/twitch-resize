import io
from flask import Flask, request, send_file, abort, render_template_string
from PIL import Image

app = Flask(__name__)
# Limit upload size to 10 MB (10 * 1024 * 1024 bytes)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# A simple HTML form for image upload and dimension input.
HTML_FORM = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Image Resizer</title>
</head>
<body>
  <h1>Upload an Image to Resize</h1>
  <form method="POST" enctype="multipart/form-data">
    <label for="width">Width (px):</label>
    <input type="number" name="width" value="112" required>
    <br><br>
    <label for="height">Height (px):</label>
    <input type="number" name="height" value="112" required>
    <br><br>
    <input type="file" name="image" accept="image/*" required>
    <br><br>
    <button type="submit">Resize Image</button>
  </form>
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def resize_image():
    if request.method == "GET":
        # Serve the HTML form for image upload.
        return render_template_string(HTML_FORM)
    
    # For POST requests: ensure an image file is provided.
    if 'image' not in request.files:
        abort(400, description="No image file provided.")
    
    file = request.files['image']
    
    if file.filename == "":
        abort(400, description="No selected file.")
    
    try:
        img = Image.open(file.stream)
    except Exception:
        abort(400, description="Invalid image file.")
    
    # Get target dimensions from form parameters; defaults to 112x112 pixels.
    try:
        width = int(request.form.get('width', 112))
        height = int(request.form.get('height', 112))
    except ValueError:
        abort(400, description="Invalid width or height value.")
    
    # Resize the image using high-quality LANCZOS resampling.
    resized_img = img.resize((width, height), resample=Image.LANCZOS)
    
    # Save the resized image to an in-memory buffer.
    buf = io.BytesIO()
    # Use the original image format if available, or default to PNG.
    output_format = img.format if img.format else 'PNG'
    resized_img.save(buf, format=output_format)
    buf.seek(0)

    # Return the resized image as a downloadable file.
    return send_file(
        buf,
        mimetype=f"image/{output_format.lower()}",
        as_attachment=True,
        download_name=f"resized_{file.filename}"
    )

if __name__ == "__main__":
    app.run(debug=True)
