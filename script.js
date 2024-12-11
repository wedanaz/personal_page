document.getElementById('submit').addEventListener('click', async () => {
    const fileInput = document.getElementById('gif-file');
    if (!fileInput.files.length) {
        alert('Please upload a GIF file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
        const gifData = new Uint8Array(event.target.result);

        // Decode the GIF file and extract frames
        const frames = await extractFramesFromGIF(gifData);

        // Analyze frames and convert to BIN data
        const binData = convertFramesToBIN(frames);

        // Create a downloadable BIN file
        const binBlob = new Blob([binData], { type: 'application/octet-stream' });
        const downloadLink = document.getElementById('download-link');
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.href = URL.createObjectURL(binBlob);
        downloadLink.style.display = 'block';
    };

    reader.readAsArrayBuffer(file);
});

// Function to extract frames from GIF
async function extractFramesFromGIF(gifData) {
    return new Promise((resolve) => {
        const gif = new GIF(gifData); // Use a library like omggif or gif.js
        const frames = [];

        gif.decode((frame) => {
            // Render each frame onto a canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = gif.width;
            canvas.height = gif.height;

            ctx.putImageData(frame.imageData, 0, 0);

            // Extract pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            frames.push(imageData);
        });

        gif.onComplete(() => {
            resolve(frames);
        });
    });
}

// Function to convert frames to BIN data
function convertFramesToBIN(frames) {
    const binData = [];

    frames.forEach((frame) => {
        const pixels = frame.data; // Pixel data is a flat array [R, G, B, A, ...]
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            // Example logic: Encode RGB to grayscale
            const grayscale = Math.round((r + g + b) / 3);

            // Add grayscale value to binary data
            binData.push(grayscale);
        }
    });

    // Return as Uint8Array
    return new Uint8Array(binData);
}
