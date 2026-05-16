// Edited by Zoie D 5/13/26

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
        /** -- @type {string} for background */
        this.bgColor = '#ffffff';
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

        // background
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, width, height);

        // drawing func from MemeMaker example
        // scales and rotates around a center so img stays
        // anchored to the middle
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(this.rotate * Math.PI / 180);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-width / 2, -height / 2);
        ctx.drawImage(this.image, 0, 0, width, height);
        ctx.restore();
        
        // draws a rectangular image with rounded corners
        ctx.save();
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.arcTo(0, 350, 8, 350, 8);
        ctx.arcTo(500, 350, 500, 342, 8);
        ctx.arcTo(500, 0, 492, 0, 8);
        ctx.arcTo(0, 0, 0, 8, 8);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(this.image, 0, 0, 500, 350);

        // filter func from MemeMaker example
        if (this.filter !== 'none') {
            const imageData = ctx.getImageData(0, 0, width, height);
            ctx.putImageData(lenaJS[this.filter](imageData), 0, 0);
        }

        this.#drawText(ctx, canvasElement);
        
        // redraws the same image path to create a border around the image
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.arcTo(0, 350, 8, 350, 8);
        ctx.arcTo(500, 350, 500, 342, 8);
        ctx.arcTo(500, 0, 492, 0, 8);
        ctx.arcTo(0, 0, 0, 8, 8);
        ctx.closePath();
        ctx.clip();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 10;
        ctx.stroke();
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
