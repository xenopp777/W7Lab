// Edited by Zoie D 5/13/26 w/ help from copilot

/**
 * @file canvasModel.js
 * Plain data model holding all settings needed to render the canvas.
 */

import * as lenaJS from 'lena.js';

const STORAGE_KEY = 'profilemaker-model';
/**
 * Stores the current state of the canvas rendering parameters and draws itself.
 */
export default class CanvasModel {
    constructor() {
        /** @type {HTMLImageElement|null} The image to draw on the canvas. */
        this.image = null;
        /** @type {string} */
        this.topText = '';
        /** @type {string} */
        this.bottomText = '';
        /** @type {string} */
        this.textColor = '#ffffff';
        /** @type {string} */
        this.fontSelect = 'sans-serif';
        /** @type {number} */
        this.fontSize = 42;
        /** @type {string} */
        this.textOutline = '#000000';
        /** @type {string} */
        this.filter = 'none';
        /** @type {string} */
        this.bgColor = '#ffffff';
        /** @type {boolean} edit mode */ 
        this.modePan = true;
        /** @type {boolean} draw mode */
        this.modeDraw = false;
        /** @type {array} drawing paths recorded for localStorage */
        this.paths = [];
        /** @type {string} freehand pen color*/
        this.penColor = '#ff0000';
        /** @type {number} freehand pen size */
        this.penSize = 5;
        /** @type {string} */
        this.imageUrl = '';
        /** @type {number} */
        this.rotate = 0;
        /** @type {number} */
        this.scale = 1;
    }

    // localStorage functions from MemeMaker example
    // persists model state
    storeInLocalStorage = () => {
        const { image, ...convert } = this;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(convert));
        } catch {
            // err msg expected
        }
    }
    // returns saved model state
    static loadLocalStorage = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Clears the canvas, draws the current image stretched to fill it, then
     * layers the top and bottom text on top.
     * @param {HTMLCanvasElement} canvasElement
     */
    render(canvasElement) {
        const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
        const { width, height } = canvasElement;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, width, height);

        if (this.image) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 8);
            ctx.arcTo(0, height, 8, height, 8);
            ctx.arcTo(width, height, width, height - 8, 8);
            ctx.arcTo(width, 0, width - 8, 0, 8);
            ctx.arcTo(0, 0, 0, 8, 8);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(this.image, 0, 0, width, height);

            if (this.filter !== 'none') {
                const imageData = ctx.getImageData(0, 0, width, height);
                ctx.putImageData(lenaJS[this.filter](imageData), 0, 0);
            }
            ctx.restore();

            this.#drawPaths(ctx);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 8);
            ctx.arcTo(0, height, 8, height, 8);
            ctx.arcTo(width, height, width, height - 8, 8);
            ctx.arcTo(width, 0, width - 8, 0, 8);
            ctx.arcTo(0, 0, 0, 8, 8);
            ctx.closePath();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 10;
            ctx.stroke();
            ctx.restore();
        } else {
            this.#drawPaths(ctx);
        }

        this.#drawText(ctx, canvasElement);
    }

    #drawPaths(ctx) {
        if (!Array.isArray(this.paths)) {
            return;
        }

        for (const path of this.paths) {
            if (!path?.pts?.length) continue;

            ctx.save();
            ctx.strokeStyle = path.color || '#ff0000';
            ctx.lineWidth = path.size || 5;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(path.pts[0].x, path.pts[0].y);

            for (let i = 1; i < path.pts.length; i += 1) {
                ctx.lineTo(path.pts[i].x, path.pts[i].y);
            }

            ctx.stroke();
            ctx.restore();
        }
    }

    /**
     * Draws top and bottom text onto the canvas with a stroked outline for legibility.
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLCanvasElement} canvasElement
     */
    #drawText(ctx, canvasElement) {
        const fontSize = Math.floor(canvasElement.width / 10);
        ctx.font = `bold ${this.fontSize}px ${this.fontSelect}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `${this.textColor}`;
        ctx.strokeStyle = `${this.textOutline}`;
        ctx.lineWidth = fontSize / 24;

        if (this.topText) {
            ctx.fillText(this.topText, canvasElement.width / 2, fontSize);
            ctx.strokeText(this.topText, canvasElement.width / 2, fontSize);
        }
        if (this.bottomText) {
            ctx.fillText(this.bottomText, canvasElement.width / 2, canvasElement.height - fontSize / 4);
            ctx.strokeText(this.bottomText, canvasElement.width / 2, canvasElement.height - fontSize / 4);
        }
    }
}
