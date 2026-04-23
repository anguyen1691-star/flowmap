import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

function captureFilter(node) {
  // Exclude zoom controls and any UI overlays from the export
  if (node.dataset?.exportExclude === 'true') return false;
  return true;
}

export async function exportPNG(canvasRef, filename = 'flowmap.png') {
  if (!canvasRef.current) return;

  try {
    const dataUrl = await toPng(canvasRef.current, {
      quality: 1,
      pixelRatio: 2,
      filter: captureFilter,
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export PNG:', err);
    alert('Failed to export PNG. Check console for details.');
  }
}

export async function exportPDF(canvasRef, filename = 'flowmap.pdf') {
  if (!canvasRef.current) return;

  try {
    const dataUrl = await toPng(canvasRef.current, {
      quality: 1,
      pixelRatio: 2,
      filter: captureFilter,
    });

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 297;
      const imgHeight = (img.height / img.width) * imgWidth;

      pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth - 20, imgHeight);
      pdf.save(filename);
    };
  } catch (err) {
    console.error('Failed to export PDF:', err);
    alert('Failed to export PDF. Check console for details.');
  }
}
