// Edited by Zoie D 5/13/26

/**
 * @file profileUiController.js
 * Handles all DOM interaction: element references, event listener registration,
 * and event handlers.
 */

import CanvasModel from './canvasModel.js';

// DOM References: Image and Canvas
const hiddenImageElement = document.getElementById('hiddenImage');
const canvasElement = document.getElementById('canvas');

export const canvasModel = new CanvasModel();

// ==========================================
// EVENT HANDLERS
// ==========================================

/**
 * Reads the picked file as a base64 data URL so the image source is
 * self-contained and survives any later refactor toward localStorage persistence.
 */
function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImageElement(e.target.result);
        reader.readAsDataURL(file);
    }
}

/** Re-renders on every keystroke so the preview tracks the input live. */
function handleTopTextChange(event) {
    canvasModel.topText = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

/** Re-renders on every keystroke so the preview tracks the input live. */
function handleBottomTextChange(event) {
    canvasModel.bottomText = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

function handleTextColorChange(event) {
    canvasModel.textColor = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

function handleFontFamilyChange(event) {
    canvasModel.fontSelect = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

function handleFontSizeChange(event) {
    canvasModel.fontSize = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

function handleTextOutlineChange(event) {
    canvasModel.textOutline = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

function handleFilterChange(event) {
    canvasModel.filter = event.target.value;
    canvasModel.render(canvasElement);
    canvasModel.storeInLocalStorage();
}

/**
 * Refreshes the anchor's href with a PNG of the current canvas just before the
 * browser's default click action fires; the anchor's `download` attribute then
 * handles the file save, so no preventDefault or synthetic click is needed.
 */
function handleDownloadClick(event) {
    event.currentTarget.href = canvasElement.toDataURL('image/png');
}

// ==========================================
// SETUP FUNCTIONS
// ==========================================

/** Registers all event listeners. */
function setupEventListeners() {
    document.getElementById('image').addEventListener('change', handleImageChange);
    document.getElementById('topText').addEventListener('input', handleTopTextChange);
    document.getElementById('bottomText').addEventListener('input', handleBottomTextChange);
    document.getElementById('textColor').addEventListener('input', handleTextColorChange);
    document.getElementById('fontSelect').addEventListener('change', handleFontFamilyChange);
    document.getElementById('fontSize').addEventListener('input', handleFontSizeChange);
    document.getElementById('textOutline').addEventListener('input', handleTextOutlineChange);
    document.getElementById('filterSelect').addEventListener('change', handleFilterChange);
    document.getElementById('downloadPic').addEventListener('click', handleDownloadClick);
}

/**
 * Sets the hidden image element's src, wires it to the model, and renders on load.
 * @param {string} url - Path or data URL for the image.
 */
function setImageElement(url) {
    canvasModel.imageUrl = url;
    hiddenImageElement.src = url;
    canvasModel.image = hiddenImageElement;
    hiddenImageElement.onload = () => {
        canvasModel.render(canvasElement);
        canvasModel.storeInLocalStorage();
    };
}

/** Sizes the canvas to fit the viewport (capped at 500px). */
function sizeCanvas() {
    canvasElement.height = Math.min(350, window.innerWidth - 30);
    canvasElement.width = Math.min(500, window.innerWidth - 30);
}

/**
 * Initializes the application: wires up event listeners, sizes the canvas,
 * and renders the default image so the canvas is never empty.
 */
export function init() {
    const DEFAULT_IMAGE_FILE = "./images/meow.png";

    setupEventListeners();
    sizeCanvas();

    const saved = CanvasModel.loadLocalStorage();
    if (saved?.imageUrl) {
        Object.assign(canvasModel, saved);
        document.getElementById('topText').value = saved.topText;
        document.getElementById('bottomText').value = saved.bottomText;
        document.getElementById('textColor').value = saved.textColor;
        document.getElementById('fontSelect').value = saved.fontSelect;
        document.getElementById('fontSize').value = saved.fontSize;
        document.getElementById('textOutline').value = saved.textOutline;
        document.getElementById('filterSelect').value = saved.filter;
        setImageElement(saved.imageUrl);
    } else {
        canvasModel.textColor = document.getElementById('textColor').value;
        canvasModel.fontSelect = document.getElementById('fontSelect').value;
        canvasModel.fontSize = parseFloat(document.getElementById('fontSize').value);
        canvasModel.textOutline = document.getElementById('textOutline').value;
        canvasModel.filter = document.getElementById('filterSelect').value;
    setImageElement(DEFAULT_IMAGE_FILE);
    }
}
