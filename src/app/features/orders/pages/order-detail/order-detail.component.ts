import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '@core/services/order.service';
import { Order } from '@core/models';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  locale = 'es-CO';
  order: Order | null = null;
  loading = true;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getMyOrderById(Number(id)).subscribe({
        next: (data) => {
          this.order = data;
          this.loading = false;
        },
        error: () => {
          this.order = null;
          this.loading = false;
        }
      });
    }
  }

  translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'PAID': 'Pagado',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado',
      'RETURN_REQUESTED': 'Devolución Solicitada',
      'REFUNDED': 'Reembolsado'
    };
    return statusMap[status] || status;
  }

  downloadInvoice(): void {
    if (!this.order) return;
    const o = this.order;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'assets/images/cabrejo-gym-logo.png';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const logoBase64 = canvas.toDataURL('image/png');
      this.generatePdf(o, logoBase64);
    };

    img.onerror = () => {
      // Si no carga el logo, genera sin él
      this.generatePdf(o, null);
    };
  }

  private generatePdf(o: Order, logoBase64: string | null): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const W = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentW = W - margin * 2;

    const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const fmtDate = (d: string) => {
      const dt = new Date(d);
      return dt.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // === HEADER BAND ===
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, W, 48, 'F');

    // Logo
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', margin, 6, 36, 36);
    }

    const textStart = logoBase64 ? margin + 40 : margin;

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Equipamiento Deportivo Profesional', textStart, 18);
    doc.text('NIT: 20123456789', textStart, 24);
    doc.text('Av. Principal 123, Neiva, Colombia', textStart, 30);
    doc.text('Tel: (01) 234-5678', textStart, 36);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', W - margin, 16, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(`N° Pedido: #${o.orderNumber}`, W - margin, 24, { align: 'right' });
    doc.text(`Fecha: ${fmtDate(o.createdAt)}`, W - margin, 30, { align: 'right' });
    doc.text(`Estado: ${this.translateStatus(o.status)}`, W - margin, 36, { align: 'right' });

    let y = 58;

    // === CUSTOMER INFO ===
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Cliente', margin, y);
    y += 3;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, W - margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Email: ${o.userEmail}`, margin, y);
    y += 6;

    if (o.shippingAddress) {
      const addr = o.shippingAddress;
      const parts = [addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(', ');
      if (parts) {
        doc.text(`Dirección: ${parts}`, margin, y);
        y += 6;
      }
    }

    y += 8;

    // === ITEMS TABLE ===
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle del Pedido', margin, y);
    y += 3;
    doc.line(margin, y, W - margin, y);
    y += 2;

    const colX = { product: margin, qty: 130, price: 155, subtotal: W - margin - 2 };
    y += 6;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 5, contentW, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Producto', colX.product + 2, y);
    doc.text('Cant.', colX.qty, y, { align: 'center' });
    doc.text('Precio Unit.', colX.price, y, { align: 'right' });
    doc.text('Subtotal', colX.subtotal, y, { align: 'right' });
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);

    const maxProductWidth = colX.qty - colX.product - 12;

    for (const item of o.items) {
      let name = item.productName;
      // Truncar si excede el ancho disponible
      while (doc.getTextWidth(name) > maxProductWidth && name.length > 3) {
        name = name.substring(0, name.length - 4) + '...';
      }

      doc.text(name, colX.product + 2, y);
      doc.text(String(item.quantity), colX.qty, y, { align: 'center' });
      doc.text(fmt(item.unitPrice), colX.price, y, { align: 'right' });
      doc.text(fmt(item.lineTotal), colX.subtotal, y, { align: 'right' });

      y += 3;
      doc.setDrawColor(240, 240, 240);
      doc.line(margin, y, W - margin, y);
      y += 5;
    }

    y += 6;

    // === TOTALS ===
    const totalsX = 140;
    const totalsValX = W - margin - 2;

    doc.setDrawColor(220, 220, 220);
    doc.line(totalsX, y - 2, W - margin, y - 2);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Subtotal:', totalsX, y + 4);
    doc.setTextColor(50, 50, 50);
    doc.text(fmt(o.subtotal), totalsValX, y + 4, { align: 'right' });

    let totY = y + 4;

    if (o.discount > 0) {
      totY += 7;
      doc.setTextColor(100, 100, 100);
      doc.text('Descuento:', totalsX, totY);
      doc.setTextColor(220, 50, 50);
      doc.text(`-${fmt(o.discount)}`, totalsValX, totY, { align: 'right' });
    }

    if (o.shipping > 0) {
      totY += 7;
      doc.setTextColor(100, 100, 100);
      doc.text('Envío:', totalsX, totY);
      doc.setTextColor(50, 50, 50);
      doc.text(fmt(o.shipping), totalsValX, totY, { align: 'right' });
    }

    totY += 4;
    doc.setDrawColor(26, 26, 26);
    doc.setLineWidth(0.5);
    doc.line(totalsX, totY, W - margin, totY);
    totY += 7;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('TOTAL:', totalsX, totY);
    doc.text(fmt(o.total), totalsValX, totY, { align: 'right' });

    // === FOOTER ===
    const footerY = doc.internal.pageSize.getHeight() - 25;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, W - margin, footerY);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('¡Gracias por tu compra!', W / 2, footerY + 8, { align: 'center' });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Este documento es una representación de una factura electrónica. Para consultas: soporte@cabrejogym.com',
      W / 2, footerY + 14, { align: 'center' }
    );

    doc.save(`factura-${o.orderNumber}.pdf`);
  }
}
