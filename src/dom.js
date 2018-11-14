export function createCanvasContext2D(opt_width, opt_height) {
    if (document.createElement === undefined) {
        return {};
    }
    const canvas = /** @type {HTMLCanvasElement} */ (document.createElement('canvas'));
    if (opt_width) {
        canvas.width = opt_width;
    }
    if (opt_height) {
        canvas.height = opt_height;
    }
    return /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
}
