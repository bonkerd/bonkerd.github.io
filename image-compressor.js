// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const maxWidth = document.getElementById('max-width');
const targetSize = document.getElementById('target-size');
const sizeUnit = document.getElementById('size-unit');
const format = document.getElementById('format');
const imagesGrid = document.getElementById('images-grid');
const previewGrid = document.getElementById('preview-grid');
const previewSection = document.querySelector('.preview-section');
const clearBtn = document.getElementById('clear-btn');
const uploadBtn = document.querySelector('.upload-btn');
const settingsPanel = document.querySelector('.settings-panel');
const compressBtn = document.getElementById('compress-btn');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const qualitySettings = document.getElementById('quality-settings');
const sizeSettings = document.getElementById('size-settings');

// Store uploaded files
let uploadedFiles = [];

// Current compression mode
let currentMode = 'quality';

// Update quality value display
qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = `${qualitySlider.value}%`;
});

// Handle file selection via button
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

// Handle drag and drop events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

// Handle file input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Clear all images and hide settings
clearBtn.addEventListener('click', () => {
    imagesGrid.innerHTML = '';
    previewGrid.innerHTML = '';
    settingsPanel.classList.remove('visible');
    previewSection.classList.remove('visible');
    uploadedFiles = [];
    compressBtn.disabled = true;
});

// Remove individual preview image
function removePreviewImage(index) {
    uploadedFiles.splice(index, 1);
    updatePreviewGrid();
    if (uploadedFiles.length === 0) {
        settingsPanel.classList.remove('visible');
        previewSection.classList.remove('visible');
        compressBtn.disabled = true;
    }
}

// Create preview card
function createPreviewCard(file, index) {
    const card = document.createElement('div');
    card.className = 'preview-card';

    // Create preview image
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);

    // Create info section
    const info = document.createElement('div');
    info.className = 'preview-info';
    
    const title = document.createElement('h3');
    title.textContent = file.name;
    
    const size = document.createElement('p');
    size.textContent = `Original size: ${formatFileSize(file.size)}`;

    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'preview-remove';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => removePreviewImage(index));

    info.appendChild(title);
    info.appendChild(size);
    card.appendChild(img);
    card.appendChild(info);
    card.appendChild(removeBtn);

    return card;
}

// Update preview grid
function updatePreviewGrid() {
    previewGrid.innerHTML = '';
    uploadedFiles.forEach((file, index) => {
        const card = createPreviewCard(file, index);
        previewGrid.appendChild(card);
    });
}

// Compress button click handler
compressBtn.addEventListener('click', async () => {
    compressBtn.disabled = true;
    compressBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing...';
    imagesGrid.innerHTML = ''; // Clear previous results
    
    try {
        for (const file of uploadedFiles) {
            await compressImage(file);
        }
    } catch (error) {
        console.error('Compression error:', error);
    }
    
    compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Images';
    compressBtn.disabled = false;
});

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Convert size to bytes
function convertToBytes(size, unit) {
    if (unit === 'KB') {
        return size * 1024;
    }
    return size * 1024 * 1024; // MB to bytes
}

// Convert size to MB for compression library
function convertToMB(size, unit) {
    if (unit === 'KB') {
        return size / 1024; // Convert KB to MB
    }
    return size;
}

// Handle files
function handleFiles(files) {
    if (files.length > 0) {
        // Filter and store uploaded files
        const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        uploadedFiles = [...uploadedFiles, ...newFiles];

        // Show settings and preview panels
        settingsPanel.classList.add('visible');
        previewSection.classList.add('visible');
        compressBtn.disabled = false;

        // Update preview grid
        updatePreviewGrid();
    }
}

// Create image card for compressed image
function createImageCard(file, compressedBlob, originalImage) {
    const card = document.createElement('div');
    card.className = 'image-card';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(compressedBlob);
    
    const info = document.createElement('div');
    info.className = 'image-info';
    
    const title = document.createElement('h3');
    title.textContent = file.name;
    
    const sizeInfo = document.createElement('div');
    sizeInfo.className = 'size-info';
    sizeInfo.innerHTML = `
        <span>Original: ${formatFileSize(file.size)}</span>
        <span>Compressed: ${formatFileSize(compressedBlob.size)}</span>
    `;
    
    const savings = document.createElement('p');
    const savedPercent = ((file.size - compressedBlob.size) / file.size * 100).toFixed(1);
    savings.textContent = `Saved ${savedPercent}% in size`;
    savings.style.color = savedPercent > 0 ? 'var(--success)' : 'var(--error)';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedBlob);
        link.download = `compressed_${file.name}`;
        link.click();
    });
    
    info.appendChild(title);
    info.appendChild(sizeInfo);
    info.appendChild(savings);
    info.appendChild(downloadBtn);
    
    card.appendChild(img);
    card.appendChild(info);
    
    return card;
}

// Handle mode toggle
toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        
        // Update buttons
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update mode
        currentMode = mode;
        
        // Show/hide settings
        if (mode === 'quality') {
            qualitySettings.style.display = 'block';
            sizeSettings.style.display = 'none';
        } else {
            qualitySettings.style.display = 'none';
            sizeSettings.style.display = 'block';
        }
    });
});

// Compress single image
async function compressImage(file) {
    try {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async function(e) {
                try {
                    const img = new Image();
                    img.src = e.target.result;
                    await img.decode();

                    // Calculate dimensions
                    let width = img.width;
                    let height = img.height;
                    const maxWidthValue = parseInt(maxWidth.value);

                    // Scale down dimensions if larger than maxWidth
                    if (width > maxWidthValue) {
                        const ratio = maxWidthValue / width;
                        width = maxWidthValue;
                        height = Math.round(height * ratio);
                    }

                    // Create canvas for manual compression
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    
                    // Apply initial downscaling
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    // Base options for compression library
                    let options = {
                        maxWidthOrHeight: maxWidthValue,
                        useWebWorker: true,
                        fileType: `image/${format.value.toLowerCase()}`,
                        initialQuality: 1.0,
                        alwaysKeepResolution: true,
                        maxIteration: 15
                    };

                    if (currentMode === 'quality') {
                        // Get quality from slider (0-100) and convert to 0-1
                        let quality = parseFloat(qualitySlider.value) / 100;
                        
                        // Make quality exponentially more aggressive at lower values
                        quality = Math.pow(quality, 2.5); // More aggressive curve
                        
                        console.log('Original quality input:', parseFloat(qualitySlider.value));
                        console.log('Adjusted quality value:', quality);

                        // For very low quality (below 10%), make it even more aggressive
                        if (parseFloat(qualitySlider.value) < 10) {
                            quality = quality * 0.5; // Halve the quality again
                            console.log('Extra low quality adjustment:', quality);
                        }

                        // Get base compressed image
                        let compressedBlob;
                        
                        if (quality < 0.1) {
                            // For very low quality, use canvas compression first
                            const canvasQuality = Math.max(0.01, quality);
                            compressedBlob = await new Promise(resolve => {
                                canvas.toBlob(resolve, `image/${format.value.toLowerCase()}`, canvasQuality);
                            });
                            
                            // Then apply additional compression
                            options.quality = quality;
                            compressedBlob = await imageCompression(compressedBlob, options);
                        } else {
                            options.quality = quality;
                            compressedBlob = await imageCompression(file, options);
                        }

                        console.log('Compression stats:');
                        console.log('Original size:', formatFileSize(file.size));
                        console.log('Compressed size:', formatFileSize(compressedBlob.size));
                        console.log('Compression ratio:', ((1 - (compressedBlob.size / file.size)) * 100).toFixed(2) + '%');

                        const card = createImageCard(file, compressedBlob, img);
                        imagesGrid.appendChild(card);
                    } else {
                        // Size-based compression
                        const targetSizeBytes = convertToBytes(parseFloat(targetSize.value), sizeUnit.value);
                        
                        if (file.size <= targetSizeBytes) {
                            const card = createImageCard(file, file, img);
                            imagesGrid.appendChild(card);
                            resolve();
                            return;
                        }

                        // Convert target size to MB
                        const targetSizeMB = targetSizeBytes / (1024 * 1024);
                        
                        // Start with aggressive settings
                        options = {
                            ...options,
                            maxSizeMB: targetSizeMB,
                            initialQuality: 0.7,
                            maxIteration: 15
                        };

                        let compressedBlob = await imageCompression(file, options);
                        
                        // If still too large, use multi-pass compression
                        if (compressedBlob.size > targetSizeBytes) {
                            console.log('Initial compression insufficient, trying multi-pass compression');
                            
                            let currentBlob = compressedBlob;
                            let bestBlob = currentBlob;
                            let quality = 0.5;
                            const minQuality = 0.01;
                            
                            while (quality >= minQuality && currentBlob.size > targetSizeBytes) {
                                console.log(`Trying quality: ${quality}, Current size: ${formatFileSize(currentBlob.size)}`);
                                
                                // Canvas compression pass
                                const canvasBlob = await new Promise(resolve => {
                                    canvas.toBlob(resolve, `image/${format.value.toLowerCase()}`, quality);
                                });
                                
                                // Library compression pass
                                options.quality = quality;
                                currentBlob = await imageCompression(canvasBlob, options);
                                
                                if (currentBlob.size < bestBlob.size) {
                                    bestBlob = currentBlob;
                                }
                                
                                quality *= 0.7; // Reduce quality by 30% each iteration
                            }
                            
                            compressedBlob = bestBlob;
                        }

                        console.log('Final compression results:');
                        console.log('Target size:', formatFileSize(targetSizeBytes));
                        console.log('Achieved size:', formatFileSize(compressedBlob.size));
                        console.log('Compression ratio:', ((1 - (compressedBlob.size / file.size)) * 100).toFixed(2) + '%');

                        const card = createImageCard(file, compressedBlob, img);
                        imagesGrid.appendChild(card);
                    }
                    resolve();
                } catch (error) {
                    console.error('Compression error:', error);
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('File read error'));
            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error('File processing error:', error);
    }
}
