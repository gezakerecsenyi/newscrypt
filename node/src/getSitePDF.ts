import html_to_pdf from "html-pdf-node";

export default async function getSitePDF(url: string): Promise<Buffer> {
    let file = { url };
    return new Promise(resolve => {
        html_to_pdf.generatePdf(file, {format: 'A4', printBackground: false }, (err, pdfBuffer) => {
            resolve(pdfBuffer);
        });
    });
}