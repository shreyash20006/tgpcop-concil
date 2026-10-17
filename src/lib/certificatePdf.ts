import jsPDF from 'jspdf';
import { getLogoBase64 } from './logoBase64';

export interface CertificateData {
  studentName: string;
  eventName: string;
  registrationId: string;
  date: string;
  year?: string;
  college?: string;
}

const C = {
  navy: [13, 27, 62] as [number, number, number],
  orange: [230, 81, 0] as [number, number, number],
  gold: [255, 179, 56] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  text: [220, 228, 245] as [number, number, number],
};

function drawCertificatePage(doc: jsPDF, cert: CertificateData, logoBase64?: string | null): void {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setFillColor(...C.navy);
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(...C.orange);
  doc.setLineWidth(1.2);
  doc.rect(12, 12, W - 24, H - 24);
  doc.setLineWidth(0.4);
  doc.rect(16, 16, W - 32, H - 32);

  doc.setFillColor(...C.orange);
  doc.rect(12, 12, W - 24, 3, 'F');

  // Official College Emblem at top center
  if (logoBase64) {
    const logoSize = 18;
    const logoX = (W - logoSize) / 2;
    const logoY = 19;
    // Circular white background for crisp contrast against navy
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(logoX - 1.5, logoY - 1.5, logoSize + 3, logoSize + 3, 2, 2, 'F');
    try {
      doc.addImage(logoBase64, 'JPEG', logoX, logoY, logoSize, logoSize);
    } catch {
      // safe fallback
    }
  }

  const startY = logoBase64 ? 43 : 38;

  doc.setTextColor(...C.gold);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TGPCOP STUDENT COUNCIL', W / 2, startY, { align: 'center' });

  doc.setTextColor(...C.white);
  doc.setFontSize(26);
  doc.text('Certificate of Participation', W / 2, startY + 18, { align: 'center' });

  doc.setDrawColor(...C.orange);
  doc.setLineWidth(0.5);
  doc.line(W * 0.25, startY + 25, W * 0.75, startY + 25);

  doc.setTextColor(...C.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('This is to certify that', W / 2, startY + 39, { align: 'center' });

  doc.setTextColor(...C.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(cert.studentName, W / 2, startY + 53, { align: 'center' });

  doc.setTextColor(...C.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const yearLine = cert.year ? ` (${cert.year})` : '';
  doc.text(`has successfully participated in${yearLine}`, W / 2, startY + 65, { align: 'center' });

  doc.setTextColor(...C.orange);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const eventLines = doc.splitTextToSize(cert.eventName, W - 60);
  doc.text(eventLines, W / 2, startY + 79, { align: 'center' });

  doc.setTextColor(...C.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Registration ID: ${cert.registrationId}`, W / 2, startY + 97, { align: 'center' });
  if (cert.college) {
    doc.text(cert.college, W / 2, startY + 104, { align: 'center' });
  }
  doc.text(`Date: ${cert.date}`, W / 2, startY + 112, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(120, 130, 160);
  doc.text('Issued only to verified attendees (checked in at event entry)', W / 2, H - 24, { align: 'center' });
  doc.text('tgpcopcouncil.online', W / 2, H - 18, { align: 'center' });
}

/** Generate a single participation certificate PDF */
export async function generateCertificatePdf(cert: CertificateData): Promise<void> {
  const logoBase64 = await getLogoBase64();
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  drawCertificatePage(doc, cert, logoBase64);
  const safeName = cert.studentName.replace(/[^\w\-]+/g, '_').slice(0, 30);
  doc.save(`TGPCOP_Certificate_${safeName}.pdf`);
}

/** Generate bulk certificates (one page per checked-in student) */
export async function generateBulkCertificatesPdf(certs: CertificateData[], eventName: string): Promise<void> {
  if (certs.length === 0) return;
  const logoBase64 = await getLogoBase64();
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  certs.forEach((cert, i) => {
    if (i > 0) doc.addPage();
    drawCertificatePage(doc, cert, logoBase64);
  });
  const safeEvent = eventName.replace(/[^\w\-]+/g, '_').slice(0, 30);
  doc.save(`TGPCOP_Certificates_${safeEvent}_${new Date().toISOString().split('T')[0]}.pdf`);
}
