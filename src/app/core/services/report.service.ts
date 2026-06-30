import { Injectable } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private notificationService: NotificationService) {}

  generateCompleteReport(data: any): void {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');

    if (!printWindow) {
      this.notificationService.error('Por favor, permite las ventanas emergentes para generar el reporte');
      return;
    }

    const html = this.buildReportHTML(data);
    printWindow.document.write(html);
    printWindow.document.close();
  }

  private buildReportHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte Ejecutivo - Cabrejo Gym</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        ${this.getStyles()}
      </head>
      <body>
        ${this.buildContent(data)}
        ${this.buildChartScripts(data)}
      </body>
      </html>
    `;
  }

  private getStyles(): string {
    return `
      <style>
        /* Estilos del reporte */
      </style>
    `;
  }

  private buildContent(data: any): string {
    return '';
  }

  private buildChartScripts(data: any): string {
    return '';
  }

  generateFullReport(reportData: {
    allOrders: any[];
    allProducts: any[];
    allUsers: any[];
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    currentYear: number;
    salesChartImage: string;
    topProductsChartImage: string;
    categoriesChartImage: string;
  }): void {
    
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      this.notificationService.error('Por favor, permite las ventanas emergentes para generar el reporte');
      return;
    }

    const timestamp = new Date();
    const reportVersion = '1.0';
    
    // Calcular estadísticas
    const stats = this.calculateStatistics(reportData);
    
    // Generar HTML completo
    const html = this.generateReportHTML(reportData, stats, timestamp, reportVersion);
    
    printWindow.document.write(html);
    printWindow.document.close();
  }

  private calculateStatistics(data: any): any {
    const orders = data.allOrders;
    
    // Pedidos por estado
    const ordersByStatus = {
      shipped: orders.filter((o: any) => o.status === 'SHIPPED'),
      delivered: orders.filter((o: any) => o.status === 'DELIVERED'),
      pending: orders.filter((o: any) => o.status === 'PENDING'),
      paid: orders.filter((o: any) => o.status === 'PAID'),
      returnRequested: orders.filter((o: any) => o.status === 'RETURN_REQUESTED'),
      refunded: orders.filter((o: any) => o.status === 'REFUNDED'),
      cancelled: orders.filter((o: any) => o.status === 'CANCELLED')
    };

    // Ingresos mensuales
    const monthlyRevenue = new Array(12).fill(0);
    orders.forEach((order: any) => {
      const date = new Date(order.createdAt);
      if (date.getFullYear() === data.currentYear) {
        monthlyRevenue[date.getMonth()] += order.total;
      }
    });

    return {
      ordersByStatus,
      monthlyRevenue,
      avgOrderValue: data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0
    };
  }

  private generateReportHTML(data: any, stats: any, timestamp: Date, version: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Ejecutivo - Cabrejo Gym</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  ${this.getReportStyles()}
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
  
  ${this.generateCoverPage(timestamp, version)}
  ${this.generateTableOfContents()}
  ${this.generateVersioning(version, timestamp)}
  ${this.generateIntroduction()}
  ${this.generateObjectives()}
  ${this.generateScope(data.currentYear)}
  ${this.generateDescriptiveInfo(data, stats)}
  ${this.generateChartsSection(data)}
  ${this.generateInventorySection(data.allProducts)}
  ${this.generateRevenueTable(stats.monthlyRevenue, data.currentYear)}
  ${this.generateOrderTables(stats.ordersByStatus)}
  ${this.generateUsersTable(data.allUsers)}
  ${this.generateConclusion(data, stats)}
  ${this.generateFooter(data.currentYear)}
  
  ${this.generateChartScripts(stats)}
</body>
</html>`;
  }


  private getReportStyles(): string {
    return `<style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; color: #1a1a1a; }
      .page { padding: 60px 40px; page-break-after: always; }
      .no-print { display: block; }
      @media print { .no-print { display: none !important; } }
      
      .print-btn {
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #fff212; color: #1a1a1a; border: none;
        padding: 12px 24px; border-radius: 8px; font-size: 16px;
        font-weight: bold; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      .print-btn:hover { background: #e6d910; }
      
      .cover { text-align: center; padding: 200px 40px; }
      .cover h1 { font-size: 48px; color: #1a1a1a; margin-bottom: 20px; }
      .cover .subtitle { font-size: 24px; color: #666; margin-bottom: 40px; }
      .cover .version { font-size: 18px; color: #999; }
      
      .section { margin: 40px 0; page-break-inside: avoid; }
      .section-title { font-size: 28px; color: #1a1a1a; margin-bottom: 20px; border-bottom: 3px solid #fff212; padding-bottom: 10px; }
      .subsection-title { font-size: 22px; color: #1a1a1a; margin: 30px 0 15px; }
      
      .toc { padding: 40px; }
      .toc-item { padding: 10px 0; border-bottom: 1px dotted #ccc; display: flex; justify-content: space-between; }
      .toc-item:hover { background: #f8f8f8; }
      
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th { background: #1a1a1a; color: #fff212; padding: 12px; text-align: left; font-size: 14px; }
      td { padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
      tr:hover { background: #f8f8f8; }
      
      .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
      .kpi-card { background: #f8f8f8; padding: 20px; border-radius: 8px; border-left: 4px solid #fff212; }
      .kpi-label { font-size: 14px; color: #666; margin-bottom: 8px; }
      .kpi-value { font-size: 32px; font-weight: bold; color: #1a1a1a; }
      
      .chart-container { margin: 30px 0; text-align: center; page-break-inside: avoid; }
      .chart-container canvas { max-width: 100%; height: 300px; }
      .chart-container img { max-width: 100%; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; }
      
      .footer { margin-top: 60px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center; color: #999; font-size: 12px; }
      
      p { line-height: 1.6; margin: 10px 0; }
      ul { margin: 15px 0 15px 30px; }
      li { margin: 8px 0; line-height: 1.6; }
    </style>`;
  }

  private generateCoverPage(timestamp: Date, version: string): string {
    return `<div class="page cover">
      <h1>📊 REPORTE EJECUTIVO</h1>
      <div class="subtitle">Cabrejo Gym - Plataforma E-commerce</div>
      <div class="version">
        <p>Versión ${version}</p>
        <p>Generado el ${timestamp.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>${timestamp.toLocaleTimeString('es-CO')}</p>
      </div>
    </div>`;
  }

  private generateTableOfContents(): string {
    return `<div class="page toc">
      <h2 class="section-title">Tabla de Contenido</h2>
      <div class="toc-item"><span>1. Versionamiento</span><span>Pág. 3</span></div>
      <div class="toc-item"><span>2. Introducción</span><span>Pág. 4</span></div>
      <div class="toc-item"><span>3. Objetivos</span><span>Pág. 5</span></div>
      <div class="toc-item"><span>4. Alcance</span><span>Pág. 6</span></div>
      <div class="toc-item"><span>5. Información Descriptiva</span><span>Pág. 7</span></div>
      <div class="toc-item"><span>6. Gráficos de Análisis</span><span>Pág. 8</span></div>
      <div class="toc-item"><span>7. Inventario Final</span><span>Pág. 10</span></div>
      <div class="toc-item"><span>8. Tabla de Ingresos</span><span>Pág. 11</span></div>
      <div class="toc-item"><span>9. Análisis de Pedidos</span><span>Pág. 12</span></div>
      <div class="toc-item"><span>10. Usuarios Registrados</span><span>Pág. 18</span></div>
      <div class="toc-item"><span>11. Conclusión</span><span>Pág. 19</span></div>
    </div>`;
  }

  private generateVersioning(version: string, timestamp: Date): string {
    return `<div class="page">
      <h2 class="section-title">1. Versionamiento</h2>
      <table>
        <thead>
          <tr><th>Versión</th><th>Fecha</th><th>Descripción</th><th>Autor</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>${version}</td>
            <td>${timestamp.toLocaleDateString('es-CO')}</td>
            <td>Reporte inicial generado automáticamente</td>
            <td>Sistema Cabrejo Gym</td>
          </tr>
        </tbody>
      </table>
    </div>`;
  }

  private generateIntroduction(): string {
    return `<div class="page">
      <h2 class="section-title">2. Introducción</h2>
      <p>El presente reporte ejecutivo tiene como finalidad proporcionar una visión integral del desempeño de la plataforma e-commerce de Cabrejo Gym. Este documento consolida información clave sobre ventas, inventario, pedidos y usuarios registrados en el sistema.</p>
      <p>El análisis presentado permite a la dirección tomar decisiones informadas basadas en datos actualizados y métricas relevantes del negocio. Cada sección incluye visualizaciones gráficas y tablas detalladas para facilitar la comprensión de la información.</p>
      <p>Este reporte se genera de forma automática y refleja el estado actual del sistema al momento de su creación, garantizando la precisión y actualidad de los datos presentados.</p>
    </div>`;
  }

  private generateObjectives(): string {
    return `<div class="page">
      <h2 class="section-title">3. Objetivos</h2>
      
      <h3 class="subsection-title">3.1 Objetivo General</h3>
      <p>Analizar el rendimiento integral de la plataforma e-commerce de Cabrejo Gym mediante la evaluación de indicadores clave de desempeño (KPIs), ventas, inventario y comportamiento de usuarios.</p>
      
      <h3 class="subsection-title">3.2 Objetivos Específicos</h3>
      <ul>
        <li>Evaluar el volumen de ventas y su distribución temporal</li>
        <li>Analizar el estado actual del inventario de productos</li>
        <li>Monitorear el flujo de pedidos según su estado de procesamiento</li>
        <li>Identificar los productos más vendidos y su contribución a los ingresos</li>
        <li>Examinar el crecimiento y comportamiento de la base de usuarios</li>
        <li>Detectar oportunidades de mejora en la gestión operativa</li>
      </ul>
    </div>`;
  }

  private generateScope(year: number): string {
    return `<div class="page">
      <h2 class="section-title">4. Alcance</h2>
      <p><strong>Período del Reporte:</strong> Año ${year}</p>
      <p><strong>Datos Incluidos:</strong></p>
      <ul>
        <li>Todas las transacciones de ventas registradas en el sistema</li>
        <li>Inventario completo de productos con stock actualizado</li>
        <li>Pedidos en todos los estados: pendientes, pagados, enviados, entregados, cancelados y reembolsados</li>
        <li>Base de datos completa de usuarios registrados</li>
        <li>Métricas de rendimiento y KPIs principales</li>
      </ul>
      <p><strong>Exclusiones:</strong></p>
      <ul>
        <li>Datos de años anteriores (solo se incluyen para comparación cuando es relevante)</li>
        <li>Información personal sensible de usuarios (cumplimiento GDPR)</li>
      </ul>
    </div>`;
  }


  private generateDescriptiveInfo(data: any, stats: any): string {
    return `<div class="page">
      <h2 class="section-title">5. Información Descriptiva de la Actividad</h2>
      
      <h3 class="subsection-title">5.1 Resumen Ejecutivo</h3>
      <p>Durante el período analizado, la plataforma e-commerce de Cabrejo Gym ha procesado un total de <strong>${data.totalOrders} pedidos</strong>, generando ingresos por <strong>$${data.totalSales.toLocaleString('es-CO')}</strong>. El valor promedio por pedido es de <strong>$${stats.avgOrderValue.toLocaleString('es-CO')}</strong>.</p>
      
      <h3 class="subsection-title">5.2 Indicadores Clave de Desempeño (KPIs)</h3>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Ventas Totales</div>
          <div class="kpi-value">$${data.totalSales.toLocaleString('es-CO')}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Pedidos</div>
          <div class="kpi-value">${data.totalOrders}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Productos Activos</div>
          <div class="kpi-value">${data.totalProducts}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Usuarios Registrados</div>
          <div class="kpi-value">${data.totalUsers}</div>
        </div>
      </div>
      
      <h3 class="subsection-title">5.3 Distribución de Pedidos por Estado</h3>
      <table>
        <thead>
          <tr><th>Estado</th><th>Cantidad</th><th>Porcentaje</th></tr>
        </thead>
        <tbody>
          <tr><td>Enviados</td><td>${stats.ordersByStatus.shipped.length}</td><td>${((stats.ordersByStatus.shipped.length / data.totalOrders) * 100).toFixed(1)}%</td></tr>
          <tr><td>Entregados</td><td>${stats.ordersByStatus.delivered.length}</td><td>${((stats.ordersByStatus.delivered.length / data.totalOrders) * 100).toFixed(1)}%</td></tr>
          <tr><td>Pendientes</td><td>${stats.ordersByStatus.pending.length}</td><td>${((stats.ordersByStatus.pending.length / data.totalOrders) * 100).toFixed(1)}%</td></tr>
          <tr><td>Pagados</td><td>${stats.ordersByStatus.paid.length}</td><td>${((stats.ordersByStatus.paid.length / data.totalOrders) * 100).toFixed(1)}%</td></tr>
          <tr><td>Reembolsados</td><td>${stats.ordersByStatus.refunded.length}</td><td>${((stats.ordersByStatus.refunded.length / data.totalOrders) * 100).toFixed(1)}%</td></tr>
        </tbody>
      </table>
    </div>`;
  }

  private generateChartsSection(data: any): string {
    return `<div class="page">
      <h2 class="section-title">6. Gráficos de Análisis</h2>
      
      <h3 class="subsection-title">6.1 Ventas Mensuales ${data.currentYear}</h3>
      <div class="chart-container">
        <img src="${data.salesChartImage}" alt="Ventas Mensuales" />
      </div>
      
      <h3 class="subsection-title">6.2 Top 5 Productos Más Vendidos</h3>
      <div class="chart-container">
        <img src="${data.topProductsChartImage}" alt="Top 5 Productos" />
      </div>
      
      <h3 class="subsection-title">6.3 Distribución de Ventas por Producto</h3>
      <div class="chart-container">
        <img src="${data.categoriesChartImage}" alt="Distribución de Ventas" />
      </div>
      
      <h3 class="subsection-title">6.4 Distribución de Pedidos por Estado</h3>
      <div class="chart-container">
        <canvas id="ordersStatusChart"></canvas>
      </div>
    </div>`;
  }

  private generateInventorySection(products: any[]): string {
    const lowStock = products.filter(p => p.stock < 10);
    const outOfStock = products.filter(p => p.stock === 0);
    
    return `<div class="page">
      <h2 class="section-title">7. Inventario Final</h2>
      
      <h3 class="subsection-title">7.1 Resumen de Inventario</h3>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Productos</div>
          <div class="kpi-value">${products.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Stock Bajo (&lt;10)</div>
          <div class="kpi-value">${lowStock.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Sin Stock</div>
          <div class="kpi-value">${outOfStock.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Stock Total</div>
          <div class="kpi-value">${products.reduce((sum, p) => sum + (p.stock || 0), 0)}</div>
        </div>
      </div>
      
      <h3 class="subsection-title">7.2 Detalle de Inventario</h3>
      <table>
        <thead>
          <tr><th>Producto</th><th>SKU</th><th>Stock</th><th>Precio</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${products.slice(0, 20).map(p => `
            <tr>
              <td>${p.name}</td>
              <td>${p.sku || 'N/A'}</td>
              <td>${p.stock || 0}</td>
              <td>$${(p.price || 0).toLocaleString('es-CO')}</td>
              <td>${p.stock === 0 ? '❌ Sin stock' : p.stock < 10 ? '⚠️ Stock bajo' : '✅ Disponible'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${products.length > 20 ? `<p><em>Mostrando 20 de ${products.length} productos</em></p>` : ''}
      
      <h3 class="subsection-title">7.3 Gráfica de Distribución de Stock</h3>
      <div class="chart-container">
        <canvas id="inventoryChart"></canvas>
      </div>
    </div>`;
  }

  private generateRevenueTable(monthlyRevenue: number[], year: number): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const total = monthlyRevenue.reduce((sum, val) => sum + val, 0);
    
    return `<div class="page">
      <h2 class="section-title">8. Tabla de Ingresos</h2>
      
      <h3 class="subsection-title">8.1 Ingresos Mensuales ${year}</h3>
      <table>
        <thead>
          <tr><th>Mes</th><th>Ingresos</th><th>% del Total</th></tr>
        </thead>
        <tbody>
          ${monthlyRevenue.map((revenue, index) => `
            <tr>
              <td>${months[index]}</td>
              <td>$${revenue.toLocaleString('es-CO')}</td>
              <td>${total > 0 ? ((revenue / total) * 100).toFixed(1) : 0}%</td>
            </tr>
          `).join('')}
          <tr style="background: #f0f0f0; font-weight: bold;">
            <td>TOTAL</td>
            <td>$${total.toLocaleString('es-CO')}</td>
            <td>100%</td>
          </tr>
        </tbody>
      </table>
      
      <h3 class="subsection-title">8.2 Gráfica de Ingresos Mensuales</h3>
      <div class="chart-container">
        <canvas id="revenueChart"></canvas>
      </div>
    </div>`;
  }


  private generateOrderTables(ordersByStatus: any): string {
    return `<div class="page">
      <h2 class="section-title">9. Análisis de Pedidos por Estado</h2>
      
      <h3 class="subsection-title">9.1 Pedidos Despachados/Enviados</h3>
      ${this.generateOrderTable(ordersByStatus.shipped, 'SHIPPED')}
      
      <h3 class="subsection-title">9.2 Pedidos Entregados</h3>
      ${this.generateOrderTable(ordersByStatus.delivered, 'DELIVERED')}
    </div>
    
    <div class="page">
      <h3 class="subsection-title">9.3 Pedidos Pendientes</h3>
      ${this.generateOrderTable(ordersByStatus.pending, 'PENDING')}
      
      <h3 class="subsection-title">9.4 Pedidos Pagados</h3>
      ${this.generateOrderTable(ordersByStatus.paid, 'PAID')}
    </div>
    
    <div class="page">
      <h3 class="subsection-title">9.5 Pedidos con Solicitud de Reembolso</h3>
      ${this.generateOrderTable(ordersByStatus.returnRequested, 'RETURN_REQUESTED')}
      
      <h3 class="subsection-title">9.6 Pedidos Reembolsados</h3>
      ${this.generateOrderTable(ordersByStatus.refunded, 'REFUNDED')}
      
      <h3 class="subsection-title">9.7 Pedidos Cancelados</h3>
      ${this.generateOrderTable(ordersByStatus.cancelled, 'CANCELLED')}
    </div>`;
  }

  private generateOrderTable(orders: any[], status: string): string {
    if (orders.length === 0) {
      return `<p><em>No hay pedidos en estado ${this.translateStatus(status)}</em></p>`;
    }
    
    const total = orders.reduce((sum, o) => sum + o.total, 0);
    
    return `
      <p><strong>Total: ${orders.length} pedidos - Monto: $${total.toLocaleString('es-CO')}</strong></p>
      <table>
        <thead>
          <tr><th>Orden</th><th>Cliente</th><th>Fecha</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${orders.slice(0, 10).map(order => `
            <tr>
              <td>${order.orderNumber}</td>
              <td>${order.userEmail}</td>
              <td>${new Date(order.createdAt).toLocaleDateString('es-CO')}</td>
              <td>$${order.total.toLocaleString('es-CO')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${orders.length > 10 ? `<p><em>Mostrando 10 de ${orders.length} pedidos</em></p>` : ''}
    `;
  }

  private generateUsersTable(users: any[]): string {
    const usersByMonth: { [key: string]: number } = {};
    users.forEach(user => {
      const date = new Date(user.createdAt || user.registeredAt || Date.now());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      usersByMonth[monthKey] = (usersByMonth[monthKey] || 0) + 1;
    });
    
    return `<div class="page">
      <h2 class="section-title">10. Usuarios Registrados</h2>
      
      <h3 class="subsection-title">10.1 Resumen de Usuarios</h3>
      <p><strong>Total de usuarios registrados:</strong> ${users.length}</p>
      
      <h3 class="subsection-title">10.2 Lista de Usuarios</h3>
      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Fecha Registro</th></tr>
        </thead>
        <tbody>
          ${users.slice(0, 20).map(user => `
            <tr>
              <td>${user.id}</td>
              <td>${user.firstName || ''} ${user.lastName || ''}</td>
              <td>${user.email}</td>
              <td>${user.role || 'USER'}</td>
              <td>${new Date(user.createdAt || user.registeredAt || Date.now()).toLocaleDateString('es-CO')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${users.length > 20 ? `<p><em>Mostrando 20 de ${users.length} usuarios</em></p>` : ''}
      
      <h3 class="subsection-title">10.3 Gráfica de Crecimiento de Usuarios</h3>
      <div class="chart-container">
        <canvas id="usersGrowthChart"></canvas>
      </div>
    </div>`;
  }

  private generateConclusion(data: any, stats: any): string {
    const deliveryRate = data.totalOrders > 0 ? ((stats.ordersByStatus.delivered.length / data.totalOrders) * 100).toFixed(1) : 0;
    const refundRate = data.totalOrders > 0 ? ((stats.ordersByStatus.refunded.length / data.totalOrders) * 100).toFixed(1) : 0;
    
    return `<div class="page">
      <h2 class="section-title">11. Conclusión</h2>
      
      <h3 class="subsection-title">11.1 Hallazgos Principales</h3>
      <ul>
        <li>La plataforma ha procesado <strong>${data.totalOrders} pedidos</strong> con un valor total de <strong>$${data.totalSales.toLocaleString('es-CO')}</strong></li>
        <li>El valor promedio por pedido es de <strong>$${stats.avgOrderValue.toLocaleString('es-CO')}</strong></li>
        <li>La tasa de entrega exitosa es del <strong>${deliveryRate}%</strong></li>
        <li>La tasa de reembolsos es del <strong>${refundRate}%</strong></li>
        <li>Se cuenta con <strong>${data.totalProducts} productos activos</strong> en el catálogo</li>
        <li>La base de usuarios registrados alcanza <strong>${data.totalUsers} personas</strong></li>
      </ul>
      
      <h3 class="subsection-title">11.2 Recomendaciones</h3>
      <ul>
        <li><strong>Gestión de Inventario:</strong> Monitorear productos con stock bajo y planificar reabastecimiento</li>
        <li><strong>Optimización de Entregas:</strong> Analizar pedidos pendientes y enviados para mejorar tiempos de entrega</li>
        <li><strong>Reducción de Reembolsos:</strong> Investigar causas de devoluciones y implementar mejoras</li>
        <li><strong>Estrategias de Ventas:</strong> Potenciar productos más vendidos y evaluar productos de bajo rendimiento</li>
        <li><strong>Retención de Usuarios:</strong> Implementar programas de fidelización para usuarios registrados</li>
      </ul>
      
      <h3 class="subsection-title">11.3 Próximos Pasos</h3>
      <p>Se recomienda generar este reporte de forma periódica (mensual o trimestral) para monitorear la evolución de los indicadores y tomar decisiones basadas en tendencias identificadas.</p>
    </div>`;
  }

  private generateFooter(year: number): string {
    return `<div class="footer">
      <p>Este reporte fue generado automáticamente por el sistema Cabrejo Gym</p>
      <p>© ${year} Cabrejo Gym. Todos los derechos reservados.</p>
      <p>Documento confidencial - Solo para uso interno</p>
    </div>`;
  }

  private translateStatus(status: string): string {
    const map: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'PAID': 'Pagado',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado',
      'RETURN_REQUESTED': 'Devolución Solicitada',
      'REFUNDED': 'Reembolsado'
    };
    return map[status] || status;
  }


  private generateChartScripts(stats: any): string {
    return `<script>
      window.addEventListener('load', function() {
        // Gráfica de distribución de pedidos por estado
        const ordersStatusCtx = document.getElementById('ordersStatusChart');
        if (ordersStatusCtx) {
          new Chart(ordersStatusCtx, {
            type: 'doughnut',
            data: {
              labels: ['Enviados', 'Entregados', 'Pendientes', 'Pagados', 'Reembolsados', 'Cancelados'],
              datasets: [{
                data: [
                  ${stats.ordersByStatus.shipped.length},
                  ${stats.ordersByStatus.delivered.length},
                  ${stats.ordersByStatus.pending.length},
                  ${stats.ordersByStatus.paid.length},
                  ${stats.ordersByStatus.refunded.length},
                  ${stats.ordersByStatus.cancelled.length}
                ],
                backgroundColor: ['#2196f3', '#4caf50', '#ff9800', '#fff212', '#9c27b0', '#f44336'],
                borderWidth: 2,
                borderColor: '#ffffff'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'right' },
                title: { display: true, text: 'Distribución de Pedidos por Estado' }
              }
            }
          });
        }
        
        // Gráfica de inventario
        const inventoryCtx = document.getElementById('inventoryChart');
        if (inventoryCtx) {
          new Chart(inventoryCtx, {
            type: 'bar',
            data: {
              labels: ['Disponible', 'Stock Bajo', 'Sin Stock'],
              datasets: [{
                label: 'Cantidad de Productos',
                data: [0, 0, 0], // Se calculará dinámicamente
                backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                borderColor: ['#388e3c', '#f57c00', '#c62828'],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Distribución de Inventario' }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }
          });
        }
        
        // Gráfica de ingresos mensuales
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
          new Chart(revenueCtx, {
            type: 'bar',
            data: {
              labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
              datasets: [{
                label: 'Ingresos ($)',
                data: ${JSON.stringify(stats.monthlyRevenue)},
                backgroundColor: '#fff212',
                borderColor: '#1a1a1a',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Ingresos Mensuales' }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              }
            }
          });
        }
        
        // Gráfica de crecimiento de usuarios
        const usersGrowthCtx = document.getElementById('usersGrowthChart');
        if (usersGrowthCtx) {
          new Chart(usersGrowthCtx, {
            type: 'line',
            data: {
              labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
              datasets: [{
                label: 'Usuarios Registrados',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Se calculará dinámicamente
                fill: true,
                tension: 0.4,
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                pointBackgroundColor: '#2196f3',
                pointBorderColor: '#1a1a1a',
                pointHoverBackgroundColor: '#1a1a1a',
                pointHoverBorderColor: '#2196f3'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true },
                title: { display: true, text: 'Crecimiento de Usuarios' }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }
          });
        }
      });
    </script>`;
  }
}

