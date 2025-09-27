// helper to draw rounded rect
const roundRect = (ctx, x, y, w, h, r) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

// create a PictureMarkerSymbol from text
export const makeLabelPicture = (text, options = {}) => {
    const fontSize = options.fontSize || 12;           // px
    const fontWeight = options.fontWeight || "bold";
    const fontFamily = options.fontFamily || "Arial";
    const padding = options.padding ?? 6;              // px
    const radius = options.radius ?? 4;                // rounded corner radius
    const bg = options.backgroundColor || "#000";      // black
    const fg = options.textColor || "#fff";           // white

    // temp canvas to measure
    const meas = document.createElement("canvas");
    const mctx = meas.getContext("2d");
    mctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = mctx.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const width = textWidth + padding * 2;
    const height = Math.ceil(fontSize + padding * 2);

    // actual canvas (reset size after measurement)
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // set font again after sizing canvas
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";

    // draw background (rounded rect)
    ctx.fillStyle = bg;
    roundRect(ctx, 0, 0, width, height, radius);
    ctx.fill();

    // draw text
    ctx.fillStyle = fg;
    ctx.fillText(text, padding, padding);

    const dataUrl = canvas.toDataURL("image/png");

    // return a PictureMarkerSymbol object usable for Graphic.symbol
    return {
        type: "picture-marker",   // autocasts to PictureMarkerSymbol
        url: dataUrl,
        width: `${width}px`,
        height: `${height}px`,
        xoffset: options.xoffset ?? 0,
        yoffset: options.yoffset ?? 15    // tweak to position relative to your train icon
    };
}