import { jsPDF } from "jspdf";

interface StickerItem {
    url: string;
    size: "small" | "regular" | "large";
    qty: number;
}

const PAGE_SIZE = {
    A4: { width: 210, height: 297 },
    CRICUT_SAFE: { width: 183, height: 269 }
};

const STICKER_SIZES = {
    small: { w: 50.8, h: 76.2 },    // 2x3"
    regular: { w: 76.2, h: 101.6 }, // 3x4"
    large: { w: 101.6, h: 127.0 }   // 4x5"
};

/**
 * Generates an A4 PDF with stickers laid out for Cricut Print Then Cut.
 * Returns the PDF as a Buffer.
 */
export async function generateStickerPDF(items: StickerItem[]): Promise<Buffer> {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const size = STICKER_SIZES[item.size.toLowerCase() as keyof typeof STICKER_SIZES] || STICKER_SIZES.regular;

        // Load image as Uint8Array
        const imgData = await fetchImageAsUint8Array(item.url);

        // Calculate how many fit on one page
        // For simplicity and Cricut Joy Xtra limits, we'll do 4 stickers per pack.
        // Small/Regular fits 2x2 on one page. Large fits 1x2 per page (2 pages total).

        if (item.size.toLowerCase() === "large") {
            // Page 1: 2 stickers
            addRegistrationMarks(doc);
            await addStickersToPage(doc, imgData, size, 2);

            // Page 2: 2 stickers
            doc.addPage();
            addRegistrationMarks(doc);
            await addStickersToPage(doc, imgData, size, 2);
        } else {
            // 4 stickers on one page
            if (i > 0) doc.addPage();
            addRegistrationMarks(doc);
            await addStickersToPage(doc, imgData, size, 4);
        }
    }

    return Buffer.from(doc.output("arraybuffer"));
}

function addRegistrationMarks(doc: jsPDF) {
    const margin = 10;
    const size = 6;
    doc.setDrawColor(0);
    doc.setLineWidth(1);

    // Top Left
    doc.line(margin, margin, margin + size, margin);
    doc.line(margin, margin, margin, margin + size);

    // Top Right
    doc.line(PAGE_SIZE.A4.width - margin, margin, PAGE_SIZE.A4.width - (margin + size), margin);
    doc.line(PAGE_SIZE.A4.width - margin, margin, PAGE_SIZE.A4.width - margin, margin + size);

    // Bottom Left
    doc.line(margin, PAGE_SIZE.A4.height - margin, margin + size, PAGE_SIZE.A4.height - margin);
    doc.line(margin, PAGE_SIZE.A4.height - margin, margin, PAGE_SIZE.A4.height - (margin + size));

    // Bottom Right
    doc.line(PAGE_SIZE.A4.width - margin, PAGE_SIZE.A4.height - margin, PAGE_SIZE.A4.width - (margin + size), PAGE_SIZE.A4.height - margin);
    doc.line(PAGE_SIZE.A4.width - margin, PAGE_SIZE.A4.height - margin, PAGE_SIZE.A4.width - margin, PAGE_SIZE.A4.height - (margin + size));
}

async function addStickersToPage(doc: jsPDF, imgData: Uint8Array, size: { w: number, h: number }, count: number) {
    const startX = (PAGE_SIZE.A4.width - (size.w * (count > 1 ? 2 : 1) + 10)) / 2;
    const startY = 30;
    const padding = 10;

    for (let i = 0; i < count; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);

        const x = startX + (col * (size.w + padding));
        const y = startY + (row * (size.h + padding));

        // Pass Uint8Array directly for better Node.js compatibility
        doc.addImage(imgData, "PNG", x, y, size.w, size.h);
    }
}

async function fetchImageAsUint8Array(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
}
