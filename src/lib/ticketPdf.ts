import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { getLogoBase64 } from './logoBase64';

export interface TicketData {
  eventName: string;
  category?: string;
  registrationId: string;
  studentName: string;
  studentEmail?: string;
  college?: string;
  branch?: string;
  year?: string;
  prn?: string;
  qrPayload?: string;
  paymentStatus?: string;
  date?: string;
}

/**
 * Generate official Event Entry Pass Ticket PDF with College Logo & QR Code
 */
export async function generateTicketPdf(ticket: TicketData): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // 1. Background
  doc.setFillColor(5, 11, 24); // #050B18
  doc.rect(0, 0, W, H, 'F');

  // 2. Ticket outer card border
  doc.setDrawColor(200, 75, 14); // #C84B0E
  doc.setLineWidth(0.6);
  doc.roundedRect(8, 8, W - 16, H - 16, 4, 4, 'S');

  // 3. Header Accent Bar
  doc.setFillColor(200, 75, 14);
  doc.roundedRect(8, 8, W - 16, 26, 4, 4, 'F');

  // Load and embed College Logo
  const logoBase64 = await getLogoBase64();
  if (logoBase64) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, 11, 20, 20, 2, 2, 'F');
    try {
      doc.addImage(logoBase64, 'JPEG', 13, 12, 18, 18);
    } catch {
      // fallback
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TGPCOP STUDENT COUNCIL', 36, 18);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Tulsiramji Gaikwad Patil College of Pharmacy', 36, 23);
    doc.text('Official Event Entry Pass · Non-Transferable', 36, 28);
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TGPCOP STUDENT COUNCIL', W / 2, 18, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Event Entry Pass', W / 2, 26, { align: 'center' });
  }

  // 4. Event Title & Badge
  let y = 42;
  doc.setFillColor(13, 27, 62);
  doc.roundedRect(12, y, W - 24, 22, 2, 2, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.1);
  doc.roundedRect(12, y, W - 24, 22, 2, 2, 'S');

  doc.setTextColor(255, 179, 56); // gold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text((ticket.category || 'EVENT PASS').toUpperCase(), 16, y + 6);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  const eventLines = doc.splitTextToSize(ticket.eventName, W - 32);
  doc.text(eventLines, 16, y + 13);

  // 5. QR Code Section (Centerpiece for Check-in)
  y = 70;
  const qrPayload = ticket.qrPayload || ticket.registrationId;
  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    margin: 1,
    width: 240,
    color: { dark: '#050B18', light: '#FFFFFF' }
  });

  const qrSize = 44;
  const qrX = (W - qrSize) / 2;

  // QR background panel
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 3, y - 3, qrSize + 6, qrSize + 6, 3, 3, 'F');
  doc.addImage(qrDataUrl, 'PNG', qrX, y, qrSize, qrSize);

  doc.setTextColor(200, 75, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(ticket.registrationId, W / 2, y + qrSize + 7, { align: 'center' });

  doc.setTextColor(140, 150, 180);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Present this QR code at desk for verification', W / 2, y + qrSize + 11, { align: 'center' });

  // 6. Student & Pass Details Table
  y = y + qrSize + 16;
  const details: [string, string][] = [
    ['Attendee Name', ticket.studentName],
    ['Course / Year', [ticket.branch, ticket.year].filter(Boolean).join(' - ') || '—'],
    ['PRN / Roll', ticket.prn || '—'],
    ['Institution', ticket.college || 'TGPCOP Nagpur'],
    ['Pass Status', (ticket.paymentStatus || 'CONFIRMED').toUpperCase()],
  ];

  details.forEach(([lbl, val], idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(13, 27, 62, 0.6);
      doc.rect(12, y - 3.5, W - 24, 7, 'F');
    }
    doc.setTextColor(130, 145, 175);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(lbl, 16, y);

    doc.setTextColor(240, 245, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const splitVal = doc.splitTextToSize(val, W - 68);
    doc.text(splitVal, 56, y);
    y += 7.5;
  });

  // 7. Security Footer
  const footerY = H - 14;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.1);
  doc.line(16, footerY - 4, W - 16, footerY - 4);

  doc.setTextColor(100, 115, 145);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Tulsiramji Gaikwad-Patil College of Pharmacy · Student Council Portal', W / 2, footerY, { align: 'center' });
  doc.text('tgpcopcouncil.online · Authorized digital pass', W / 2, footerY + 3.5, { align: 'center' });

  return doc.output('blob');
}

/**
 * Download Event Ticket Pass directly in browser
 */
export async function downloadTicketPdf(ticket: TicketData): Promise<void> {
  const blob = await generateTicketPdf(ticket);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeId = ticket.registrationId.replace(/[^\w\-]+/g, '_');
  a.download = `TGPCOP_Ticket_${safeId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
