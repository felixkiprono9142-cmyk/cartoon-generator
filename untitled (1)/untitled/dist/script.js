// ===== GLOBAL VARIABLES =====
let canvas, ctx;
let currentTool = 'brush';
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#6c5ce7';
let brushSize = 5;
let drawings = []; // For undo functionality
let currentSound = null; // Currently playing sound

// ===== CANVAS SETUP =====
function initCanvas() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match display size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set initial canvas style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    // Save initial blank state
    saveDrawingState();
}

// ===== DRAWING FUNCTIONS =====
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getMousePos(e);
    
    if (currentTool === 'text') {
        addTextToCanvas();
        isDrawing = false;
        return;
    }
    
    if (currentTool === 'rectangle' || currentTool === 'circle') {
        // For shapes, we'll draw on mouse up
        return;
    }
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
}

function draw(e) {
    if (!isDrawing) return;
    
    e.preventDefault();
    const [x, y] = getMousePos(e);
    
    if (currentTool === 'brush' || currentTool === 'line') {
        ctx.lineTo(x, y);
        ctx.stroke();
        [lastX, lastY] = [x, y];
    } else if (currentTool === 'eraser') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
        [lastX, lastY] = [x, y];
    }
}

function stopDrawing() {
    if (!isDrawing) return;
    
    if (currentTool === 'brush' || currentTool === 'line' || currentTool === 'eraser') {
        ctx.closePath();
        saveDrawingState();
    } else if (currentTool === 'rectangle') {
        const [x, y] = getMousePos(event);
        drawRectangle(lastX, lastY, x - lastX, y - lastY);
        saveDrawingState();
    } else if (currentTool === 'circle') {
        const [x, y] = getMousePos(event);
        const radius = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
        drawCircle(lastX, lastY, radius);
        saveDrawingState();
    }
    
    isDrawing = false;
}

function drawRectangle(x, y, width, height) {
    ctx.fillStyle = currentColor;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
}

function drawCircle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = currentColor;
    ctx.fill();
    ctx.stroke();
}

function addTextToCanvas() {
    const text = prompt('Enter text for your cartoon:', 'Funny text here!');
    if (!text) return;
    
    const [x, y] = getMousePos(event);
    ctx.font = '20px Arial';
    ctx.fillStyle = currentColor;
    ctx.fillText(text, x, y);
    saveDrawingState();
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if (e.touches) {
        // Touch event
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        // Mouse event
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    
    return [x, y];
}

function saveDrawingState() {
    if (drawings.length > 20) {
        drawings.shift(); // Keep only last 20 states
    }
    drawings.push(canvas.toDataURL());
}

function undoLastDrawing() {
    if (drawings.length <= 1) return; // Keep the initial blank state
    
    drawings.pop(); // Remove current state
    const previousState = drawings[drawings.length - 1];
    
    const img = new Image();
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = previousState;
}

function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas?')) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, rect.width, rect.height);
        saveDrawingState();
    }
}

// ===== SOUND LIBRARY =====
const soundLibrary = [
    { id: 1, name: "Cartoon Boing", category: "cartoon", duration: "1.2s", emoji: "🤸" },
    { id: 2, name: "Comedy Drumroll", category: "comedy", duration: "3.4s", emoji: "🥁" },
    { id: 3, name: "Superhero Punch", category: "action", duration: "0.8s", emoji: "💥" },
    { id: 4, name: "Silly Whistle", category: "cartoon", duration: "2.1s", emoji: "🎵" },
    { id: 5, name: "Magic Twinkle", category: "effects", duration: "1.8s", emoji: "✨" },
    { id: 6, name: "Laugh Track", category: "comedy", duration: "4.2s", emoji: "😂" },
    { id: 7, name: "Cartoon Run", category: "action", duration: "1.5s", emoji: "🏃" },
    { id: 8, name: "Happy Music", category: "music", duration: "5.0s", emoji: "🎶" },
    { id: 9, name: "Animated Fall", category: "cartoon", duration: "1.1s", emoji: "📉" },
    { id: 10, name: "Zany Slide Whistle", category: "comedy", duration: "2.3s", emoji: "📯" }
];

function initSoundLibrary() {
    const soundList = document.getElementById('soundList');
    soundList.innerHTML = '';
    
    soundLibrary.forEach(sound => {
        const soundItem = document.createElement('div');
        soundItem.className = 'sound-item';
        soundItem.innerHTML = `
            <div class="sound-icon">${sound.emoji}</div>
            <div class="sound-info">
                <h4>${sound.name}</h4>
                <p>${sound.category} • ${sound.duration}</p>
            </div>
            <button class="sound-play-btn" data-sound="${sound.id}">
                <i class="fas fa-play"></i>
            </button>
        `;
        soundList.appendChild(soundItem);
    });
    
    // Add play button listeners
    document.querySelectorAll('.sound-play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const soundId = this.getAttribute('data-sound');
            playSound(soundId);
        });
    });
    
    // Sound search functionality
    document.getElementById('soundSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterSounds(searchTerm);
    });
    
    // Category filter
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterSoundsByCategory(category);
        });
    });
}

function playSound(soundId) {
    // In a real app, you would play actual audio files
    // For this demo, we'll just simulate it
    
    const soundItem = document.querySelector(`.sound-play-btn[data-sound="${soundId}"]`).closest('.sound-item');
    soundItem.classList.add('playing');
    
    // Simulate audio playback
    console.log(`Playing sound #${soundId}`);
    
    // Remove playing class after duration
    const sound = soundLibrary.find(s => s.id == soundId);
    if (sound) {
        setTimeout(() => {
            soundItem.classList.remove('playing');
        }, parseFloat(sound.duration) * 1000);
    }
}

function filterSounds(searchTerm) {
    document.querySelectorAll('.sound-item').forEach(item => {
        const soundName = item.querySelector('h4').textContent.toLowerCase();
        const soundCategory = item.querySelector('p').textContent.toLowerCase();
        
        if (soundName.includes(searchTerm) || soundCategory.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterSoundsByCategory(category) {
    document.querySelectorAll('.sound-item').forEach(item => {
        const soundCategory = item.querySelector('p').textContent.toLowerCase();
        
        if (category === 'all' || soundCategory.includes(category)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// ===== EXAMPLE CARTOONS =====
const exampleCartoons = [
    { id: 1, title: "Funny Animal", description: "Cute animals with big eyes", type: "animal", tags: ["cute", "simple"] },
    { id: 2, title: "Superhero Style", description: "Bold lines and dynamic poses", type: "action", tags: ["bold", "dynamic"] },
    { id: 3, title: "Anime Character", description: "Big eyes and expressive faces", type: "anime", tags: ["expressive", "detailed"] },
    { id: 4, title: "Minimalist Doodle", description: "Simple line art style", type: "minimal", tags: ["simple", "clean"] },
    { id: 5, title: "Retro Cartoon", description: "90s cartoon network style", type: "retro", tags: ["nostalgic", "colorful"] },
    { id: 6, title: "Fantasy Creature", description: "Dragons and magical beings", type: "fantasy", tags: ["detailed", "magical"] }
];

function initExamples() {
    const exampleList = document.getElementById('exampleList');
    
    exampleCartoons.forEach(example => {
        const exampleCard = document.createElement('div');
        exampleCard.className = 'example-card';
        exampleCard.innerHTML = `
            <h3>${example.title}</h3>
            <p>${example.description}</p>
            <span class="example-tag">${example.type}</span>
        `;
        
        exampleCard.addEventListener('click', function() {
            // Remove active class from all cards
            document.querySelectorAll('.example-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // In a real app, this would load the example style
            console.log(`Selected example: ${example.title}`);
            alert(`"${example.title}" style selected! The AI will now use this as reference.`);
        });
        
        exampleList.appendChild(exampleCard);
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Canvas events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    
    // Tool selection
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTool = this.getAttribute('data-tool');
            
            // Update cursor
            if (currentTool === 'eraser') {
                canvas.style.cursor = 'cell';
            } else if (currentTool === 'text') {
                canvas.style.cursor = 'text';
            } else {
                canvas.style.cursor = 'crosshair';
            }
        });
    });
    
    // Button events
    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
    document.getElementById('undoBtn').addEventListener('click', undoLastDrawing);
    document.getElementById('saveBtn').addEventListener('click', () => {
        // Create a download link
        const link = document.createElement('a');
        link.download = 'my-cartoon.png';
        link.href = canvas.toDataURL();
        link.click();
    });
    
    document.getElementById('generateBtn').addEventListener('click', () => {
        const selectedExample = document.querySelector('.example-card.active');
        if (!selectedExample) {
            alert('Please select an example cartoon first!');
            return;
        }
        
        // Simulate AI generation
        alert('🎨 Generating cartoon based on your selected example... This would use AI in a real application!');
        
        // Simulate generated content
        ctx.fillStyle = '#fd79a8';
        ctx.font = '30px Comic Sans MS';
        ctx.fillText('AI Generated Cartoon!', 100, 100);
        saveDrawingState();
    });
}

// ===== INITIALIZE APP =====
window.addEventListener('load', function() {
    initCanvas();
    initSoundLibrary();
    initExamples();
    setupEventListeners();
    
    // Responsive canvas resize
    window.addEventListener('resize', initCanvas);
});
// ===== GLOBAL VARIABLES =====
let canvas, ctx, aiCanvas, aiCtx;
let currentTool = 'brush';
let isDrawing = false;
let lastX = 0, lastY = 0;
let currentColor = '#6c5ce7';
let brushSize = 5;
let brushOpacity = 1;
let brushType = 'round';
let drawings = [];
let redoStack = [];
let currentLayerIndex = 0;
let layers = [];
let animationFrames = [];
let currentFrame = 0;
let isPlayingAnimation = false;
let animationInterval;
let currentSound = null;
let isSoundPlaying = false;
let volume = 0.8;
let polygonSides = 5;
let sprayInterval;
let zoomLevel = 1;

// ===== LAYER MANAGEMENT =====
class Layer {
    constructor(name, width, height) {
        this.id = Date.now() + Math.random();
        this.name = name;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.visible = true;
        this.opacity = 1;
        this.blendMode = 'source-over';
        this.thumbnail = null;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    getDataURL() {
        return this.canvas.toDataURL();
    }
    
    updateThumbnail() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 40;
        tempCanvas.height = 30;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.canvas, 0, 0, 40, 30);
        this.thumbnail = tempCanvas.toDataURL();
    }
}

// ===== INITIALIZATION =====
function initApp() {
    initCanvas();
    initLayers();
    initColorPresets();
    initSoundLibrary();
    initExamples();
    initAnimationFrames();
    initEventListeners();
    initModal();
    updateUI();
}

function initCanvas() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set initial canvas style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    saveDrawingState();
}

function initLayers() {
    layers = [];
    
    // Create initial layer
    const baseLayer = new Layer('Background', canvas.width, canvas.height);
    baseLayer.ctx.fillStyle = '#ffffff';
    baseLayer.ctx.fillRect(0, 0, canvas.width, canvas.height);
    baseLayer.updateThumbnail();
    layers.push(baseLayer);
    
    // Create drawing layer
    const drawingLayer = new Layer('Drawing', canvas.width, canvas.height);
    drawingLayer.updateThumbnail();
    layers.push(drawingLayer);
    
    currentLayerIndex = 1;
    updateLayersUI();
    renderLayers();
}

function initColorPresets() {
    const presets = [
        '#6c5ce7', '#fd79a8', '#00b894', '#fdcb6e', '#e17055',
        '#0984e3', '#00cec9', '#a29bfe', '#fab1a0', '#74b9ff',
        '#000000', '#ffffff', '#ff4757', '#2ed573', '#ffa502',
        '#1e90ff', '#ff6b81', '#7bed9f', '#70a1ff', '#dfe4ea'
    ];
    
    const container = document.getElementById('colorPresets');
    container.innerHTML = '';
    
    presets.forEach(color => {
        const preset = document.createElement('div');
        preset.className = 'color-preset';
        if (color === currentColor) preset.classList.add('active');
        preset.style.backgroundColor = color;
        preset.title = color;
        
        preset.addEventListener('click', () => {
            document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            currentColor = color;
            document.getElementById('colorPicker').value = color;
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
        });
        
        container.appendChild(preset);
    });
}

function initSoundLibrary() {
    // Extended sound library with more categories
    const categories = ['All', 'Comedy', 'Action', 'Cartoon', 'Music', 'Effects', 'Animals', 'Sci-Fi', 'Horror', 'Sports'];
    const container = document.getElementById('soundCategories');
    
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn' + (category === 'All' ? ' active' : '');
        btn.textContent = category;
        btn.dataset.category = category.toLowerCase();
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterSoundsByCategory(btn.dataset.category);
        });
        container.appendChild(btn);
    });
    
    // Load initial sounds
    loadSounds();
}

function loadSounds() {
    // This would connect to a real API in production
    const soundList = document.getElementById('soundList');
    soundList.innerHTML = '';
    
    // Generate more sound items
    const soundTypes = ['Boing', 'Whistle', 'Punch', 'Laugh', 'Magic', 'Run', 'Fall', 'Slide', 'Zap', 'Pop'];
    const categories = ['cartoon', 'comedy', 'action', 'effects', 'music'];
    const emojis = ['🤸', '🎵', '💥', '😂', '✨', '🏃', '📉', '📯', '⚡', '🎈'];
    
    for (let i = 1; i <= 20; i++) {
        const type = soundTypes[Math.floor(Math.random() * soundTypes.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const duration = (Math.random() * 3 + 0.5).toFixed(1) + 's';
        
        const soundItem = document.createElement('div');
        soundItem.className = 'sound-item';
        soundItem.dataset.soundId = i;
        soundItem.dataset.category = category;
        soundItem.innerHTML = `
            <div class="sound-icon">${emoji}</div>
            <div class="sound-info">
                <h4>${type} Sound ${i}</h4>
                <p>${category} • ${duration}</p>
            </div>
            <div class="sound-actions">
                <button class="btn-small" onclick="playSound(${i})">
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn-small" onclick="addSoundToCartoon(${i})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        
        soundItem.addEventListener('click', (e) => {
            if (!e.target.closest('.sound-actions')) {
                playSound(i);
            }
        });
        
        soundList.appendChild(soundItem);
    }
}

function initExamples() {
    const examples = [
        { 
            title: "Anime Style", 
            description: "Big eyes, vibrant colors, expressive faces",
            type: "anime",
            tags: ["expressive", "colorful", "detailed"],
            colors: ["#ff6b9d", "#4ecdc4", "#ffe66d"],
            prompt: "anime character with big eyes and vibrant colors"
        },
        { 
            title: "Superhero Comic", 
            description: "Bold lines, dynamic poses, dramatic shadows",
            type: "comic",
            tags: ["bold", "dynamic", "shadows"],
            colors: ["#2d3436", "#0984e3", "#fd79a8"],
            prompt: "superhero in dynamic pose with bold outlines"
        },
        { 
            title: "Cartoon Network", 
            description: "90s style, simple shapes, exaggerated features",
            type: "retro",
            tags: ["nostalgic", "simple", "fun"],
            colors: ["#00cec9", "#fdcb6e", "#a29bfe"],
            prompt: "1990s cartoon network style character"
        },
        { 
            title: "Minimalist Doodle", 
            description: "Simple line art, clean design, monochrome",
            type: "minimal",
            tags: ["simple", "clean", "elegant"],
            colors: ["#2d3436", "#636e72", "#b2bec3"],
            prompt: "minimalist line art doodle"
        },
        { 
            title: "Fantasy Creature", 
            description: "Dragons, unicorns, magical elements",
            type: "fantasy",
            tags: ["magical", "detailed", "creative"],
            colors: ["#6c5ce7", "#00b894", "#fd79a8"],
            prompt: "fantasy creature with magical elements"
        },
        { 
            title: "Funny Animal", 
            description: "Cute animals with human-like expressions",
            type: "animal",
            tags: ["cute", "funny", "simple"],
            colors: ["#00b894", "#fdcb6e", "#e17055"],
            prompt: "cute funny animal with human expression"
        }
    ];
    
    const container = document.getElementById('exampleList');
    container.innerHTML = '';
    
    examples.forEach((example, index) => {
        const card = document.createElement('div');
        card.className = 'example-card';
        card.innerHTML = `
            <h3>${example.title}</h3>
            <p>${example.description}</p>
            <div class="example-tags">
                ${example.tags.map(tag => `<span class="example-tag">${tag}</span>`).join('')}
            </div>
            <div class="example-colors">
                ${example.colors.map(color => 
                    `<span class="color-dot" style="background-color: ${color}"></span>`
                ).join('')}
            </div>
        `;
        
        card.addEventListener('click', () => {
            document.querySelectorAll('.example-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // Update color presets with example colors
            const presetsContainer = document.getElementById('colorPresets');
            const presets = presetsContainer.querySelectorAll('.color-preset');
            
            example.colors.forEach((color, i) => {
                if (presets[i]) {
                    presets[i].style.backgroundColor = color;
                    presets[i].title = color;
                }
            });
            
            // Set first color as current
            currentColor = example.colors[0];
            document.getElementById('colorPicker').value = currentColor;
            ctx.strokeStyle = currentColor;
            ctx.fillStyle = currentColor;
            
            // Update UI
            updateToolOptions('ai');
            alert(`"${example.title}" style loaded! Use these colors and try the AI generator.`);
        });
        
        container.appendChild(card);
    });
}

function initAnimationFrames() {
    const container = document.getElementById('framesContainer');
    
    // Create initial frames
    for (let i = 0; i < 3; i++) {
        addAnimationFrame();
    }
    
    // Set first frame as active
    setActiveFrame(0);
}

function initEventListeners() {
    // Canvas events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    
    // Color picker
    document.getElementById('colorPicker').addEventListener('input', (e) => {
        currentColor = e.target.value;
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        
        // Update active color preset
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.classList.toggle('active', preset.style.backgroundColor === currentColor);
        });
    });
    
    // Brush controls
    document.getElementById('brushSize').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        document.getElementById('brushSizeValue').textContent = brushSize;
        ctx.lineWidth = brushSize;
    });
    
    document.getElementById('brushOpacity').addEventListener('input', (e) => {
        brushOpacity = parseInt(e.target.value) / 100;
        document.getElementById('brushOpacityValue').textContent = e.target.value;
        ctx.globalAlpha = brushOpacity;
    });
    
    // Brush types
    document.querySelectorAll('.brush-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.brush-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            brushType = btn.dataset.brush;
            
            switch(brushType) {
                case 'round':
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    break;
                case 'square':
                    ctx.lineCap = 'square';
                    ctx.lineJoin = 'miter';
                    break;
                case 'spray':
                    ctx.lineCap = 'round';
                    break;
            }
        });
    });
    
    // Tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
            
            // Update cursor
            updateCursor();
            
            // Show/hide tool options
            updateToolOptions(currentTool);
        });
    });
    
    // Polygon sides selector
    document.getElementById('polygonSides').addEventListener('input', (e) => {
        polygonSides = parseInt(e.target.value);
        document.getElementById('polygonSidesValue').textContent = polygonSides;
    });
    
    // Layers
    document.getElementById('addLayerBtn').addEventListener('click', addLayer);
    document.getElementById('mergeLayersBtn').addEventListener('click', mergeLayers);
    
    // Animation
    document.getElementById('addFrameBtn').addEventListener('click', addAnimationFrame);
    document.getElementById('playAnimationBtn').addEventListener('click', toggleAnimation);
    document.getElementById('exportGifBtn').addEventListener('click', exportGIF);
    
    // Zoom controls
    document.getElementById('zoomInBtn').addEventListener('click', () => zoomCanvas(1.2));
    document.getElementById('zoomOutBtn').addEventListener('click', () => zoomCanvas(0.8));
    document.getElementById('zoomResetBtn').addEventListener('click', () => zoomCanvas(1, true));
    
    // Sound controls
    document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        volume = e.target.value / 100;
        if (currentSound) {
            currentSound.volume = volume;
        }
    });
    
    // AI buttons
    document.getElementById('aiEnhanceBtn').addEventListener('click', openAIModal);
    document.getElementById('generateBtn').addEventListener('click', openAIModal);
    
    // Save buttons
    document.getElementById('saveBtn').addEventListener('click', saveAsPNG);
    document.getElementById('saveGifBtn').addEventListener('click', exportGIF);
    
    // Undo/Redo/Clear
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
    
    // Sound search
    document.getElementById('soundSearch').addEventListener('input', (e) => {
        filterSounds(e.target.value.toLowerCase());
    });
    
    // Mouse position tracking
    canvas.addEventListener('mousemove', updateCursorPosition);
    
    // Window resize
    window.addEventListener('resize', () => {
        initCanvas();
        renderLayers();
    });
}

function initModal() {
    const modal = document.getElementById('aiModal');
    const closeBtn = document.querySelector('.close-modal');
    const generateBtn = document.getElementById('generateBtn');
    
    generateBtn.addEventListener('click', () => {
        modal.classList.add('active');
        initAIPreview();
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // AI buttons in modal
    document.getElementById('styleTransferBtn').addEventListener('click', applyStyleTransfer);
    document.getElementById('autoCompleteBtn').addEventListener('click', autoCompleteDrawing);
    document.getElementById('characterGenBtn').addEventListener('click', generateCharacter);
}

// ===== DRAWING FUNCTIONS =====
function startDrawing(e) {
    e.preventDefault();
    
    const currentLayer = layers[currentLayerIndex];
    const layerCtx = currentLayer.ctx;
    const [x, y] = getMousePos(e);
    
    isDrawing = true;
    [lastX, lastY] = [x, y];
    
    switch(currentTool) {
        case 'text':
            addTextToCanvas(x, y);
            isDrawing = false;
            break;
        case 'fill':
            floodFill(x, y);
            isDrawing = false;
            break;
        case 'gradient':
            // Start gradient drawing
            layerCtx.beginPath();
            layerCtx.moveTo(x, y);
            break;
        case 'spray':
            startSpray(x, y, layerCtx);
            break;
        case 'polygon':
            // Store starting point for polygon
            polygonPoints = [[x, y]];
            break;
        default:
            layerCtx.beginPath();
            layerCtx.moveTo(x, y);
    }
    
    saveDrawingState();
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const currentLayer = layers[currentLayerIndex];
    const layerCtx = currentLayer.ctx;
    const [x, y] = getMousePos(e);
    
    // Update cursor position display
    updateCursorPosition(e);
    
    switch(currentTool) {
        case 'brush':
        case 'line':
        case 'eraser':
            layerCtx.lineTo(x, y);
            layerCtx.stroke();
            [lastX, lastY] = [x, y];
            break;
        case 'rectangle':
            // Preview rectangle
            renderLayers();
            drawPreviewRectangle(lastX, lastY, x - lastX, y - lastY);
            break;
        case 'circle':
            renderLayers();
            const radius = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
            drawPreviewCircle(lastX, lastY, radius);
            break;
        case 'spray':
            sprayPaint(x, y, layerCtx);
            break;
    }
    
    renderLayers();
}

function stopDrawing() {
    if (!isDrawing) return;
    
    const currentLayer = layers[currentLayerIndex];
    const layerCtx = currentLayer.ctx;
    const [x, y] = getMousePos(event);
    
    switch(currentTool) {
        case 'brush':
        case 'line':
        case 'eraser':
            layerCtx.closePath();
            break;
        case 'rectangle':
            drawRectangle(lastX, lastY, x - lastX, y - lastY, layerCtx);
            break;
        case 'circle':
            const radius = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
            drawCircle(lastX, lastY, radius, layerCtx);
            break;
        case 'polygon':
            polygonPoints.push([x, y]);
            if (polygonPoints.length >= polygonSides) {
                drawPolygon(polygonPoints, layerCtx);
                polygonPoints = [];
            }
            break;
        case 'spray':
            stopSpray();
            break;
        case 'gradient':
            drawGradient(lastX, lastY, x, y, layerCtx);
            break;
    }
    
    isDrawing = false;
    currentLayer.updateThumbnail();
    saveDrawingState();
    renderLayers();
    updateLayersUI();
}

function drawRectangle(x, y, width, height, context) {
    context.fillStyle = currentColor;
    context.fillRect(x, y, width, height);
    context.strokeRect(x, y, width, height);
}

function drawCircle(x, y, radius, context) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = currentColor;
    context.fill();
    context.stroke();
}

function drawPolygon(points, context) {
    if (points.length < 2) return;
    
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    
    for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i][0], points[i][1]);
    }
    
    context.closePath();
    context.fillStyle = currentColor;
    context.fill();
    context.stroke();
}

function drawGradient(x1, y1, x2, y2, context) {
    const gradient = context.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, currentColor);
    gradient.addColorStop(1, lightenColor(currentColor, 50));
    
    context.fillStyle = gradient;
    context.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
}

function floodFill(startX, startY) {
    const currentLayer = layers[currentLayerIndex];
    const imageData = currentLayer.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixelColor(imageData, startX, startY);
    const fillColor = hexToRgb(currentColor);
    
    const stack = [[startX, startY]];
    const visited = new Set();
    
    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;
        
        if (visited.has(key) || x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            continue;
        }
        
        visited.add(key);
        
        const currentColor = getPixelColor(imageData, x, y);
        if (!colorsMatch(currentColor, targetColor)) {
            continue;
        }
        
        // Set pixel color
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = fillColor.r;
        imageData.data[index + 1] = fillColor.g;
        imageData.data[index + 2] = fillColor.b;
        imageData.data[index + 3] = 255;
        
        // Add neighbors to stack
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    currentLayer.ctx.putImageData(imageData, 0, 0);
}

function startSpray(x, y, context) {
    context.globalAlpha = brushOpacity;
    
    sprayInterval = setInterval(() => {
        for (let i = 0; i < brushSize; i++) {
            const radius = brushSize * 2;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const sprayX = x + Math.cos(angle) * distance;
            const sprayY = y + Math.sin(angle) * distance;
            
            context.fillStyle = currentColor;
            context.fillRect(sprayX, sprayY, 1, 1);
        }
        renderLayers();
    }, 30);
}

function stopSpray() {
    if (sprayInterval) {
        clearInterval(sprayInterval);
        sprayInterval = null;
    }
}

function addTextToCanvas(x, y) {
    const text = prompt('Enter text for your cartoon:', 'Funny text here!');
    if (!text) return;
    
    const font = prompt('Enter font size (default 20px):', '20px') + ' Arial';
    const currentLayer = layers[currentLayerIndex];
    
    currentLayer.ctx.font = font;
    currentLayer.ctx.fillStyle = currentColor;
    currentLayer.ctx.fillText(text, x, y);
    
    currentLayer.updateThumbnail();
    saveDrawingState();
    renderLayers();
}

// ===== HELPER FUNCTIONS =====
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;
    
    let x, y;
    
    if (e.touches) {
        x = (e.touches[0].clientX - rect.left) * scaleX;
        y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
        x = (e.clientX - rect.left) * scaleX;
        y = (e.clientY - rect.top) * scaleY;
    }
    
    // Apply zoom
    x /= zoomLevel;
    y /= zoomLevel;
    
    return [x, y];
}

function saveDrawingState() {
    if (drawings.length > 50) {
        drawings.shift();
    }
    
    const currentLayer = layers[currentLayerIndex];
    drawings.push(currentLayer.getDataURL());
    redoStack = [];
}

function undo() {
    if (drawings.length <= 1) return;
    
    redoStack.push(drawings.pop());
    const previousState = drawings[drawings.length - 1];
    
    const img = new Image();
    img.onload = () => {
        const currentLayer = layers[currentLayerIndex];
        currentLayer.ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentLayer.ctx.drawImage(img, 0, 0);
        renderLayers();
    };
    img.src = previousState;
}

function redo() {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack.pop();
    drawings.push(nextState);
    
    const img = new Image();
    img.onload = () => {
        const currentLayer = layers[currentLayerIndex];
        currentLayer.ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentLayer.ctx.drawImage(img, 0, 0);
        renderLayers();
    };
    img.src = nextState;
}

function clearCanvas() {
    if (confirm('Are you sure you want to clear the current layer?')) {
        const currentLayer = layers[currentLayerIndex];
        currentLayer.clear();
        currentLayer.updateThumbnail();
        saveDrawingState();
        renderLayers();
        updateLayersUI();
    }
}

function updateCursor() {
    switch(currentTool) {
        case 'eraser':
            canvas.style.cursor = 'cell';
            break;
        case 'text':
            canvas.style.cursor = 'text';
            break;
        case 'fill':
            canvas.style.cursor = 'crosshair';
            break;
        default:
            canvas.style.cursor = 'crosshair';
    }
}

function updateCursorPosition(e) {
    const [x, y] = getMousePos(e);
    document.getElementById('cursorPosition').textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
}

function zoomCanvas(factor, reset = false) {
    if (reset) {
        zoomLevel = 1;
    } else {
        zoomLevel *= factor;
        zoomLevel = Math.max(0.1, Math.min(5, zoomLevel));
    }
    
    const canvasWrapper = canvas.parentElement;
    canvasWrapper.style.transform = `scale(${zoomLevel})`;
    canvasWrapper.style.transformOrigin = 'top left';
    
    document.getElementById('zoomLevel').textContent = `${Math.round(zoomLevel * 100)}%`;
}

// ===== LAYER FUNCTIONS =====
function addLayer() {
    const layerName = prompt('Enter layer name:', `Layer ${layers.length + 1}`);
    if (!layerName) return;
    
    const newLayer = new Layer(layerName, canvas.width, canvas.height);
    layers.push(newLayer);
    currentLayerIndex = layers.length - 1;
    
    updateLayersUI();
    renderLayers();
}

function mergeLayers() {
    if (layers.length <= 1) return;
    
    if (confirm('Merge all layers into background layer?')) {
        const mergedCanvas = document.createElement('canvas');
        mergedCanvas.width = canvas.width;
        mergedCanvas.height = canvas.height;
        const mergedCtx = mergedCanvas.getContext('2d');
        
        // Draw all layers
        layers.forEach(layer => {
            if (layer.visible) {
                mergedCtx.globalAlpha = layer.opacity;
                mergedCtx.globalCompositeOperation = layer.blendMode;
                mergedCtx.drawImage(layer.canvas, 0, 0);
            }
        });
        
        // Clear all layers and set merged image to first layer
        layers.forEach(layer => layer.clear());
        layers[0].ctx.drawImage(mergedCanvas, 0, 0);
        
        // Remove other layers
        layers = [layers[0]];
        currentLayerIndex = 0;
        
        updateLayersUI();
        renderLayers();
        saveDrawingState();
    }
}

function updateLayersUI() {
    const container = document.getElementById('layersList');
    const currentLayerName = document.getElementById('currentLayerName');
    
    container.innerHTML = '';
    currentLayerName.textContent = layers[currentLayerIndex].name;
    
    layers.forEach((layer, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = `layer-item ${index === currentLayerIndex ? 'active' : ''}`;
        layerItem.innerHTML = `
            <div class="layer-preview">
                <img src="${layer.thumbnail || ''}" alt="${layer.name}" style="width:100%;height:100%;object-fit:contain;">
            </div>
            <div class="layer-info">
                <h4>${layer.name}</h4>
                <p>${layer.visible ? 'Visible' : 'Hidden'}</p>
            </div>
            <div class="layer-controls">
                <input type="checkbox" ${layer.visible ? 'checked' : ''} 
                       onchange="toggleLayerVisibility(${index})">
            </div>
        `;
        
        layerItem.addEventListener('click', (e) => {
            if (!e.target.matches('input')) {
                selectLayer(index);
            }
        });
        
        container.appendChild(layerItem);
    });
}

function selectLayer(index) {
    currentLayerIndex = index;
    updateLayersUI();
    renderLayers();
}

function toggleLayerVisibility(index) {
    layers[index].visible = !layers[index].visible;
    renderLayers();
    updateLayersUI();
}

function renderLayers() {
    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid if needed
    if (zoomLevel > 2) {
        drawGrid();
    }
    
    // Draw all layers in order
    layers.forEach((layer, index) => {
        if (layer.visible) {
            ctx.globalAlpha = layer.opacity;
            ctx.globalCompositeOperation = layer.blendMode;
            ctx.drawImage(layer.canvas, 0, 0);
        }
    });
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
}

function drawGrid() {
    const gridSize = 20;
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

// ===== ANIMATION FUNCTIONS =====
function addAnimationFrame() {
    const frameId = animationFrames.length;
    const frame = {
        id: frameId,
        name: `Frame ${frameId + 1}`,
        duration: 100, // ms
        thumbnail: null,
        data: layers.map(layer => layer.getDataURL())
    };
    
    animationFrames.push(frame);
    updateAnimationUI();
    
    // Save current drawing to frame
    saveFrame(frameId);
}

function saveFrame(frameId) {
    animationFrames[frameId].data = layers.map(layer => layer.getDataURL());
    
    // Create thumbnail
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 80;
    tempCanvas.height = 60;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw all layers for thumbnail
    layers.forEach(layer => {
        if (layer.visible) {
            const img = new Image();
            img.src = layer.getDataURL();
            tempCtx.drawImage(img, 0, 0, 80, 60);
        }
    });
    
    animationFrames[frameId].thumbnail = tempCanvas.toDataURL();
    updateAnimationUI();
}

function setActiveFrame(frameId) {
    currentFrame = frameId;
    
    // Load frame data into layers
    const frame = animationFrames[frameId];
    frame.data.forEach((layerData, index) => {
        if (layers[index]) {
            const img = new Image();
            img.onload = () => {
                layers[index].ctx.clearRect(0, 0, canvas.width, canvas.height);
                layers[index].ctx.drawImage(img, 0, 0);
                if (index === frame.data.length - 1) {
                    renderLayers();
                }
            };
            img.src = layerData;
        }
    });
    
    updateAnimationUI();
}

function updateAnimationUI() {
    const container = document.getElementById('framesContainer');
    container.innerHTML = '';
    
    animationFrames.forEach((frame, index) => {
        const frameItem = document.createElement('div');
        frameItem.className = `frame-item ${index === currentFrame ? 'active' : ''}`;
        frameItem.innerHTML = `
            <div class="frame-number">${index + 1}</div>
            <img src="${frame.thumbnail || ''}" class="frame-preview" alt="Frame ${index + 1}">
        `;
        
        frameItem.addEventListener('click', () => setActiveFrame(index));
        container.appendChild(frameItem);
    });
}

function toggleAnimation() {
    const playBtn = document.getElementById('playAnimationBtn');
    const icon = playBtn.querySelector('i');
    
    if (isPlayingAnimation) {
        stopAnimation();
        icon.className = 'fas fa-play';
        playBtn.textContent = ' Play';
    } else {
        startAnimation();
        icon.className = 'fas fa-pause';
        playBtn.textContent = ' Pause';
    }
    
    isPlayingAnimation = !isPlayingAnimation;
}

function startAnimation() {
    let frameIndex = 0;
    
    animationInterval = setInterval(() => {
        setActiveFrame(frameIndex);
        frameIndex = (frameIndex + 1) % animationFrames.length;
        
        // Update timeline slider
        const progress = (frameIndex / animationFrames.length) * 100;
        document.getElementById('timelineSlider').value = progress;
    }, animationFrames[currentFrame]?.duration || 100);
}

function stopAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
}

async function exportGIF() {
    alert('GIF export would require a GIF encoder library. In production, you would use:\n1. gif.js or gifencoder libraries\n2. Capture each frame\n3. Encode and download');
    
    // This is a simplified version - real implementation would use a GIF library
    const frames = animationFrames.map(frame => {
        const img = new Image();
        img.src = frame.data[0]; // First layer only for simplicity
        return img;
    });
    
    alert(`Prepared ${frames.length} frames for GIF export.`);
}

// ===== SOUND FUNCTIONS =====
function playSound(soundId) {
    // In a real app, this would play actual audio
    // For demo purposes, we'll simulate it
    
    const soundItem = document.querySelector(`.sound-item[data-sound-id="${soundId}"]`);
    const playingSoundEl = document.getElementById('playingSound');
    
    // Remove playing class from all items
    document.querySelectorAll('.sound-item').forEach(item => {
        item.classList.remove('playing');
    });
    
    // Add playing class to current item
    soundItem.classList.add('playing');
    playingSoundEl.textContent = soundId;
    
    // Simulate playback with timeout
    setTimeout(() => {
        soundItem.classList.remove('playing');
        playingSoundEl.textContent = '0';
    }, 2000); // Simulate 2 second sound
}

function togglePlayPause() {
    const playBtn = document.getElementById('playPauseBtn');
    const icon = playBtn.querySelector('i');
    
    if (isSoundPlaying) {
        // Pause logic
        icon.className = 'fas fa-play';
        isSoundPlaying = false;
    } else {
        // Play logic
        icon.className = 'fas fa-pause';
        isSoundPlaying = true;
        
        // Simulate sound progress
        simulateSoundProgress();
    }
}

function simulateSoundProgress() {
    const progressBar = document.getElementById('soundProgress');
    let progress = 0;
    
    const interval = setInterval(() => {
        if (!isSoundPlaying) {
            clearInterval(interval);
            return;
        }
        
        progress += 1;
        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            isSoundPlaying = false;
            const playBtn = document.getElementById('playPauseBtn');
            playBtn.querySelector('i').className = 'fas fa-play';
            progressBar.style.width = '0%';
        }
    }, 50);
}

function filterSounds(searchTerm) {
    document.querySelectorAll('.sound-item').forEach(item => {
        const soundName = item.querySelector('h4').textContent.toLowerCase();
        const soundCategory = item.querySelector('p').textContent.toLowerCase();
        
        if (soundName.includes(searchTerm) || soundCategory.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterSoundsByCategory(category) {
    document.querySelectorAll('.sound-item').forEach(item => {
        const soundCategory = item.dataset.category;
        
        if (category === 'all' || soundCategory === category) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function addSoundToCartoon(soundId) {
    alert(`Sound ${soundId} added to cartoon! In a real app, this would attach the sound to animation frames.`);
    
    // Visual feedback
    const soundItem = document.querySelector(`.sound-item[data-sound-id="${soundId}"]`);
    soundItem.style.animation = 'pulse 0.5s';
    setTimeout(() => soundItem.style.animation = '', 500);
}

// ===== AI FUNCTIONS =====
function openAIModal() {
    document.getElementById('aiModal').classList.add('active');
    initAIPreview();
}

function initAIPreview() {
    aiCanvas = document.getElementById('aiPreviewCanvas');
    aiCtx = aiCanvas.getContext('2d');
    
    // Copy current canvas to preview
    aiCtx.drawImage(canvas, 0, 0, aiCanvas.width, aiCanvas.height);
}

function applyStyleTransfer() {
    const selectedExample = document.querySelector('.example-card.active');
    if (!selectedExample) {
        alert('Please select an example style first!');
        return;
    }
    
    alert('Applying AI style transfer... This would connect to an AI service in production.');
    
    // Simulate style transfer by applying a filter
    aiCtx.filter = 'contrast(1.2) saturate(1.5)';
    aiCtx.drawImage(canvas, 0, 0, aiCanvas.width, aiCanvas.height);
    aiCtx.filter = 'none';
    
    // Update main canvas
    const img = new Image();
    img.onload = () => {
        const currentLayer = layers[currentLayerIndex];
        currentLayer.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        currentLayer.updateThumbnail();
        renderLayers();
        saveDrawingState();
    };
    img.src = aiCanvas.toDataURL();
}

function autoCompleteDrawing() {
    alert('AI is completing your drawing... This would use AI image generation.');
    
    // Simulate AI completion
    aiCtx.fillStyle = currentColor;
    aiCtx.font = 'bold 16px Arial';
    aiCtx.fillText('AI Enhanced!', 50, 80);
    
    aiCtx.beginPath();
    aiCtx.arc(100, 120, 30, 0, Math.PI * 2);
    aiCtx.fillStyle = lightenColor(currentColor, 30);
    aiCtx.fill();
    
    // Update main canvas
    const img = new Image();
    img.onload = () => {
        const currentLayer = layers[currentLayerIndex];
        currentLayer.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        currentLayer.updateThumbnail();
        renderLayers();
        saveDrawingState();
    };
    img.src = aiCanvas.toDataURL();
}

function generateCharacter() {
    const characterType = prompt('What type of character? (hero, animal, monster, robot):', 'hero');
    alert(`Generating ${characterType} character with AI...`);
    
    // Simulate character generation
    aiCtx.clearRect(0, 0, aiCanvas.width, aiCanvas.height);
    
    // Draw a simple character based on type
    switch(characterType.toLowerCase()) {
        case 'hero':
            drawAISuperhero();
            break;
        case 'animal':
            drawAIAnimal();
            break;
        case 'monster':
            drawAIMonster();
            break;
        case 'robot':
            drawAIRobot();
            break;
        default:
            drawAISuperhero();
    }
    
    // Update main canvas
    const img = new Image();
    img.onload = () => {
        const currentLayer = layers[currentLayerIndex];
        currentLayer.ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentLayer.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        currentLayer.updateThumbnail();
        renderLayers();
        saveDrawingState();
    };
    img.src = aiCanvas.toDataURL();
}

// ===== UTILITY FUNCTIONS =====
function saveAsPNG() {
    const link = document.createElement('a');
    link.download = `cartoon-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function getPixelColor(imageData, x, y) {
    const index = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

function colorsMatch(c1, c2, tolerance = 10) {
    return Math.abs(c1.r - c2.r) <= tolerance &&
           Math.abs(c1.g - c2.g) <= tolerance &&
           Math.abs(c1.b - c2.b) <= tolerance &&
           Math.abs(c1.a - c2.a) <= tolerance;
}

function updateToolOptions(tool) {
    const optionsContainer = document.getElementById('toolOptions');
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'tool-options';
    
    if (tool === 'polygon') {
        optionsContainer.classList.add('active');
        optionsContainer.innerHTML = `
            <label>Polygon Sides: <span id="polygonSidesValue">5</span></label>
            <input type="range" id="polygonSides" min="3" max="12" value="5">
        `;
        
        // Add event listener for the new slider
        document.getElementById('polygonSides').addEventListener('input', (e) => {
            polygonSides = parseInt(e.target.value);
            document.getElementById('polygonSidesValue').textContent = polygonSides;
        });
    }
}

function updateUI() {
    // Update brush size display
    document.getElementById('brushSizeValue').textContent = brushSize;
    document.getElementById('brushSize').value = brushSize;
    
    // Update opacity display
    document.getElementById('brushOpacityValue').textContent = brushOpacity * 100;
    document.getElementById('brushOpacity').value = brushOpacity * 100;
    
    // Update color picker
    document.getElementById('colorPicker').value = currentColor;
    
    // Set initial tool
    document.querySelector(`.tool-btn[data-tool="${currentTool}"]`).classList.add('active');
    document.querySelector(`.brush-type-btn[data-brush="${brushType}"]`).classList.add('active');
}

// ===== SIMPLE AI DRAWING FUNCTIONS =====
function drawAISuperhero() {
    aiCtx.fillStyle = '#0984e3';
    aiCtx.fillRect(40, 40, 120, 160); // Body
    
    aiCtx.fillStyle = '#2d3436';
    aiCtx.fillRect(30, 40, 140, 20); // Cape
    
    aiCtx.fillStyle = '#fd79a8';
    aiCtx.beginPath();
    aiCtx.arc(100, 30, 20, 0, Math.PI * 2); // Head
    aiCtx.fill();
    
    aiCtx.fillStyle = '#fdcb6e';
    aiCtx.fillRect(70, 200, 60, 20); // Belt
}

function drawAIAnimal() {
    aiCtx.fillStyle = '#00b894';
    aiCtx.beginPath();
    aiCtx.arc(100, 80, 40, 0, Math.PI * 2); // Body
    aiCtx.fill();
    
    aiCtx.fillRect(140, 70, 30, 20); // Tail
    
    aiCtx.fillStyle = '#fdcb6e';
    aiCtx.beginPath();
    aiCtx.arc(70, 60, 20, 0, Math.PI * 2); // Head
    aiCtx.fill();
    
    aiCtx.fillStyle = '#ffffff';
    aiCtx.beginPath();
    aiCtx.arc(65, 55, 5, 0, Math.PI * 2); // Eye
    aiCtx.fill();
}

function drawAIMonster() {
    aiCtx.fillStyle = '#6c5ce7';
    aiCtx.beginPath();
    aiCtx.ellipse(100, 100, 60, 80, 0, 0, Math.PI * 2); // Body
    aiCtx.fill();
    
    aiCtx.fillStyle = '#fd79a8';
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = 100 + Math.cos(angle) * 70;
        const y = 100 + Math.sin(angle) * 90;
        aiCtx.beginPath();
        aiCtx.arc(x, y, 10, 0, Math.PI * 2); // Tentacles
        aiCtx.fill();
    }
}

function drawAIRobot() {
    aiCtx.fillStyle = '#636e72';
    aiCtx.fillRect(60, 60, 80, 120); // Body
    
    aiCtx.fillStyle = '#0984e3';
    aiCtx.fillRect(70, 80, 60, 40); // Screen
    
    aiCtx.fillStyle = '#fdcb6e';
    aiCtx.fillRect(80, 140, 40, 30); // Button panel
    
    aiCtx.fillStyle = '#2d3436';
    aiCtx.fillRect(85, 150, 10, 10); // Buttons
    aiCtx.fillRect(105, 150, 10, 10);
}

// ===== INITIALIZE APP =====
window.addEventListener('load', initApp);

// Add CSS animation for pulse effect
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .example-colors {
        display: flex;
        gap: 5px;
        margin-top: 8px;
    }
    
    .color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1px solid rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);
// ===== TOM & JERRY WATERMARK INTERACTIVITY =====
function initWatermark() {
    const watermark = document.querySelector('.watermark');
    
    // Make watermark draggable
    let isDragging = false;
    let offsetX, offsetY;
    
    watermark.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    function startDrag(e) {
        isDragging = true;
        offsetX = e.clientX - watermark.offsetLeft;
        offsetY = e.clientY - watermark.offsetTop;
        watermark.style.opacity = '0.9';
        watermark.style.cursor = 'grabbing';
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        // Calculate new position
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        
        // Boundary checking
        const maxX = window.innerWidth - watermark.offsetWidth;
        const maxY = window.innerHeight - watermark.offsetHeight;
        
        watermark.style.left = Math.min(Math.max(newX, 10), maxX - 10) + 'px';
        watermark.style.top = Math.min(Math.max(newY, 10), maxY - 10) + 'px';
    }
    
    function stopDrag() {
        isDragging = false;
        watermark.style.opacity = '0.8';
        watermark.style.cursor = 'grab';
    }
    
    // Double click to hide/show
    watermark.addEventListener('dblclick', function() {
        this.style.opacity = this.style.opacity === '0.2' ? '0.8' : '0.2';
    });
    
    // Click to play sound
    watermark.addEventListener('click', function(e) {
        if (!isDragging) {
            playCartoonSound();
        }
    });
}

function playCartoonSound() {
    // Play a cartoon sound when watermark is clicked
    const sounds = ['boing', 'squeak', 'meow', 'crash'];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    switch(randomSound) {
        case 'boing':
            playBoingSound(audioContext);
            break;
        case 'squeak':
            playSqueakSound(audioContext);
            break;
        case 'meow':
            playMeowSound(audioContext);
            break;
        case 'crash':
            playCrashSound(audioContext);
            break;
    }
    
    // Visual feedback
    const watermark = document.querySelector('.watermark');
    watermark.style.transform = 'scale(1.1)';
    setTimeout(() => {
        watermark.style.transform = 'scale(1)';
    }, 200);
}

// Sound effect functions
function playBoingSound(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playSqueakSound(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Rapid frequency modulation for squeak
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.05);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

// Add this to your existing initApp() function:
function initApp() {
    initCanvas();
    initLayers();
    initColorPresets();
    initSoundLibrary();
    initExamples();
    initAnimationFrames();
    initEventListeners();
    initModal();
    initWatermark();  // ADD THIS LINE
    updateUI();
}
// ===== TOM & JERRY WATERMARK WITH IMAGES =====

// Real Tom & Jerry image URLs (using Imgur links)
const TOM_IMAGE_URL = 'https://i.imgur.com/R1lQv2J.png'; // Tom image
const JERRY_IMAGE_URL = 'https://i.imgur.com/V4qkQ7t.png'; // Jerry image

// Backup image data (in case URLs don't load)
const backupTomImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSIyNSIgZmlsbD0iI0ZGNkIzNSIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMjAiIHI9IjUiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMTUiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwMCIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iMzAiIHI9IjUiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMzUiIGN5PSIzMCIgcj0iMiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0xNSAzMEwyNSA0MEwzNSAzMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48cGF0aCBkPSJNMjUgMzVMMjUgNDUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';
const backupJerryImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSIyNSIgZmlsbD0iIzhCNDUxMyIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMjAiIHI9IjUiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMTUiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwMCIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iMzAiIHI9IjUiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMzUiIGN5PSIzMCIgcj0iMiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0xNSAzMEwyNSA0MEwzNSAzMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48cGF0aCBkPSJNMjUgMzVMMjUgNDUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTI1IDE1TDI1IDIwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';

function initWatermark() {
    const watermark = document.getElementById('tomJerryWatermark');
    
    // Load images with fallback
    loadWatermarkImages();
    
    // Make watermark draggable
    makeDraggable(watermark);
    
    // Add click sound effect
    watermark.addEventListener('click', playCartoonSound);
    
    // Add double click to toggle visibility
    watermark.addEventListener('dblclick', toggleWatermark);
    
    // Add context menu for more options
    watermark.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showWatermarkMenu(e);
    });
    
    // Initialize position from localStorage or default
    loadWatermarkPosition();
}

function loadWatermarkImages() {
    const tomImg = document.querySelector('.tom-image');
    const jerryImg = document.querySelector('.jerry-image');
    
    // Try loading from URLs, fallback to SVG
    const tom = new Image();
    tom.onload = () => tomImg.src = TOM_IMAGE_URL;
    tom.onerror = () => tomImg.src = backupTomImage;
    tom.src = TOM_IMAGE_URL;
    
    const jerry = new Image();
    jerry.onload = () => jerryImg.src = JERRY_IMAGE_URL;
    jerry.onerror = () => jerryImg.src = backupJerryImage;
    jerry.src = JERRY_IMAGE_URL;
}

function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;
    
    element.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    function startDrag(e) {
        // Don't start drag if clicking control buttons
        if (e.target.closest('.wm-btn')) return;
        
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        element.style.cursor = 'grabbing';
        element.style.opacity = '0.95';
        
        // Bring to front
        element.style.zIndex = '1001';
        setTimeout(() => element.style.zIndex = '1000', 1000);
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        
        // Boundary checking
        const maxX = window.innerWidth - element.offsetWidth - 10;
        const maxY = window.innerHeight - element.offsetHeight - 10;
        
        element.style.left = Math.max(10, Math.min(newX, maxX)) + 'px';
        element.style.top = Math.max(10, Math.min(newY, maxY)) + 'px';
        
        // Save position
        saveWatermarkPosition();
    }
    
    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        element.style.cursor = 'grab';
        element.style.opacity = '0.85';
    }
}

function toggleWatermark() {
    const watermark = document.getElementById('tomJerryWatermark');
    watermark.classList.toggle('hidden');
    
    // Save state to localStorage
    const isHidden = watermark.classList.contains('hidden');
    localStorage.setItem('watermarkHidden', isHidden);
}

function stampWatermark() {
    const watermark = document.getElementById('tomJerryWatermark');
    const rect = watermark.getBoundingClientRect();
    
    // Create a stamp effect on the canvas
    const currentLayer = layers[currentLayerIndex];
    const stampCtx = currentLayer.ctx;
    
    // Save context state
    stampCtx.save();
    
    // Set stamp properties
    stampCtx.globalAlpha = 0.4;
    stampCtx.globalCompositeOperation = 'multiply';
    
    // Draw stamp background (orange circle)
    stampCtx.fillStyle = 'rgba(255, 107, 53, 0.2)';
    stampCtx.beginPath();
    stampCtx.arc(
        rect.left + rect.width/2 - canvas.getBoundingClientRect().left,
        rect.top + rect.height/2 - canvas.getBoundingClientRect().top,
        rect.width/2,
        0, Math.PI * 2
    );
    stampCtx.fill();
    
    // Draw text
    stampCtx.globalAlpha = 0.6;
    stampCtx.fillStyle = 'rgba(255, 234, 167, 0.8)';
    stampCtx.font = 'bold 16px "Comic Sans MS", cursive';
    stampCtx.textAlign = 'center';
    stampCtx.fillText(
        'TOM & JERRY',
        rect.left + rect.width/2 - canvas.getBoundingClientRect().left,
        rect.top + rect.height/2 - canvas.getBoundingClientRect().top + 5
    );
    
    // Restore context
    stampCtx.restore();
    
    // Update display
    renderLayers();
    saveDrawingState();
    
    // Visual feedback
    watermark.classList.add('stamped');
    setTimeout(() => watermark.classList.remove('stamped'), 1000);
    
    // Play stamp sound
    playStampSound();
}

function randomizePosition() {
    const watermark = document.getElementById('tomJerryWatermark');
    const maxX = window.innerWidth - watermark.offsetWidth - 20;
    const maxY = window.innerHeight - watermark.offsetHeight - 20;
    
    const randomX = Math.floor(Math.random() * maxX) + 10;
    const randomY = Math.floor(Math.random() * maxY) + 10;
    
    watermark.style.left = randomX + 'px';
    watermark.style.top = randomY + 'px';
    
    // Save new position
    saveWatermarkPosition();
    
    // Visual feedback
    watermark.style.transform = 'scale(1.1) rotate(5deg)';
    setTimeout(() => {
        watermark.style.transform = 'scale(1) rotate(0deg)';
    }, 300);
}

function saveWatermarkPosition() {
    const watermark = document.getElementById('tomJerryWatermark');
    const position = {
        x: watermark.style.left,
        y: watermark.style.top
    };
    localStorage.setItem('watermarkPosition', JSON.stringify(position));
}

function loadWatermarkPosition() {
    const watermark = document.getElementById('tomJerryWatermark');
    const savedPosition = localStorage.getItem('watermarkPosition');
    const isHidden = localStorage.getItem('watermarkHidden') === 'true';
    
    if (savedPosition) {
        const position = JSON.parse(savedPosition);
        watermark.style.left = position.x;
        watermark.style.top = position.y;
    }
    
    if (isHidden) {
        watermark.classList.add('hidden');
    }
}

function playCartoonSound() {
    // Play random cartoon sound
    const sounds = [
        { type: 'boing', freq: 300 },
        { type: 'squeak', freq: 1200 },
        { type: 'slide', freq: 500 },
        { type: 'bonk', freq: 200 }
    ];
    
    const sound = sounds[Math.floor(Math.random() * sounds.length)];
    playSoundEffect(sound.freq, sound.type);
}

function playStampSound() {
    playSoundEffect(150, 'stamp');
}

function playSoundEffect(frequency, type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure based on sound type
        switch(type) {
            case 'boing':
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.4);
                break;
                
            case 'squeak':
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(frequency * 1.5, audioContext.currentTime + 0.05);
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
                
            case 'stamp':
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
        }
    } catch (e) {
        console.log('Audio context not supported');
    }
}

function showWatermarkMenu(e) {
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        padding: 10px 0;
        z-index: 2000;
        min-width: 150px;
    `;
    
    menu.innerHTML = `
        <div class="menu-item" onclick="toggleWatermark()">
            <i class="fas fa-eye"></i> Toggle Visibility
        </div>
        <div class="menu-item" onclick="stampWatermark()">
            <i class="fas fa-stamp"></i> Stamp on Canvas
        </div>
        <div class="menu-item" onclick="randomizePosition()">
            <i class="fas fa-random"></i> Random Position
        </div>
        <hr style="margin: 5px 0; border: none; border-top: 1px solid #eee;">
        <div class="menu-item" onclick="resetWatermarkPosition()">
            <i class="fas fa-home"></i> Reset Position
        </div>
        <div class="menu-item" onclick="changeWatermarkOpacity()">
            <i class="fas fa-adjust"></i> Change Opacity
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // Close menu when clicking elsewhere
    const closeMenu = () => {
        document.body.removeChild(menu);
        document.removeEventListener('click', closeMenu);
    };
    
    setTimeout(() => document.addEventListener('click', closeMenu), 100);
    
    // Style menu items
    const style = document.createElement('style');
    style.textContent = `
        .menu-item {
            padding: 10px 15px;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .menu-item:hover {
            background: #f5f5f5;
        }
        .menu-item i {
            width: 20px;
            color: #FF6B35;
        }
    `;
    document.head.appendChild(style);
    setTimeout(() => document.head.removeChild(style), 1000);
}

function resetWatermarkPosition() {
    const watermark = document.getElementById('tomJerryWatermark');
    watermark.style.left = '20px';
    watermark.style.top = '20px';
    saveWatermarkPosition();
}

function changeWatermarkOpacity() {
    const opacity = prompt('Enter opacity (0.1 to 1.0):', '0.85');
    if (opacity && !isNaN(opacity) && opacity >= 0.1 && opacity <= 1) {
        const watermark = document.getElementById('tomJerryWatermark');
        watermark.style.opacity = opacity;
    }
}

// Add this to your existing initApp() function
function initApp() {
    initCanvas();
    initLayers();
    initColorPresets();
    initSoundLibrary();
    initExamples();
    initAnimationFrames();
    initEventListeners();
    initModal();
    initWatermark(); // ADD THIS LINE
    updateUI();
}

// Initialize when page loads
window.addEventListener('load', initApp);
const TOM_IMAGE_URL = 'https://www.pinterest.com/pin/566890671826795887/';
const JERRY_IMAGE_URL = 'https://www.pinterest.com/pin/92816442307670594/';
// ===== PRIVACY & ADS-FREE SYSTEM =====

// Local storage keys
const PRIVACY_ACCEPTED = 'cartoonlab_privacy_accepted';
const AUTO_SAVE_ENABLED = 'cartoonlab_auto_save';
const LOCAL_STATS_ENABLED = 'cartoonlab_local_stats';
const SOUND_EFFECTS_ENABLED = 'cartoonlab_sound_effects';
const ANNOUNCEMENT_CLOSED = 'cartoonlab_announcement_closed';

// Local statistics
const LOCAL_STATS = {
    cartoonsCreated: 0,
    drawingTime: 0, // in minutes
    toolsUsed: {},
    lastSave: null,
    sessions: 0
};

function initPrivacySystem() {
    // Load settings
    loadPrivacySettings();
    
    // Show privacy banner if not accepted
    if (!localStorage.getItem(PRIVACY_ACCEPTED)) {
        setTimeout(() => {
            showPrivacyBanner();
        }, 2000);
    }
    
    // Show announcement if not closed
    if (!localStorage.getItem(ANNOUNCEMENT_CLOSED)) {
        setTimeout(() => {
            showAnnouncement();
        }, 5000);
    }
    
    // Initialize statistics
    initLocalStats();
    
    // Update statistics periodically
    setInterval(updateLocalStats, 60000); // Every minute
    
    // Setup event listeners for privacy toggles
    setupPrivacyToggles();
    
    // Show privacy status
    showPrivacyStatus();
}

function loadPrivacySettings() {
    // Load auto-save setting
    const autoSave = localStorage.getItem(AUTO_SAVE_ENABLED);
    if (autoSave !== null) {
        document.getElementById('autoSaveToggle').checked = autoSave === 'true';
    }
    
    // Load local stats setting
    const localStats = localStorage.getItem(LOCAL_STATS_ENABLED);
    if (localStats !== null) {
        document.getElementById('localStatsToggle').checked = localStats === 'true';
    }
    
    // Load sound effects setting
    const soundEffects = localStorage.getItem(SOUND_EFFECTS_ENABLED);
    if (soundEffects !== null) {
        document.getElementById('soundEffectsToggle').checked = soundEffects === 'true';
    }
    
    // Load statistics
    const savedStats = localStorage.getItem('cartoonlab_stats');
    if (savedStats) {
        Object.assign(LOCAL_STATS, JSON.parse(savedStats));
    }
}

function setupPrivacyToggles() {
    // Auto-save toggle
    document.getElementById('autoSaveToggle').addEventListener('change', function(e) {
        localStorage.setItem(AUTO_SAVE_ENABLED, e.target.checked);
        showStatusMessage(`Auto-save ${e.target.checked ? 'enabled' : 'disabled'}`);
    });
    
    // Local stats toggle
    document.getElementById('localStatsToggle').addEventListener('change', function(e) {
        localStorage.setItem(LOCAL_STATS_ENABLED, e.target.checked);
        if (e.target.checked) {
            showStatusMessage('Local statistics enabled');
        } else {
            // Clear stats if disabled
            clearLocalStats();
            showStatusMessage('Local statistics cleared and disabled');
        }
    });
    
    // Sound effects toggle
    document.getElementById('soundEffectsToggle').addEventListener('change', function(e) {
        localStorage.setItem(SOUND_EFFECTS_ENABLED, e.target.checked);
        showStatusMessage(`Sound effects ${e.target.checked ? 'enabled' : 'disabled'}`);
    });
}

function initLocalStats() {
    // Initialize or load statistics
    LOCAL_STATS.sessions++;
    LOCAL_STATS.lastSave = new Date().toISOString();
    
    // Update stats display
    updateStatsDisplay();
    
    // Save to localStorage if enabled
    if (document.getElementById('localStatsToggle').checked) {
        localStorage.setItem('cartoonlab_stats', JSON.stringify(LOCAL_STATS));
    }
}

function updateLocalStats() {
    // Update drawing time
    LOCAL_STATS.drawingTime += 1;
    
    // Update last save time
    LOCAL_STATS.lastSave = new Date().toISOString();
    
    // Save if enabled
    if (document.getElementById('localStatsToggle').checked) {
        localStorage.setItem('cartoonlab_stats', JSON.stringify(LOCAL_STATS));
        updateStatsDisplay();
    }
}

function updateStatsDisplay() {
    const statsGrid = document.getElementById('localStats');
    if (!statsGrid) return;
    
    statsGrid.innerHTML = `
        <div class="stat-item">
            <div class="stat-number">${LOCAL_STATS.cartoonsCreated}</div>
            <div class="stat-label">Cartoons Created</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${Math.floor(LOCAL_STATS.drawingTime)}</div>
            <div class="stat-label">Minutes Drawing</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${LOCAL_STATS.sessions}</div>
            <div class="stat-label">Sessions</div>
        </div>
    `;
}

function incrementCartoonCount() {
    LOCAL_STATS.cartoonsCreated++;
    if (document.getElementById('localStatsToggle').checked) {
        localStorage.setItem('cartoonlab_stats', JSON.stringify(LOCAL_STATS));
        updateStatsDisplay();
    }
}

function trackToolUsage(toolName) {
    if (!LOCAL_STATS.toolsUsed[toolName]) {
        LOCAL_STATS.toolsUsed[toolName] = 0;
    }
    LOCAL_STATS.toolsUsed[toolName]++;
    
    if (document.getElementById('localStatsToggle').checked) {
        localStorage.setItem('cartoonlab_stats', JSON.stringify(LOCAL_STATS));
    }
}

function showPrivacyBanner() {
    const banner = document.getElementById('privacyBanner');
    banner.classList.add('show');
}

function hidePrivacyBanner() {
    const banner = document.getElementById('privacyBanner');
    banner.classList.remove('show');
}

function acceptPrivacy() {
    localStorage.setItem(PRIVACY_ACCEPTED, 'true');
    localStorage.setItem(AUTO_SAVE_ENABLED, 'true');
    localStorage.setItem(LOCAL_STATS_ENABLED, 'true');
    localStorage.setItem(SOUND_EFFECTS_ENABLED, 'true');
    
    hidePrivacyBanner();
    showStatusMessage('Privacy settings saved!', 'success');
    
    // Update toggles
    document.getElementById('autoSaveToggle').checked = true;
    document.getElementById('localStatsToggle').checked = true;
    document.getElementById('soundEffectsToggle').checked = true;
}

function openPrivacySettings() {
    hidePrivacyBanner();
    document.getElementById('privacyModal').classList.add('active');
    updateStatsDisplay();
}

function closePrivacySettings() {
    document.getElementById('privacyModal').classList.remove('active');
}

function showAnnouncement() {
    const announcement = document.getElementById('announcementBanner');
    announcement.classList.add('show');
}

function closeAnnouncement() {
    const announcement = document.getElementById('announcementBanner');
    announcement.classList.remove('show');
    localStorage.setItem(ANNOUNCEMENT_CLOSED, 'true');
}

function showPrivacyStatus() {
    const status = document.getElementById('privacyStatus');
    status.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
        status.classList.remove('show');
    }, 5000);
}

function showStatusMessage(message, type = 'info') {
    const status = document.getElementById('privacyStatus');
    const icon = status.querySelector('i');
    const text = status.querySelector('span');
    
    // Set message and style based on type
    text.textContent = message;
    
    switch(type) {
        case 'success':
            status.style.color = 'var(--success)';
            icon.className = 'fas fa-check-circle';
            break;
        case 'warning':
            status.style.color = 'var(--warning)';
            icon.className = 'fas fa-exclamation-triangle';
            break;
        case 'error':
            status.style.color = 'var(--danger)';
            icon.className = 'fas fa-times-circle';
            break;
        default:
            status.style.color = 'var(--primary)';
            icon.className = 'fas fa-info-circle';
    }
    
    // Show the status
    status.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        status.classList.remove('show');
    }, 3000);
}

function exportLocalData() {
    const data = {
        settings: {
            autoSave: localStorage.getItem(AUTO_SAVE_ENABLED),
            localStats: localStorage.getItem(LOCAL_STATS_ENABLED),
            soundEffects: localStorage.getItem(SOUND_EFFECTS_ENABLED)
        },
        statistics: LOCAL_STATS,
        savedCartoons: [],
        timestamp: new Date().toISOString()
    };
    
    // Get saved cartoons from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('cartoon_')) {
            data.savedCartoons.push({
                name: key.replace('cartoon_', ''),
                data: localStorage.getItem(key)
            });
        }
    }
    
    // Create download link
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cartoonlab-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showStatusMessage('Data exported successfully!', 'success');
}

function clearLocalData() {
    if (confirm('Are you sure you want to clear all local data? This will remove all saved cartoons and settings.')) {
        // Clear all cartoonlab-related localStorage items
        const keysToKeep = [PRIVACY_ACCEPTED];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('cartoonlab_') && !keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        }
        
        // Reset statistics
        Object.keys(LOCAL_STATS).forEach(key => {
            if (key === 'sessions') {
                LOCAL_STATS[key] = 1;
            } else if (typeof LOCAL_STATS[key] === 'number') {
                LOCAL_STATS[key] = 0;
            } else if (typeof LOCAL_STATS[key] === 'object') {
                LOCAL_STATS[key] = {};
            } else {
                LOCAL_STATS[key] = null;
            }
        });
        
        // Reset toggles
        document.getElementById('autoSaveToggle').checked = true;
        document.getElementById('localStatsToggle').checked = true;
        document.getElementById('soundEffectsToggle').checked = true;
        
        showStatusMessage('All local data cleared!', 'success');
        updateStatsDisplay();
    }
}

function clearLocalStats() {
    LOCAL_STATS.cartoonsCreated = 0;
    LOCAL_STATS.drawingTime = 0;
    LOCAL_STATS.toolsUsed = {};
    LOCAL_STATS.sessions = 1;
    LOCAL_STATS.lastSave = new Date().toISOString();
    
    localStorage.removeItem('cartoonlab_stats');
    updateStatsDisplay();
}

function viewSourceCode() {
    window.open('https://github.com', '_blank');
    showStatusMessage('Opening source code repository...');
}

// Modify existing save function to use privacy settings
function saveAsPNG() {
    // Track in statistics
    incrementCartoonCount();
    trackToolUsage('save');
    
    const link = document.createElement('a');
    link.download = `cartoon-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Auto-save if enabled
    if (document.getElementById('autoSaveToggle').checked) {
        autoSaveCartoon();
    }
    
    showStatusMessage('Cartoon saved successfully!', 'success');
}

function autoSaveCartoon() {
    const timestamp = new Date().toISOString();
    const data = {
        image: canvas.toDataURL('image/png'),
        layers: layers.map(layer => layer.getDataURL()),
        timestamp: timestamp,
        name: `Auto-saved ${new Date().toLocaleString()}`
    };
    
    localStorage.setItem(`cartoon_${timestamp}`, JSON.stringify(data));
}

// Modify existing initApp function
function initApp() {
    initCanvas();
    initLayers();
    initColorPresets();
    initSoundLibrary();
    initExamples();
    initAnimationFrames();
    initEventListeners();
    initModal();
    initWatermark();
    initPrivacySystem(); // ADD THIS LINE
    updateUI();
}

// Add trackToolUsage to your existing drawing functions
function startDrawing(e) {
    // ... existing code ...
    trackToolUsage(currentTool);
    // ... rest of function ...
}

// Prevent any external tracking
(function() {
    // Block common tracking patterns
    Object.defineProperty(window, 'ga', {
        get() { return function() {}; },
        configurable: false
    });
    
    Object.defineProperty(window, 'fbq', {
        get() { return function() {}; },
        configurable: false
    });
    
    Object.defineProperty(window, 'gtag', {
        get() { return function() {}; },
        configurable: false
    });
    
    // Block cookie setting
    const originalSetCookie = document.__lookupSetter__('cookie');
    Object.defineProperty(document, 'cookie', {
        get() { return ''; },
        set(value) {
            // Only allow setting cookies from our domain for essential functions
            if (value && value.includes('cartoonlab_')) {
                originalSetCookie.call(document, value);
            }
            return false;
        },
        configurable: false
    });
    
    // Block third-party requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        // Allow same-origin requests only
        if (url && typeof url === 'string') {
            const urlObj = new URL(url, window.location.href);
            if (urlObj.hostname !== window.location.hostname && 
                !urlObj.hostname.includes('localhost') &&
                !urlObj.hostname.includes('127.0.0.1')) {
                console.log('Blocked external request:', url);
                return Promise.reject(new Error('External requests blocked for privacy'));
            }
        }
        return originalFetch.call(this, url, options);
    };
    
    console.log('🔒 Privacy protection active: No cookies, no tracking, no ads');
})();
// ===== PRE-LOADED SOUND LIBRARY =====

// Pre-loaded sound library with 150+ sounds
const PRE_LOADED_SOUNDS = [
    // Cartoon Sounds (40)
    { id: 1, name: "Boing", category: "cartoon", emoji: "🤸", duration: 1.2, color: "#FF6B35", url: "boing" },
    { id: 2, name: "Slide Whistle", category: "cartoon", emoji: "📯", duration: 2.3, color: "#FFA502", url: "slide" },
    { id: 3, name: "Pop", category: "cartoon", emoji: "🎈", duration: 0.5, color: "#FF4757", url: "pop" },
    { id: 4, name: "Zap", category: "cartoon", emoji: "⚡", duration: 0.8, color: "#FFD32A", url: "zap" },
    { id: 5, name: "Bounce", category: "cartoon", emoji: "🏀", duration: 1.5, color: "#FF9F1A", url: "bounce" },
    { id: 6, name: "Spring", category: "cartoon", emoji: "🦘", duration: 1.8, color: "#FF6B81", url: "spring" },
    { id: 7, name: "Squeak", category: "cartoon", emoji: "🐭", duration: 0.7, color: "#8B4513", url: "squeak" },
    { id: 8, name: "Twinkle", category: "cartoon", emoji: "✨", duration: 2.1, color: "#FFEAA7", url: "twinkle" },
    { id: 9, name: "Whoosh", category: "cartoon", emoji: "💨", duration: 1.4, color: "#74B9FF", url: "whoosh" },
    { id: 10, name: "Plop", category: "cartoon", emoji: "💧", duration: 0.6, color: "#0984E3", url: "plop" },
    
    // Comedy Sounds (30)
    { id: 11, name: "Drum Roll", category: "comedy", emoji: "🥁", duration: 3.4, color: "#636E72", url: "drumroll" },
    { id: 12, name: "Cymbal Crash", category: "comedy", emoji: "🎊", duration: 2.5, color: "#FFD32A", url: "cymbal" },
    { id: 13, name: "Laugh Track", category: "comedy", emoji: "😂", duration: 4.2, color: "#FF6B81", url: "laugh" },
    { id: 14, name: "Sneeze", category: "comedy", emoji: "🤧", duration: 1.3, color: "#DFE6E9", url: "sneeze" },
    { id: 15, name: "Fart", category: "comedy", emoji: "💨", duration: 1.1, color: "#A29BFE", url: "fart" },
    { id: 16, name: "Yawn", category: "comedy", emoji: "🥱", duration: 2.0, color: "#FDCB6E", url: "yawn" },
    { id: 17, name: "Giggle", category: "comedy", emoji: "😄", duration: 1.7, color: "#FF9F1A", url: "giggle" },
    { id: 18, name: "Sigh", category: "comedy", emoji: "😌", duration: 1.9, color: "#81ECEC", url: "sigh" },
    { id: 19, name: "Burp", category: "comedy", emoji: "😮", duration: 1.2, color: "#55E6C1", url: "burp" },
    { id: 20, name: "Snore", category: "comedy", emoji: "😴", duration: 2.8, color: "#CAD3C8", url: "snore" },
    
    // Action Sounds (25)
    { id: 21, name: "Punch", category: "action", emoji: "👊", duration: 0.8, color: "#FF4757", url: "punch" },
    { id: 22, name: "Explosion", category: "action", emoji: "💥", duration: 2.3, color: "#FF9F1A", url: "explosion" },
    { id: 23, name: "Laser", category: "action", emoji: "🔫", duration: 1.5, color: "#18DCFF", url: "laser" },
    { id: 24, name: "Sword Clash", category: "action", emoji: "⚔️", duration: 1.1, color: "#7BED9F", url: "sword" },
    { id: 25, name: "Gunshot", category: "action", emoji: "🔫", duration: 0.5, color: "#2D3436", url: "gunshot" },
    { id: 26, name: "Crash", category: "action", emoji: "💥", duration: 2.0, color: "#FF6B81", url: "crash" },
    { id: 27, name: "Smash", category: "action", emoji: "🗑️", duration: 1.4, color: "#636E72", url: "smash" },
    { id: 28, name: "Kick", category: "action", emoji: "🦵", duration: 0.9, color: "#FD79A8", url: "kick" },
    { id: 29, name: "Hit", category: "action", emoji: "🎯", duration: 0.7, color: "#FFD32A", url: "hit" },
    { id: 30, name: "Bullet Ricochet", category: "action", emoji: "🌀", duration: 1.6, color: "#D6A2E8", url: "ricochet" },
    
    // Animal Sounds (20)
    { id: 31, name: "Dog Bark", category: "animals", emoji: "🐶", duration: 0.9, color: "#8B4513", url: "bark" },
    { id: 32, name: "Cat Meow", category: "animals", emoji: "🐱", duration: 0.8, color: "#FF6B35", url: "meow" },
    { id: 33, name: "Bird Chirp", category: "animals", emoji: "🐦", duration: 1.2, color: "#1DD1A1", url: "chirp" },
    { id: 34, name: "Rooster", category: "animals", emoji: "🐓", duration: 1.5, color: "#FF9F1A", url: "rooster" },
    { id: 35, name: "Cow Moo", category: "animals", emoji: "🐄", duration: 1.8, color: "#2D3436", url: "moo" },
    { id: 36, name: "Pig Oink", category: "animals", emoji: "🐷", duration: 1.1, color: "#FF9FF3", url: "oink" },
    { id: 37, name: "Duck Quack", category: "animals", emoji: "🦆", duration: 0.7, color: "#FFD32A", url: "quack" },
    { id: 38, name: "Frog Croak", category: "animals", emoji: "🐸", duration: 1.4, color: "#1DD1A1", url: "croak" },
    { id: 39, name: "Lion Roar", category: "animals", emoji: "🦁", duration: 2.3, color: "#FF9F1A", url: "roar" },
    { id: 40, name: "Elephant", category: "animals", emoji: "🐘", duration: 2.5, color: "#636E72", url: "elephant" },
    
    // Musical Sounds (20)
    { id: 41, name: "Piano Note", category: "music", emoji: "🎹", duration: 1.0, color: "#FF6B81", url: "piano" },
    { id: 42, name: "Guitar Strum", category: "music", emoji: "🎸", duration: 1.5, color: "#FF9F1A", url: "guitar" },
    { id: 43, name: "Violin", category: "music", emoji: "🎻", duration: 2.0, color: "#A29BFE", url: "violin" },
    { id: 44, name: "Trumpet", category: "music", emoji: "🎺", duration: 1.8, color: "#FFD32A", url: "trumpet" },
    { id: 45, name: "Drum Beat", category: "music", emoji: "🥁", duration: 1.2, color: "#8B4513", url: "drum" },
    { id: 46, name: "Flute", category: "music", emoji: "🎵", duration: 2.3, color: "#81ECEC", url: "flute" },
    { id: 47, name: "Harp", category: "music", emoji: "🎼", duration: 2.5, color: "#FFEAA7", url: "harp" },
    { id: 48, name: "Saxophone", category: "music", emoji: "🎷", duration: 2.1, color: "#FD79A8", url: "sax" },
    { id: 49, name: "Bell", category: "music", emoji: "🔔", duration: 1.7, color: "#FFD32A", url: "bell" },
    { id: 50, name: "Chimes", category: "music", emoji: "🎐", duration: 2.8, color: "#81ECEC", url: "chimes" },
    
    // Sci-Fi Sounds (15)
    { id: 51, name: "Spaceship", category: "scifi", emoji: "🚀", duration: 2.4, color: "#18DCFF", url: "spaceship" },
    { id: 52, name: "Robot", category: "scifi", emoji: "🤖", duration: 1.8, color: "#636E72", url: "robot" },
    { id: 53, name: "Teleport", category: "scifi", emoji: "🌀", duration: 1.5, color: "#6C5CE7", url: "teleport" },
    { id: 54, name: "Beam", category: "scifi", emoji: "🔦", duration: 1.2, color: "#FFD32A", url: "beam" },
    { id: 55, name: "Alien", category: "scifi", emoji: "👽", duration: 2.0, color: "#1DD1A1", url: "alien" },
    { id: 56, name: "Computer", category: "scifi", emoji: "💻", duration: 1.7, color: "#74B9FF", url: "computer" },
    { id: 57, name: "Hologram", category: "scifi", emoji: "👁️", duration: 1.9, color: "#FF6B81", url: "hologram" },
    { id: 58, name: "Force Field", category: "scifi", emoji: "🛡️", duration: 2.1, color: "#81ECEC", url: "forcefield" },
    { id: 59, name: "Warp Speed", category: "scifi", emoji: "⚡", duration: 2.3, color: "#6C5CE7", url: "warp" },
    { id: 60, name: "Scanner", category: "scifi", emoji: "📡", duration: 1.6, color: "#FF9F1A", url: "scanner" }
];

// Quick sound effects (for effects bank)
const QUICK_EFFECTS = [
    { id: 'click', name: 'Click', emoji: '🖱️', color: '#6C5CE7' },
    { id: 'success', name: 'Success', emoji: '✅', color: '#00B894' },
    { id: 'error', name: 'Error', emoji: '❌', color: '#FF4757' },
    { id: 'alert', name: 'Alert', emoji: '⚠️', color: '#FFD32A' },
    { id: 'magic', name: 'Magic', emoji: '✨', color: '#FFEAA7' },
    { id: 'coin', name: 'Coin', emoji: '🪙', color: '#FFD700' },
    { id: 'levelup', name: 'Level Up', emoji: '⬆️', color: '#1DD1A1' },
    { id: 'powerup', name: 'Power Up', emoji: '⚡', color: '#FF9F1A' },
    { id: 'transform', name: 'Transform', emoji: '🦋', color: '#FD79A8' },
    { id: 'reveal', name: 'Reveal', emoji: '🎭', color: '#A29BFE' }
];

// Sound system variables
let audioContext;
let currentAudio;
let isPlaying = false;
let currentSoundIndex = 0;
let soundProgressInterval;
let recentSounds = [];
let currentCategory = 'all';

function initSoundLibrary() {
    // Initialize audio context
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
        showNoAudioMessage();
        return;
    }
    
    // Create category filters
    createCategoryFilters();
    
    // Create quick sounds
    createQuickSounds();
    
    // Create effects bank
    createEffectsBank();
    
    // Create sound categories
    createSoundCategories();
    
    // Update total sounds count
    document.getElementById('totalSounds').textContent = PRE_LOADED_SOUNDS.length;
    
    // Load recent sounds from localStorage
    loadRecentSounds();
    
    // Setup event listeners
    setupSoundEventListeners();
    
    // Pre-load some sounds
    preloadImportantSounds();
}

function showNoAudioMessage() {
    const container = document.getElementById('soundCategoriesContainer');
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px;">
            <i class="fas fa-volume-mute" style="font-size: 48px; color: #666; margin-bottom: 20px;"></i>
            <h3 style="color: #666; margin-bottom: 10px;">Audio Not Available</h3>
            <p style="color: #888; margin-bottom: 20px;">Your browser doesn't support Web Audio API. Try using Chrome, Firefox, or Edge.</p>
            <div class="sound-list" id="soundList">
                ${PRE_LOADED_SOUNDS.map(sound => `
                    <div class="sound-item">
                        <div class="sound-icon" style="background: ${sound.color}">${sound.emoji}</div>
                        <div class="sound-info">
                            <h4>${sound.name}</h4>
                            <p>${sound.category} • ${sound.duration}s</p>
                        </div>
                        <div class="sound-actions">
                            <button class="btn-small" onclick="simulateSound(${sound.id})">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="btn-small" onclick="attachSoundToCartoon(${sound.id})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function simulateSound(soundId) {
    const sound = PRE_LOADED_SOUNDS.find(s => s.id === soundId);
    if (sound) {
        alert(`Playing: ${sound.name} (${sound.duration}s)\n\nIn a real audio environment, you would hear the actual sound effect.`);
        addToRecentSounds(sound);
    }
}

function createCategoryFilters() {
    const container = document.getElementById('soundCategoriesGrid');
    const categories = {};
    
    // Count sounds per category
    PRE_LOADED_SOUNDS.forEach(sound => {
        categories[sound.category] = (categories[sound.category] || 0) + 1;
    });
    
    // Create all categories filter
    const allCount = PRE_LOADED_SOUNDS.length;
    container.innerHTML = `
        <button class="category-filter-btn active" data-category="all" onclick="filterSoundsByCategory('all')">
            <div class="category-icon">🎵</div>
            <div class="category-name">All Sounds</div>
            <div class="category-count">${allCount}</div>
        </button>
    `;
    
    // Create category filters
    Object.entries(categories).forEach(([category, count]) => {
        const icon = getCategoryIcon(category);
        const btn = document.createElement('button');
        btn.className = 'category-filter-btn';
        btn.dataset.category = category;
        btn.onclick = () => filterSoundsByCategory(category);
        btn.innerHTML = `
            <div class="category-icon">${icon}</div>
            <div class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
            <div class="category-count">${count}</div>
        `;
        container.appendChild(btn);
    });
}

function getCategoryIcon(category) {
    const icons = {
        cartoon: '🤹',
        comedy: '😂',
        action: '💥',
        animals: '🐾',
        music: '🎵',
        scifi: '🚀',
        effects: '✨',
        horror: '👻',
        sports: '⚽'
    };
    return icons[category] || '🎵';
}

function createQuickSounds() {
    const container = document.getElementById('quickSounds');
    
    // Get 8 random sounds for quick access
    const quickSounds = [...PRE_LOADED_SOUNDS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
    
    container.innerHTML = quickSounds.map(sound => `
        <button class="quick-sound-btn" onclick="playPreLoadedSound(${sound.id})" 
                data-sound-id="${sound.id}">
            <span class="quick-sound-emoji">${sound.emoji}</span>
            <span>${sound.name}</span>
        </button>
    `).join('');
}

function createEffectsBank() {
    const container = document.getElementById('effectsGrid');
    
    container.innerHTML = QUICK_EFFECTS.map(effect => `
        <button class="effect-btn" onclick="playEffect('${effect.id}')" 
                style="background: ${effect.color}20; border: 2px solid ${effect.color}40;">
            <span class="effect-emoji">${effect.emoji}</span>
            <span class="effect-name">${effect.name}</span>
        </button>
    `).join('');
}

function createSoundCategories() {
    const container = document.getElementById('soundCategoriesContainer');
    const categories = {};
    
    // Group sounds by category
    PRE_LOADED_SOUNDS.forEach(sound => {
        if (!categories[sound.category]) {
            categories[sound.category] = [];
        }
        categories[sound.category].push(sound);
    });
    
    // Create category sections
    container.innerHTML = Object.entries(categories).map(([category, sounds]) => `
        <div class="sound-category-section">
            <div class="sound-category-header" onclick="toggleCategory('${category}')">
                <h4>
                    <i class="fas fa-chevron-down"></i>
                    ${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}
                    <span style="font-size: 12px; color: #666; margin-left: 10px;">(${sounds.length} sounds)</span>
                </h4>
                <button class="btn-tiny" onclick="playAllCategory('${category}'); event.stopPropagation();">
                    <i class="fas fa-play-circle"></i> Play All
                </button>
            </div>
            <div class="category-sounds" id="category-${category}">
                ${sounds.map(sound => createSoundCard(sound)).join('')}
            </div>
        </div>
    `).join('');
}

function createSoundCard(sound) {
    return `
        <div class="sound-card" data-sound-id="${sound.id}" data-category="${sound.category}">
            <div class="sound-card-header">
                <div class="sound-emoji" style="background: ${sound.color}">${sound.emoji}</div>
                <div class="sound-title">
                    <h5>${sound.name}</h5>
                    <p>${sound.category} • ${sound.duration}s</p>
                </div>
            </div>
            <div class="sound-card-body">
                <div class="sound-duration">
                    <i class="far fa-clock"></i>
                    ${sound.duration}s
                </div>
                <div class="sound-actions">
                    <button class="sound-play-btn" onclick="playPreLoadedSound(${sound.id}); event.stopPropagation();">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="sound-attach-btn" onclick="attachSoundToCartoon(${sound.id}); event.stopPropagation();">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupSoundEventListeners() {
    // Search input
    document.getElementById('enhancedSoundSearch').addEventListener('input', function(e) {
        filterSounds(e.target.value.toLowerCase());
    });
    
    // Volume slider
    document.getElementById('enhancedVolumeSlider').addEventListener('input', function(e) {
        const volume = e.target.value / 100;
        document.getElementById('volumeValue').textContent = `${e.target.value}%`;
        if (currentAudio) {
            currentAudio.volume = volume;
        }
    });
    
    // Click on sound cards
    document.addEventListener('click', function(e) {
        const soundCard = e.target.closest('.sound-card');
        if (soundCard) {
            const soundId = parseInt(soundCard.dataset.soundId);
            playPreLoadedSound(soundId);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case ' ': // Spacebar to play/pause
                e.preventDefault();
                toggleEnhancedPlayPause();
                break;
            case 'ArrowRight': // Next sound
                nextSound();
                break;
            case 'ArrowLeft': // Previous sound
                previousSound();
                break;
            case 'm': // Mute toggle
                toggleMute();
                break;
        }
    });
}

function playPreLoadedSound(soundId) {
    const sound = PRE_LOADED_SOUNDS.find(s => s.id === soundId);
    if (!sound) return;
    
    // Stop current sound
    stopCurrentSound();
    
    // Update UI
    updateNowPlaying(sound);
    highlightPlayingSound(soundId);
    addToRecentSounds(sound);
    
    // Play the sound using Web Audio API
    playSoundWithWebAudio(sound);
}

function playSoundWithWebAudio(sound) {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Create oscillator for the sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure based on sound type
        configureOscillator(oscillator, sound);
        
        // Set volume
        const volume = document.getElementById('enhancedVolumeSlider').value / 100;
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        
        // Start playing
        oscillator.start();
        isPlaying = true;
        
        // Update play button
        document.getElementById('enhancedPlayPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        
        // Set up progress tracking
        startProgressTracking(sound.duration);
        
        // Stop after duration
        setTimeout(() => {
            stopCurrentSound();
        }, sound.duration * 1000);
        
        // Store reference
        currentAudio = { oscillator, gainNode, soundId: sound.id };
        
    } catch (error) {
        console.error('Error playing sound:', error);
        // Fallback to simulation
        simulateSound(sound.id);
    }
}

function configureOscillator(oscillator, sound) {
    // Default configuration
    oscillator.type = 'sine';
    
    // Custom configurations based on sound category
    switch(sound.category) {
        case 'cartoon':
            // Bouncy, fun sounds
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + sound.duration);
            break;
            
        case 'comedy':
            // Random, funny sounds
            oscillator.type = 'sawtooth';
            const startFreq = 200 + Math.random() * 300;
            const endFreq = 100 + Math.random() * 200;
            oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + sound.duration);
            break;
            
        case 'action':
            // Sharp, intense sounds
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime + sound.duration * 0.3);
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime + sound.duration * 0.6);
            break;
            
        case 'animals':
            // Natural, organic sounds
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(250, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(350, audioContext.currentTime + sound.duration * 0.5);
            oscillator.frequency.setValueAtTime(250, audioContext.currentTime + sound.duration);
            break;
            
        case 'music':
            // Musical tones
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
            break;
            
        case 'scifi':
            // Futuristic, electronic sounds
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + sound.duration);
            break;
            
        default:
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    }
}

function playEffect(effectId) {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure based on effect type
        switch(effectId) {
            case 'click':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
                
            case 'success':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'error':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
                
            case 'magic':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
        
    } catch (error) {
        console.error('Error playing effect:', error);
    }
}

function stopCurrentSound() {
    if (currentAudio) {
        try {
            currentAudio.oscillator.stop();
            isPlaying = false;
        } catch (e) {
            // Oscillator already stopped
        }
        currentAudio = null;
    }
    
    // Clear progress interval
    if (soundProgressInterval) {
        clearInterval(soundProgressInterval);
        soundProgressInterval = null;
    }
    
    // Reset play button
    document.getElementById('enhancedPlayPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    
    // Reset progress bar
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('currentTime').textContent = '0:00';
}

function updateNowPlaying(sound) {
    // Show player
    document.getElementById('enhancedSoundPlayer').classList.add('playing');
    
    // Update info
    document.getElementById('nowPlayingEmoji').textContent = sound.emoji;
    document.getElementById('nowPlayingTitle').textContent = sound.name;
    document.getElementById('nowPlayingCategory').textContent = 
        `${sound.category.charAt(0).toUpperCase() + sound.category.slice(1)} • ${sound.duration}s`;
    
    // Update duration
    document.getElementById('durationTime').textContent = formatTime(sound.duration);
}

function highlightPlayingSound(soundId) {
    // Remove playing class from all cards
    document.querySelectorAll('.sound-card').forEach(card => {
        card.classList.remove('playing');
    });
    
    // Remove playing class from quick buttons
    document.querySelectorAll('.quick-sound-btn').forEach(btn => {
        btn.classList.remove('playing');
    });
    
    // Add playing class to current sound
    const soundCard = document.querySelector(`.sound-card[data-sound-id="${soundId}"]`);
    if (soundCard) {
        soundCard.classList.add('playing');
    }
    
    const quickBtn = document.querySelector(`.quick-sound-btn[data-sound-id="${soundId}"]`);
    if (quickBtn) {
        quickBtn.classList.add('playing');
    }
    
    // Update playing sound counter
    document.getElementById('playingSound').textContent = '1';
}

function addToRecentSounds(sound) {
    // Remove if already exists
    recentSounds = recentSounds.filter(s => s.id !== sound.id);
    
    // Add to beginning
    recentSounds.unshift(sound);
    
    // Keep only last 5
    recentSounds = recentSounds.slice(0, 5);
    
    // Update UI
    updateRecentSounds();
    
    // Save to localStorage
    localStorage.setItem('recentSounds', JSON.stringify(recentSounds));
}

function loadRecentSounds() {
    const saved = localStorage.getItem('recentSounds');
    if (saved) {
        recentSounds = JSON.parse(saved);
        updateRecentSounds();
    }
}

function updateRecentSounds() {
    const container = document.getElementById('recentSoundsList');
    container.innerHTML = recentSounds.map(sound => `
        <div class="recent-item" onclick="playPreLoadedSound(${sound.id})">
            <div style="font-size: 20px;">${sound.emoji}</div>
            <div>
                <div style="font-weight: bold; font-size: 12px;">${sound.name}</div>
                <div style="font-size: 10px; color: #666;">${sound.category}</div>
            </div>
        </div>
    `).join('');
}

function startProgressTracking(duration) {
    let currentTime = 0;
    const totalTime = duration;
    
    // Clear any existing interval
    if (soundProgressInterval) {
        clearInterval(soundProgressInterval);
    }
    
    // Update progress every 100ms
    soundProgressInterval = setInterval(() => {
        if (currentTime >= totalTime) {
            clearInterval(soundProgressInterval);
            return;
        }
        
        currentTime += 0.1;
        const progress = (currentTime / totalTime) * 100;
        
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('currentTime').textContent = formatTime(currentTime);
    }, 100);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function toggleEnhancedPlayPause() {
    if (isPlaying) {
        stopCurrentSound();
    } else {
        // If no sound is selected, play a random one
        if (!currentAudio) {
            playRandomSound();
        } else {
            // Resume current sound (simplified - would need to store more state)
            playPreLoadedSound(currentAudio.soundId);
        }
    }
}

function playRandomSound() {
    const randomIndex = Math.floor(Math.random() * PRE_LOADED_SOUNDS.length);
    playPreLoadedSound(PRE_LOADED_SOUNDS[randomIndex].id);
}

function playAllCategory(category) {
    const sounds = category === 'all' 
        ? PRE_LOADED_SOUNDS 
        : PRE_LOADED_SOUNDS.filter(s => s.category === category);
    
    if (sounds.length === 0) return;
    
    let index = 0;
    
    function playNext() {
        if (index < sounds.length) {
            playPreLoadedSound(sounds[index].id);
            index++;
            setTimeout(playNext, sounds[index - 1].duration * 1000 + 500);
        }
    }
    
    playNext();
}

function previousSound() {
    if (currentAudio) {
        const currentIndex = PRE_LOADED_SOUNDS.findIndex(s => s.id === currentAudio.soundId);
        const prevIndex = (currentIndex - 1 + PRE_LOADED_SOUNDS.length) % PRE_LOADED_SOUNDS.length;
        playPreLoadedSound(PRE_LOADED_SOUNDS[prevIndex].id);
    }
}

function nextSound() {
    if (currentAudio) {
        const currentIndex = PRE_LOADED_SOUNDS.findIndex(s => s.id === currentAudio.soundId);
        const nextIndex = (currentIndex + 1) % PRE_LOADED_SOUNDS.length;
        playPreLoadedSound(PRE_LOADED_SOUNDS[nextIndex].id);
    } else {
        playRandomSound();
    }
}

function filterSounds(searchTerm) {
    // Filter category sections
    document.querySelectorAll('.sound-category-section').forEach(section => {
        const category = section.querySelector('.sound-category-header h4').textContent.toLowerCase();
        const soundsContainer = section.querySelector('.category-sounds');
        const soundCards = soundsContainer.querySelectorAll('.sound-card');
        
        let visibleCount = 0;
        
        soundCards.forEach(card => {
            const soundName = card.querySelector('h5').textContent.toLowerCase();
            const soundCategory = card.dataset.category;
            
            if (soundName.includes(searchTerm) || 
                soundCategory.includes(searchTerm) || 
                category.includes(searchTerm) ||
                searchTerm === '') {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide category based on visible sounds
        if (visibleCount > 0 || searchTerm === '') {
            section.style.display = 'block';
            if (!searchTerm) {
                soundsContainer.classList.remove('collapsed');
            }
        } else {
            section.style.display = 'none';
        }
    });
    
    // Update category filter buttons
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.category-filter-btn[data-category="all"]').classList.add('active');
    currentCategory = 'all';
}

function filterSoundsByCategory(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // Filter sounds
    document.querySelectorAll('.sound-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide categories
    document.querySelectorAll('.sound-category-section').forEach(section => {
        const sectionCategory = section.querySelector('.sound-category-header h4').textContent.toLowerCase();
        if (category === 'all' || sectionCategory.includes(category)) {
            section.style.display = 'block';
            section.querySelector('.category-sounds').classList.remove('collapsed');
        } else {
            section.style.display = 'none';
        }
    });
}

function toggleCategory(category) {
    const container = document.getElementById(`category-${category}`);
    const header = document.querySelector(`[onclick="toggleCategory('${category}')"]`);
    
    if (container.classList.contains('collapsed')) {
        container.classList.remove('collapsed');
        header.classList.remove('collapsed');
    } else {
        container.classList.add('collapsed');
        header.classList.add('collapsed');
    }
}

function attachSoundToCartoon(soundId) {
    const sound = PRE_LOADED_SOUNDS.find(s => s.id === soundId);
    if (!sound) return;
    
    // Add visual feedback
    const soundCard = document.querySelector(`.sound-card[data-sound-id="${soundId}"]`);
    soundCard.style.animation = 'none';
    setTimeout(() => {
        soundCard.style.animation = 'pulse 0.5s';
    }, 10);
    
    // Create sound object in cartoon
    const soundObject = {
        id: soundId,
        name: sound.name,
        emoji: sound.emoji,
        category: sound.category,
        duration: sound.duration,
        timestamp: Date.now(),
        position: { x: Math.random() * 500, y: Math.random() * 400 }
    };
    
    // Store in current cartoon data
    if (!window.cartoonSounds) window.cartoonSounds = [];
    window.cartoonSounds.push(soundObject);
    
    // Visual feedback on canvas
    const ctx = layers[currentLayerIndex].ctx;
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = sound.color;
    ctx.beginPath();
    ctx.arc(soundObject.position.x, soundObject.position.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '20px Arial';
    ctx.fillText(sound.emoji, soundObject.position.x - 10, soundObject.position.y + 5);
    ctx.restore();
    
    // Update canvas
    renderLayers();
    
    // Show notification
    showStatusMessage(`"${sound.name}" attached to cartoon!`, 'success');
}

function preloadImportantSounds() {
    // Pre-load some essential sounds
    const importantSounds = [1, 11, 21, 31, 41]; // Boing, Drum Roll, Punch, Dog Bark, Piano
    importantSounds.forEach(soundId => {
        // In a real implementation, you would pre-load audio buffers
        console.log(`Pre-loaded sound ${soundId}`);
    });
}

function handleSoundUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file (MP3, WAV, OGG)');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const audioData = e.target.result;
        
        // Create a new sound entry
        const newSoundId = PRE_LOADED_SOUNDS.length + 1;
        const newSound = {
            id: newSoundId,
            name: file.name.replace(/\.[^/.]+$/, ""),
            category: 'custom',
            emoji: '🎵',
            duration: 2.0, // Would need actual duration calculation
            color: '#6C5CE7',
            url: 'custom',
            data: audioData
        };
        
        // Add to sounds array
        PRE_LOADED_SOUNDS.push(newSound);
        
        // Update UI
        createSoundCategories();
        updateRecentSounds();
        
        // Play the uploaded sound
        playCustomSound(newSound);
        
        showStatusMessage(`"${newSound.name}" uploaded successfully!`, 'success');
    };
    
    reader.readAsDataURL(file);
}

function playCustomSound(sound) {
    // For custom sounds, we would need to decode the audio data
    alert(`Playing custom sound: ${sound.name}\n\nIn a full implementation, this would decode and play your uploaded audio.`);
    addToRecentSounds(sound);
}

function recordSound() {
    alert('Sound recording would require getUserMedia API.\n\nIn a full implementation, you could record your own sounds here!');
}

function toggleMute() {
    const volumeSlider = document.getElementById('enhancedVolumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    if (volumeSlider.value === '0') {
        volumeSlider.value = '80';
        volumeValue.textContent = '80%';
        if (currentAudio) {
            currentAudio.gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
        }
        showStatusMessage('Sound unmuted', 'success');
    } else {
        volumeSlider.value = '0';
        volumeValue.textContent = '0%';
        if (currentAudio) {
            currentAudio.gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        }
        showStatusMessage('Sound muted', 'warning');
    }
}

function seekSound(event) {
    if (!currentAudio) return;
    
    const progressContainer = document.getElementById('progressContainer');
    const rect = progressContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    // Calculate new time
    const sound = PRE_LOADED_SOUNDS.find(s => s.id === currentAudio.soundId);
    const newTime = percentage * sound.duration;
    
    // Update progress display
    document.getElementById('progressBar').style.width = `${percentage * 100}%`;
    document.getElementById('currentTime').textContent = formatTime(newTime);
    
    // In a real implementation, you would seek in the audio buffer
    showStatusMessage(`Seek to ${formatTime(newTime)}`, 'info');
}

// Update your existing initApp function
function initApp() {
    initCanvas();
    initLayers();
    initColorPresets();
    initSoundLibrary(); // This now uses the pre-loaded sounds
    initExamples();
    initAnimationFrames();
    initEventListeners();
    initModal();
    initWatermark();
    initPrivacySystem();
    updateUI();
}

// Initialize when page loads
window.addEventListener('load', initApp);