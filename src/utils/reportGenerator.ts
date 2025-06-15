
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export interface ReportData {
  title: string;
  timestamp: string;
  dateRange: {
    from: string;
    to: string;
  };
  kpis: {
    vanzariTotale: number;
    vanzariTotalePrecedent: number;
    comenziActive: number;
    comenziActivePrecedent: number;
    distributoriActivi: number;
    distributoriActiviPrecedent: number;
    alerteStoc: number;
    produseStocZero: number;
    totalPaleti: number;
    totalProfit: number;
  };
  topProducts: Array<{
    nume: string;
    cantitate: number;
    valoare: number;
    trend: number;
    paleti: number;
  }>;
  performanceData: Array<{
    date: string;
    vanzari: number;
    comenzi: number;
    dateLabel: string;
  }>;
  format: 'pdf' | 'excel' | 'csv';
}

export const generatePDFReport = (data: ReportData): string => {
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ro });
  };

  const vanzariTrend = calculateTrend(data.kpis.vanzariTotale, data.kpis.vanzariTotalePrecedent);
  const comenziTrend = calculateTrend(data.kpis.comenziActive, data.kpis.comenziActivePrecedent);
  const distributoriTrend = calculateTrend(data.kpis.distributoriActivi, data.kpis.distributoriActiviPrecedent);

  const htmlContent = `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header .subtitle {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .report-info {
            background: #f8f9ff;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 0 8px 8px 0;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .kpi-card {
            background: #fff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .kpi-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .kpi-label {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 8px;
        }
        .kpi-trend {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: 500;
        }
        .trend-positive {
            background: #d4edda;
            color: #155724;
        }
        .trend-negative {
            background: #f8d7da;
            color: #721c24;
        }
        .trend-neutral {
            background: #e2e3e5;
            color: #383d41;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e9ecef;
        }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .products-table th,
        .products-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        .products-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
            font-size: 14px;
        }
        .products-table tr:hover {
            background: #f8f9ff;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
        .alert-section {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .alert-title {
            color: #856404;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .performance-summary {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
            .kpi-grid { grid-template-columns: repeat(3, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.title}</h1>
            <div class="subtitle">Generat pe ${formatDate(data.timestamp)}</div>
        </div>
        
        <div class="content">
            <div class="report-info">
                <h3>📊 Informații Raport</h3>
                <p><strong>Perioada analizată:</strong> ${formatDate(data.dateRange.from)} - ${formatDate(data.dateRange.to)}</p>
                <p><strong>Format:</strong> ${data.format.toUpperCase()}</p>
                <p><strong>Generat la:</strong> ${format(new Date(data.timestamp), 'dd/MM/yyyy HH:mm', { locale: ro })}</p>
            </div>

            <div class="section">
                <h2 class="section-title">📈 Indicatori Cheie de Performanță</h2>
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-value">${formatCurrency(data.kpis.vanzariTotale)}</div>
                        <div class="kpi-label">Vânzări Totale</div>
                        <span class="kpi-trend ${vanzariTrend >= 0 ? 'trend-positive' : 'trend-negative'}">
                            ${vanzariTrend >= 0 ? '↗' : '↘'} ${Math.abs(vanzariTrend)}%
                        </span>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-value">${data.kpis.comenziActive}</div>
                        <div class="kpi-label">Comenzi Active</div>
                        <span class="kpi-trend ${comenziTrend >= 0 ? 'trend-positive' : 'trend-negative'}">
                            ${comenziTrend >= 0 ? '↗' : '↘'} ${Math.abs(comenziTrend)}%
                        </span>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-value">${data.kpis.distributoriActivi}</div>
                        <div class="kpi-label">Distribuitori Activi</div>
                        <span class="kpi-trend ${distributoriTrend >= 0 ? 'trend-positive' : 'trend-negative'}">
                            ${distributoriTrend >= 0 ? '↗' : '↘'} ${Math.abs(distributoriTrend)}%
                        </span>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-value">${data.kpis.totalPaleti}</div>
                        <div class="kpi-label">Total Paleți</div>
                        <span class="kpi-trend trend-neutral">📦</span>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-value">${formatCurrency(data.kpis.totalProfit)}</div>
                        <div class="kpi-label">Profit Estimat</div>
                        <span class="kpi-trend trend-positive">💰</span>
                    </div>
                </div>
            </div>

            ${data.kpis.alerteStoc > 0 || data.kpis.produseStocZero > 0 ? `
            <div class="section">
                <h2 class="section-title">⚠️ Alerte Stoc</h2>
                <div class="alert-section">
                    <div class="alert-title">Atenție la Stocuri!</div>
                    <p>• <strong>${data.kpis.alerteStoc}</strong> produse cu stoc sub pragul de alertă</p>
                    <p>• <strong>${data.kpis.produseStocZero}</strong> produse cu stoc zero</p>
                    <p><em>Recomandare: Verificați urgent situația stocurilor pentru a evita întreruperea comenzilor.</em></p>
                </div>
            </div>
            ` : ''}

            ${data.topProducts.length > 0 ? `
            <div class="section">
                <h2 class="section-title">🏆 Top Produse</h2>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Produs</th>
                            <th>Cantitate</th>
                            <th>Valoare</th>
                            <th>Paleți</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.topProducts.map(product => `
                        <tr>
                            <td><strong>${product.nume}</strong></td>
                            <td>${product.cantitate} buc</td>
                            <td>${formatCurrency(product.valoare)}</td>
                            <td>${product.paleti}</td>
                            <td>
                                <span class="kpi-trend ${product.trend >= 0 ? 'trend-positive' : 'trend-negative'}">
                                    ${product.trend >= 0 ? '↗' : '↘'} ${Math.abs(product.trend).toFixed(1)}%
                                </span>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            ${data.performanceData.length > 0 ? `
            <div class="section">
                <h2 class="section-title">📊 Rezumat Performanță Zilnică</h2>
                <div class="performance-summary">
                    <p><strong>Perioada analizată:</strong> ${data.performanceData.length} zile</p>
                    <p><strong>Media zilnică vânzări:</strong> ${formatCurrency(data.performanceData.reduce((sum, day) => sum + day.vanzari, 0) / data.performanceData.length)}</p>
                    <p><strong>Media zilnică comenzi:</strong> ${Math.round(data.performanceData.reduce((sum, day) => sum + day.comenzi, 0) / data.performanceData.length)} comenzi</p>
                    <p><strong>Cea mai bună zi:</strong> ${(() => {
                        const bestDay = data.performanceData.reduce((best, day) => day.vanzari > best.vanzari ? day : best);
                        return `${bestDay.dateLabel} cu ${formatCurrency(bestDay.vanzari)}`;
                    })()}</p>
                </div>
            </div>
            ` : ''}

            <div class="footer">
                <p>📋 Raport generat automat de sistemul de management BCA Fortem</p>
                <p>Pentru întrebări sau clarificări, contactați departamentul de management.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  return htmlContent;
};

export const generateExcelData = (data: ReportData) => {
  const workbookData = {
    SheetNames: ['Raport Executiv', 'KPIs', 'Top Produse', 'Performanță'],
    Sheets: {
      'Raport Executiv': [
        ['RAPORT EXECUTIV DASHBOARD'],
        [''],
        ['Informații Generale'],
        ['Titlu', data.title],
        ['Generat pe', format(new Date(data.timestamp), 'dd/MM/yyyy HH:mm', { locale: ro })],
        ['Perioada', `${format(new Date(data.dateRange.from), 'dd/MM/yyyy', { locale: ro })} - ${format(new Date(data.dateRange.to), 'dd/MM/yyyy', { locale: ro })}`],
        ['Format', data.format.toUpperCase()],
      ],
      'KPIs': [
        ['Indicator', 'Valoare Curentă', 'Valoare Precedentă', 'Trend (%)'],
        ['Vânzări Totale', data.kpis.vanzariTotale, data.kpis.vanzariTotalePrecedent, ((data.kpis.vanzariTotale - data.kpis.vanzariTotalePrecedent) / Math.max(data.kpis.vanzariTotalePrecedent, 1) * 100).toFixed(2)],
        ['Comenzi Active', data.kpis.comenziActive, data.kpis.comenziActivePrecedent, ((data.kpis.comenziActive - data.kpis.comenziActivePrecedent) / Math.max(data.kpis.comenziActivePrecedent, 1) * 100).toFixed(2)],
        ['Distribuitori Activi', data.kpis.distributoriActivi, data.kpis.distributoriActiviPrecedent, ((data.kpis.distributoriActivi - data.kpis.distributoriActiviPrecedent) / Math.max(data.kpis.distributoriActiviPrecedent, 1) * 100).toFixed(2)],
        ['Total Paleți', data.kpis.totalPaleti, '-', '-'],
        ['Profit Estimat', data.kpis.totalProfit, '-', '-'],
        ['Alerte Stoc', data.kpis.alerteStoc, '-', '-'],
        ['Produse Stoc Zero', data.kpis.produseStocZero, '-', '-'],
      ],
      'Top Produse': [
        ['Produs', 'Cantitate', 'Valoare (RON)', 'Paleți', 'Trend (%)'],
        ...data.topProducts.map(product => [
          product.nume,
          product.cantitate,
          product.valoare,
          product.paleti,
          product.trend.toFixed(2)
        ])
      ],
      'Performanță': [
        ['Data', 'Vânzări (RON)', 'Număr Comenzi'],
        ...data.performanceData.map(day => [
          format(new Date(day.date), 'dd/MM/yyyy', { locale: ro }),
          day.vanzari,
          day.comenzi
        ])
      ]
    }
  };

  return workbookData;
};

export const generateCSVData = (data: ReportData): string => {
  const csvLines = [
    'RAPORT EXECUTIV DASHBOARD',
    '',
    `Titlu,${data.title}`,
    `Generat pe,${format(new Date(data.timestamp), 'dd/MM/yyyy HH:mm', { locale: ro })}`,
    `Perioada,${format(new Date(data.dateRange.from), 'dd/MM/yyyy', { locale: ro })} - ${format(new Date(data.dateRange.to), 'dd/MM/yyyy', { locale: ro })}`,
    '',
    'INDICATORI CHEIE',
    'Indicator,Valoare Curentă,Valoare Precedentă',
    `Vânzări Totale,${data.kpis.vanzariTotale},${data.kpis.vanzariTotalePrecedent}`,
    `Comenzi Active,${data.kpis.comenziActive},${data.kpis.comenziActivePrecedent}`,
    `Distribuitori Activi,${data.kpis.distributoriActivi},${data.kpis.distributoriActiviPrecedent}`,
    `Total Paleți,${data.kpis.totalPaleti},-`,
    `Profit Estimat,${data.kpis.totalProfit},-`,
    '',
    'TOP PRODUSE',
    'Produs,Cantitate,Valoare,Paleți,Trend',
    ...data.topProducts.map(product => 
      `${product.nume},${product.cantitate},${product.valoare},${product.paleti},${product.trend.toFixed(2)}%`
    ),
    '',
    'PERFORMANȚĂ ZILNICĂ',
    'Data,Vânzări,Comenzi',
    ...data.performanceData.map(day =>
      `${format(new Date(day.date), 'dd/MM/yyyy', { locale: ro })},${day.vanzari},${day.comenzi}`
    )
  ];

  return csvLines.join('\n');
};
