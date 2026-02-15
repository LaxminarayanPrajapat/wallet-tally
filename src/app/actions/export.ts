
'use server';

import { sendMail } from '@/lib/email';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

/**
 * @fileOverview Server action to generate a transaction report PDF and email it to the user.
 */

export async function exportTransactionsToPdf(
  email: string,
  transactions: any[],
  startDate: string,
  endDate: string,
  currencySymbol: string
) {
  try {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Logo / Brand Visual (Simulated with shapes since we don't have binary images)
    // Draw a wallet-like icon
    doc.save();
    doc.translate(260, 40);
    doc.roundedRect(-20, -15, 40, 30, 5).fill('#1e3a8a');
    doc.roundedRect(10, -5, 15, 10, 2).fill('#064e3b');
    doc.circle(18, 0, 2).fill('#ffffff');
    doc.restore();

    // Header Title
    doc
      .fillColor('#1a2e3a')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('Wallet Tally', { align: 'center', dy: 40 });

    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Your Personal Finance Report', { align: 'center' })
      .moveDown(2);

    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown();

    // Report Info
    doc
      .fillColor('#1a2e3a')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Period: ${format(new Date(startDate), 'PPP')} - ${format(new Date(endDate), 'PPP')}`)
      .text(`Generated on: ${format(new Date(), 'PPP')}`)
      .moveDown(2);

    // Table Header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 130;
    const col3 = 200;
    const col4 = 350;
    const col5 = 450;

    doc
      .fillColor('#1a2e3a')
      .font('Helvetica-Bold')
      .text('Date', col1, tableTop)
      .text('Type', col2, tableTop)
      .text('Category', col3, tableTop)
      .text('Description', col4, tableTop)
      .text('Amount', col5, tableTop, { align: 'right' });

    doc
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table Rows
    let currentY = tableTop + 25;
    transactions.forEach((t) => {
      // Check for page overflow
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      // Handle the ISO string date passed from client
      const dateStr = t.date ? format(new Date(t.date), 'MM/dd/yyyy') : 'N/A';
      const amountStr = `${t.type === 'income' ? '+' : '-'}${currencySymbol}${Number(t.amount || 0).toFixed(2)}`;

      doc
        .font('Helvetica')
        .fillColor('#475569')
        .text(dateStr, col1, currentY)
        .text(t.type || '-', col2, currentY, { capitalization: 'capitalize' })
        .text(t.category || '-', col3, currentY)
        .text(t.description || '-', col4, currentY, { width: 90, height: 20, ellipsis: true })
        .fillColor(t.type === 'income' ? '#10b981' : '#ef4444')
        .text(amountStr, col5, currentY, { align: 'right' });

      currentY += 25;
    });

    // Footer
    doc
      .fontSize(8)
      .fillColor('#94a3b8')
      .text(
        'Thank you for using Wallet Tally to manage your finances.',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    await sendMail({
      to: email,
      subject: `Wallet Tally Transaction Report: ${startDate} to ${endDate}`,
      text: `Please find attached your Wallet Tally transaction report for the period ${startDate} to ${endDate}.`,
      html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #23414d;">Your Transaction Report is Ready!</h2>
          <p>We have generated a detailed PDF of your recorded transactions as requested.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 0; font-weight: bold;">Reporting Period:</p>
            <p style="margin: 4px 0; color: #64748b;">${format(new Date(startDate), 'PPP')} - ${format(new Date(endDate), 'PPP')}</p>
          </div>
          <p>Please check the attachment to view your report.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Sent by Wallet Tally Secure Reporting Service</p>
        </div>
      `,
      attachments: [
        {
          filename: `WalletTally_Report_${startDate}_${endDate}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('PDF Export Error:', error);
    return { success: false, error: error.message };
  }
}
