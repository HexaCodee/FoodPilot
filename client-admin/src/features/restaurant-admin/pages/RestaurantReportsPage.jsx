import { useState, useEffect, useCallback, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { useRestaurantStore } from '../store/restaurantStore.js';
import {
  getSalesReports,
  createSalesReport,
  getUsageStats,
  createUsageStats,
} from '../../../shared/apis/events.js';
import { getOrders } from '../../../shared/apis/orders.js';
import { getReservations } from '../../../shared/apis/reservations.js';
import {
  BarChartIcon,
  TrendUpIcon,
  ClipboardIcon,
  BuildingIcon,
} from '../../../shared/components/ui/Icons.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ─────────────────────────────────────────────────────────────────────────────
const PERIOD_LABEL = { DÍA: 'Día', SEMANA: 'Semana', MES: 'Mes', AÑO: 'Año' };

const fmtMoney = (n) =>
  typeof n === 'number' ? `$${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : '—';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const determinePeriod = (sinceDate, now = new Date()) => {
  const diffDays = (now - sinceDate) / (1000 * 60 * 60 * 24);
  let type;
  if (diffDays < 1.5) type = 'DÍA';
  else if (diffDays < 8) type = 'SEMANA';
  else if (diffDays < 35) type = 'MES';
  else type = 'AÑO';
  return {
    type,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    startDate: sinceDate.toISOString(),
    endDate: now.toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF helpers
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  gold: [201, 168, 76],
  dark: [18, 18, 20],
  gray: [110, 110, 120],
  light: [247, 247, 250],
  blue: [59, 130, 246],
  white: [255, 255, 255],
};
const PW = 210; // A4 width mm

const _header = (doc, subtitle, restaurant, date) => {
  doc.setFillColor(...C.gold);
  doc.rect(0, 0, PW, 25, 'F');
  // Brand
  doc.setTextColor(...C.dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('FoodPilot', 14, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 28, 0);
  doc.text(subtitle, 14, 19);
  // Right: restaurant + date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.dark);
  doc.text(restaurant, PW - 14, 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 28, 0);
  doc.text(`Generado: ${fmtDate(date)}`, PW - 14, 18, { align: 'right' });
};

const _boxes = (doc, boxes, y) => {
  const gap = 5;
  const bw = (PW - 28 - gap * (boxes.length - 1)) / boxes.length;
  boxes.forEach((b, i) => {
    const x = 14 + i * (bw + gap);
    doc.setFillColor(...C.light);
    doc.rect(x, y, bw, 24, 'F');
    doc.setFillColor(...C.gold);
    doc.rect(x, y, bw, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.gray);
    doc.text(b.label.toUpperCase(), x + bw / 2, y + 12, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C.dark);
    doc.text(String(b.value), x + bw / 2, y + 21, { align: 'center' });
  });
  return y + 32;
};

const _bars = (doc, data, y, title, accentColor = C.gold) => {
  if (!data?.length) return y;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.dark);
  doc.text(title, 14, y);
  y += 7;
  const lw = 36, vw = 30;
  const bw = PW - 28 - lw - vw;
  const bh = 5.5, gap = 3.5;
  const mx = Math.max(...data.map((d) => d.value), 1);
  data.slice(0, 8).forEach((d, i) => {
    const by = y + i * (bh + gap);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.gray);
    doc.text(String(d.label).slice(0, 14), 14, by + bh - 0.5);
    // Track
    doc.setFillColor(225, 225, 230);
    doc.rect(14 + lw, by, bw, bh, 'F');
    // Fill
    const fw = Math.max((bw * d.value) / mx, d.value > 0 ? 1 : 0);
    if (fw > 0) {
      doc.setFillColor(...accentColor);
      doc.rect(14 + lw, by, fw, bh, 'F');
    }
    // Value label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.dark);
    doc.text(String(d.display), 14 + lw + bw + 3, by + bh - 0.5);
  });
  return y + data.slice(0, 8).length * (bh + gap) + 10;
};

const _footer = (doc) => {
  const n = doc.internal.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.height;
    doc.setDrawColor(...C.gray);
    doc.setLineWidth(0.2);
    doc.line(14, ph - 14, PW - 14, ph - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.gray);
    doc.text(
      `FoodPilot · Generado automáticamente · Pág. ${i} de ${n}`,
      PW / 2,
      ph - 8,
      { align: 'center' }
    );
  }
};

const generateSalesPDF = ({ report, allReports, restaurantName }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const now = new Date();
  _header(doc, 'Reporte de Ventas', restaurantName, report.generatedAt ?? now);

  let y = _boxes(
    doc,
    [
      { label: 'Ventas del período', value: fmtMoney(report.totalSales) },
      { label: 'Pedidos', value: report.totalOrders },
      { label: 'Ticket promedio', value: fmtMoney(report.averageTicket) },
    ],
    33
  );

  if (allReports.length > 0) {
    y = _bars(
      doc,
      allReports.map((r) => ({
        label:
          `${PERIOD_LABEL[r.period?.type] ?? r.period?.type ?? '?'} ${r.period?.year ?? ''}`.trim(),
        value: r.totalSales ?? 0,
        display: fmtMoney(r.totalSales ?? 0),
      })),
      y,
      'Ventas por período'
    );
  }

  autoTable(doc, {
    startY: y,
    head: [['Período', 'Desde', 'Hasta', 'Ventas', 'Pedidos', 'Ticket prom.']],
    body: allReports.map((r) => [
      `${PERIOD_LABEL[r.period?.type] ?? r.period?.type ?? '—'} ${r.period?.year ?? ''}`.trim(),
      fmtDate(r.period?.startDate),
      fmtDate(r.period?.endDate),
      fmtMoney(r.totalSales),
      r.totalOrders ?? 0,
      fmtMoney(r.averageTicket),
    ]),
    headStyles: { fillColor: C.gold, textColor: C.dark, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: C.dark },
    alternateRowStyles: { fillColor: C.light },
    margin: { left: 14, right: 14 },
    theme: 'plain',
    styles: { cellPadding: 3 },
  });

  _footer(doc);
  const slug = restaurantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`reporte_ventas_${slug}_${now.toISOString().slice(0, 10)}.pdf`);
};

const generateUsagePDF = ({ stat, allStats, restaurantName }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const now = new Date();
  _header(doc, 'Estadísticas de Uso', restaurantName, stat.generatedAt ?? now);

  let y = _boxes(
    doc,
    [
      { label: 'Reservas del período', value: stat.reservationsCount },
      { label: 'Usuarios nuevos', value: stat.newUsers },
      { label: 'Usuarios recurrentes', value: stat.repeatUsers },
    ],
    33
  );

  if (stat.mostBusyHour) {
    doc.setFillColor(240, 248, 255);
    doc.rect(14, y, PW - 28, 11, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.dark);
    doc.text(`Hora pico del período: ${stat.mostBusyHour}`, PW / 2, y + 7.5, {
      align: 'center',
    });
    y += 18;
  }

  if (allStats.length > 0) {
    y = _bars(
      doc,
      allStats.map((s) => ({
        label: PERIOD_LABEL[s.period?.type] ?? s.period?.type ?? '?',
        value: s.reservationsCount ?? 0,
        display: String(s.reservationsCount ?? 0),
      })),
      y,
      'Reservas por período',
      C.blue
    );
  }

  autoTable(doc, {
    startY: y,
    head: [['Período', 'Reservas', 'Hora pico', 'Nuevos', 'Recurrentes', 'Generado']],
    body: allStats.map((s) => [
      PERIOD_LABEL[s.period?.type] ?? s.period?.type ?? '—',
      s.reservationsCount ?? 0,
      s.mostBusyHour ?? '—',
      s.newUsers ?? 0,
      s.repeatUsers ?? 0,
      fmtDate(s.generatedAt),
    ]),
    headStyles: {
      fillColor: C.blue,
      textColor: C.white,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8, textColor: C.dark },
    alternateRowStyles: { fillColor: C.light },
    margin: { left: 14, right: 14 },
    theme: 'plain',
    styles: { cellPadding: 3 },
  });

  _footer(doc);
  const slug = restaurantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`estadisticas_uso_${slug}_${now.toISOString().slice(0, 10)}.pdf`);
};

// ─────────────────────────────────────────────────────────────────────────────
// UI primitives
// ─────────────────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const SummaryCard = ({ Icon, label, value, sub, accent = false }) => (
  <div
    className={`bg-fp-surface border rounded-xl p-5 transition-colors ${
      accent ? 'border-fp-gold/30 hover:border-fp-gold/50' : 'border-fp-border hover:border-fp-gold/25'
    }`}
  >
    <div className='p-2.5 rounded-lg bg-fp-gold-dim w-fit mb-3'>
      <Icon className='w-5 h-5 text-fp-gold' />
    </div>
    <p className='text-fp-muted text-xs uppercase tracking-wide mb-1'>{label}</p>
    <p className='text-fp-text text-2xl font-semibold'>{value}</p>
    {sub && <p className='text-fp-subtle text-xs mt-1'>{sub}</p>}
  </div>
);

const BarChart = ({ data, valueKey, labelKey, color = 'bg-fp-gold', title }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d[valueKey] ?? 0), 1);
  return (
    <div className='bg-fp-surface border border-fp-border rounded-xl p-5'>
      {title && <h3 className='text-fp-text font-medium text-sm mb-4'>{title}</h3>}
      <div className='space-y-2'>
        {data.map((d, i) => {
          const pct = Math.round(((d[valueKey] ?? 0) / max) * 100);
          return (
            <div key={i} className='flex items-center gap-3'>
              <span className='text-fp-subtle text-xs w-24 truncate flex-shrink-0'>
                {d[labelKey] ?? `#${i + 1}`}
              </span>
              <div className='flex-1 bg-fp-elevated rounded-full h-2 overflow-hidden'>
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className='text-fp-muted text-xs w-20 text-right flex-shrink-0'>
                {(d[valueKey] ?? 0).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NoRestaurant = () => (
  <div className='flex flex-col items-center justify-center py-20 text-center'>
    <div className='p-4 rounded-xl bg-fp-gold-dim mb-4'>
      <BuildingIcon className='w-8 h-8 text-fp-gold' />
    </div>
    <p className='text-fp-text font-medium text-lg'>Sin restaurante seleccionado</p>
    <p className='text-fp-subtle text-sm mt-2 max-w-xs'>
      Ve al dashboard y selecciona tu restaurante para ver los reportes.
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Sales tab
// ─────────────────────────────────────────────────────────────────────────────
const SalesTab = ({ restaurantId, restaurantName }) => {
  const [reports, setReports] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Saved reports for this restaurant, newest first
      const rList = await getSalesReports().then((r) =>
        (Array.isArray(r.data) ? r.data : [])
          .filter((rep) => String(rep.restaurantId) === String(restaurantId))
          .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
      );
      setReports(rList);

      // ENTREGADO orders since last report
      const sinceDate = rList.length > 0 ? new Date(rList[0].generatedAt) : new Date(0);
      const orders = await getOrders({ restaurantId, status: 'ENTREGADO', limit: 2000 }).then(
        (r) =>
          (Array.isArray(r.data) ? r.data : []).filter(
            (o) => o.status === 'ENTREGADO' && new Date(o.createdAt) > sinceDate
          )
      );
      setCurrentOrders(orders);
    } catch {
      toast.error('Error al cargar reportes de ventas');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  const currentSales = useMemo(
    () => currentOrders.reduce((s, o) => s + (o.price ?? 0), 0),
    [currentOrders]
  );
  const currentAvgTicket =
    currentOrders.length > 0 ? currentSales / currentOrders.length : 0;

  const histSales = reports.reduce((s, r) => s + (r.totalSales ?? 0), 0);
  const histOrders = reports.reduce((s, r) => s + (r.totalOrders ?? 0), 0);
  const histAvgTicket =
    reports.length > 0
      ? reports.reduce((s, r) => s + (r.averageTicket ?? 0), 0) / reports.length
      : 0;

  const handleGenerate = async () => {
    if (currentOrders.length === 0) {
      toast.error('No hay pedidos completados desde el último reporte');
      return;
    }
    setGenerating(true);
    try {
      const now = new Date();
      const sinceDate = reports.length > 0 ? new Date(reports[0].generatedAt) : new Date(0);
      const period = determinePeriod(sinceDate, now);

      const payload = {
        restaurantId,
        period,
        totalSales: Math.round(currentSales * 100) / 100,
        totalOrders: currentOrders.length,
        averageTicket: Math.round(currentAvgTicket * 100) / 100,
        salesByType: { dineIn: currentOrders.length, delivery: 0, event: 0 },
        topProducts: [],
        generatedAt: now.toISOString(),
      };

      const res = await createSalesReport(payload);
      const savedReport = res.data ?? payload;

      generateSalesPDF({
        report: { ...savedReport, generatedAt: now },
        allReports: [savedReport, ...reports],
        restaurantName,
      });

      toast.success('Reporte generado y descargado ✓');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Error al generar el reporte');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* ── Período actual ── */}
      <div className='bg-fp-surface border border-fp-gold/25 rounded-xl p-5'>
        <div className='flex items-start justify-between gap-4 mb-5 flex-wrap'>
          <div>
            <h3 className='text-fp-text font-semibold text-base'>Período actual</h3>
            <p className='text-fp-subtle text-xs mt-0.5'>
              {loading
                ? 'Cargando…'
                : currentOrders.length === 0
                  ? 'Sin pedidos completados desde el último reporte'
                  : `${currentOrders.length} pedido${currentOrders.length !== 1 ? 's' : ''} completado${currentOrders.length !== 1 ? 's' : ''} desde el último reporte`}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || loading || currentOrders.length === 0}
            className='flex items-center gap-2 px-4 py-2 bg-fp-gold text-fp-bg text-sm font-semibold rounded-lg hover:bg-fp-gold-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0'
          >
            {generating ? (
              <>
                <span className='w-3.5 h-3.5 rounded-full border-2 border-fp-bg/30 border-t-fp-bg animate-spin' />
                Generando…
              </>
            ) : (
              '↓ Generar reporte PDF'
            )}
          </button>
        </div>

        {loading ? (
          <div className='grid grid-cols-3 gap-4'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-24' />
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <SummaryCard
              Icon={TrendUpIcon}
              label='Ventas'
              value={fmtMoney(currentSales)}
              sub='Listas para reportar'
              accent
            />
            <SummaryCard
              Icon={ClipboardIcon}
              label='Pedidos completados'
              value={currentOrders.length.toLocaleString()}
              sub='Desde el último reporte'
              accent
            />
            <SummaryCard
              Icon={BarChartIcon}
              label='Ticket promedio'
              value={fmtMoney(currentAvgTicket)}
              sub='Este período'
              accent
            />
          </div>
        )}
      </div>

      {/* ── Histórico ── */}
      {!loading && reports.length > 0 && (
        <>
          <div>
            <h3 className='text-fp-text font-medium text-sm px-0.5 mb-3'>
              Acumulado de reportes anteriores
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <SummaryCard
                Icon={TrendUpIcon}
                label='Ventas totales'
                value={fmtMoney(histSales)}
                sub={`${reports.length} reporte${reports.length !== 1 ? 's' : ''}`}
              />
              <SummaryCard
                Icon={ClipboardIcon}
                label='Pedidos totales'
                value={histOrders.toLocaleString()}
                sub='Suma histórica'
              />
              <SummaryCard
                Icon={BarChartIcon}
                label='Ticket promedio'
                value={fmtMoney(histAvgTicket)}
                sub='Promedio entre reportes'
              />
            </div>
          </div>

          <BarChart
            data={reports.slice(0, 8).map((r) => ({
              label:
                `${PERIOD_LABEL[r.period?.type] ?? r.period?.type ?? '?'} ${r.period?.year ?? ''}`.trim(),
              value: r.totalSales ?? 0,
            }))}
            valueKey='value'
            labelKey='label'
            title='Ventas por período (histórico)'
            color='bg-fp-gold'
          />
        </>
      )}

      {/* ── Tabla ── */}
      <div className='bg-fp-surface border border-fp-border rounded-xl overflow-hidden'>
        <div className='px-5 py-4 border-b border-fp-border'>
          <h3 className='text-fp-text font-medium text-sm'>Reportes de ventas guardados</h3>
        </div>

        {loading ? (
          <div className='p-5 space-y-3'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <p className='text-fp-subtle text-sm text-center py-10'>
            Sin reportes aún — presiona "Generar reporte PDF" para crear el primero
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-fp-border bg-fp-bg'>
                  {['Período', 'Ventas', 'Pedidos', 'Ticket prom.', 'Generado'].map((h) => (
                    <th
                      key={h}
                      className='px-4 py-3 text-left text-xs text-fp-subtle uppercase tracking-wide font-medium'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-fp-border-subtle'>
                {reports.map((r) => (
                  <tr key={r._id} className='hover:bg-fp-elevated/50 transition-colors'>
                    <td className='px-4 py-3 text-fp-muted'>
                      {PERIOD_LABEL[r.period?.type] ?? r.period?.type ?? '—'}
                      {r.period?.year ? ` ${r.period.year}` : ''}
                    </td>
                    <td className='px-4 py-3 text-fp-text font-semibold'>
                      {fmtMoney(r.totalSales)}
                    </td>
                    <td className='px-4 py-3 text-fp-muted'>{r.totalOrders}</td>
                    <td className='px-4 py-3 text-fp-muted'>{fmtMoney(r.averageTicket)}</td>
                    <td className='px-4 py-3 text-fp-subtle text-xs'>{fmtDate(r.generatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Usage tab
// ─────────────────────────────────────────────────────────────────────────────
const UsageTab = ({ restaurantId, restaurantName }) => {
  const [stats, setStats] = useState([]);
  const [currentReservations, setCurrentReservations] = useState([]);
  const [prevReservations, setPrevReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sList = await getUsageStats().then((r) =>
        (Array.isArray(r.data) ? r.data : [])
          .filter((s) => String(s.restaurantId) === String(restaurantId))
          .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
      );
      setStats(sList);

      const sinceDate = sList.length > 0 ? new Date(sList[0].generatedAt) : new Date(0);

      const all = await getReservations({ restaurantId, limit: 2000 }).then((r) =>
        Array.isArray(r.data) ? r.data : []
      );

      setCurrentReservations(
        all.filter(
          (rv) =>
            rv.status !== 'CANCELADA' &&
            new Date(rv.createdAt ?? rv.reservedAt) > sinceDate
        )
      );
      setPrevReservations(
        all.filter(
          (rv) =>
            rv.status !== 'CANCELADA' &&
            new Date(rv.createdAt ?? rv.reservedAt) <= sinceDate
        )
      );
    } catch {
      toast.error('Error al cargar estadísticas de uso');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  const metrics = useMemo(() => {
    const curIds = new Set(currentReservations.map((rv) => rv.userId).filter(Boolean));
    const prevIds = new Set(prevReservations.map((rv) => rv.userId).filter(Boolean));
    const repeatUsers = [...curIds].filter((id) => prevIds.has(id)).length;
    const newUsers = Math.max(curIds.size - repeatUsers, 0);

    const hourCounts = {};
    currentReservations.forEach((rv) => {
      const h = new Date(rv.reservedAt).getHours();
      hourCounts[h] = (hourCounts[h] ?? 0) + 1;
    });
    const topH = Object.keys(hourCounts).sort((a, b) => hourCounts[b] - hourCounts[a])[0];
    const mostBusyHour = topH !== undefined ? `${String(topH).padStart(2, '0')}:00` : null;

    return { count: currentReservations.length, newUsers, repeatUsers, mostBusyHour };
  }, [currentReservations, prevReservations]);

  const histReservations = stats.reduce((s, r) => s + (r.reservationsCount ?? 0), 0);
  const histNewUsers = stats.reduce((s, r) => s + (r.newUsers ?? 0), 0);
  const histRepeat = stats.reduce((s, r) => s + (r.repeatUsers ?? 0), 0);

  const handleGenerate = async () => {
    if (metrics.count === 0) {
      toast.error('No hay reservas en el período actual');
      return;
    }
    setGenerating(true);
    try {
      const now = new Date();
      const sinceDate = stats.length > 0 ? new Date(stats[0].generatedAt) : new Date(0);
      const period = determinePeriod(sinceDate, now);
      // UsageStats only allows DÍA, SEMANA, MES
      if (period.type === 'AÑO') period.type = 'MES';

      const payload = {
        restaurantId,
        period,
        reservationsCount: metrics.count,
        eventReservations: 0,
        ...(metrics.mostBusyHour ? { mostBusyHour: metrics.mostBusyHour } : {}),
        newUsers: metrics.newUsers,
        repeatUsers: metrics.repeatUsers,
        generatedAt: now.toISOString(),
      };

      const res = await createUsageStats(payload);
      const savedStat = res.data ?? payload;

      generateUsagePDF({
        stat: { ...savedStat, generatedAt: now },
        allStats: [savedStat, ...stats],
        restaurantName,
      });

      toast.success('Estadísticas generadas y descargadas ✓');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Error al generar estadísticas');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* ── Período actual ── */}
      <div className='bg-fp-surface border border-blue-500/20 rounded-xl p-5'>
        <div className='flex items-start justify-between gap-4 mb-5 flex-wrap'>
          <div>
            <h3 className='text-fp-text font-semibold text-base'>Período actual</h3>
            <p className='text-fp-subtle text-xs mt-0.5'>
              {loading
                ? 'Cargando…'
                : metrics.count === 0
                  ? 'Sin reservas desde el último reporte'
                  : `${metrics.count} reserva${metrics.count !== 1 ? 's' : ''} desde el último reporte`}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || loading || metrics.count === 0}
            className='flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0'
          >
            {generating ? (
              <>
                <span className='w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin' />
                Generando…
              </>
            ) : (
              '↓ Generar estadísticas PDF'
            )}
          </button>
        </div>

        {loading ? (
          <div className='grid grid-cols-3 gap-4'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-24' />
            ))}
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <SummaryCard
                Icon={ClipboardIcon}
                label='Reservas'
                value={metrics.count.toLocaleString()}
                sub='Sin reportar'
              />
              <SummaryCard
                Icon={TrendUpIcon}
                label='Usuarios nuevos'
                value={metrics.newUsers.toLocaleString()}
                sub='Primer contacto en este período'
              />
              <SummaryCard
                Icon={BarChartIcon}
                label='Usuarios recurrentes'
                value={metrics.repeatUsers.toLocaleString()}
                sub='Ya habían reservado antes'
              />
            </div>
            {metrics.mostBusyHour && (
              <p className='text-fp-subtle text-xs mt-3 text-center'>
                Hora pico del período:{' '}
                <span className='text-fp-gold font-semibold'>{metrics.mostBusyHour}</span>
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Histórico ── */}
      {!loading && stats.length > 0 && (
        <>
          <div>
            <h3 className='text-fp-text font-medium text-sm px-0.5 mb-3'>
              Acumulado de estadísticas anteriores
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <SummaryCard
                Icon={ClipboardIcon}
                label='Reservas totales'
                value={histReservations.toLocaleString()}
                sub={`${stats.length} registro${stats.length !== 1 ? 's' : ''}`}
              />
              <SummaryCard
                Icon={TrendUpIcon}
                label='Nuevos usuarios'
                value={histNewUsers.toLocaleString()}
                sub='Suma histórica'
              />
              <SummaryCard
                Icon={BarChartIcon}
                label='Usuarios recurrentes'
                value={histRepeat.toLocaleString()}
                sub='Suma histórica'
              />
            </div>
          </div>

          <BarChart
            data={stats.slice(0, 8).map((s) => ({
              label: PERIOD_LABEL[s.period?.type] ?? s.period?.type ?? '?',
              value: s.reservationsCount ?? 0,
            }))}
            valueKey='value'
            labelKey='label'
            title='Reservas por período (histórico)'
            color='bg-blue-500'
          />
        </>
      )}

      {/* ── Tabla ── */}
      <div className='bg-fp-surface border border-fp-border rounded-xl overflow-hidden'>
        <div className='px-5 py-4 border-b border-fp-border'>
          <h3 className='text-fp-text font-medium text-sm'>Estadísticas guardadas</h3>
        </div>

        {loading ? (
          <div className='p-5 space-y-3'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        ) : stats.length === 0 ? (
          <p className='text-fp-subtle text-sm text-center py-10'>
            Sin estadísticas — presiona "Generar estadísticas PDF" para crear las primeras
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-fp-border bg-fp-bg'>
                  {['Período', 'Reservas', 'Hora pico', 'Nuevos', 'Recurrentes', 'Generado'].map(
                    (h) => (
                      <th
                        key={h}
                        className='px-4 py-3 text-left text-xs text-fp-subtle uppercase tracking-wide font-medium'
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className='divide-y divide-fp-border-subtle'>
                {stats.map((s) => (
                  <tr key={s._id} className='hover:bg-fp-elevated/50 transition-colors'>
                    <td className='px-4 py-3 text-fp-muted'>
                      {PERIOD_LABEL[s.period?.type] ?? s.period?.type ?? '—'}
                    </td>
                    <td className='px-4 py-3 text-fp-text'>{s.reservationsCount ?? 0}</td>
                    <td className='px-4 py-3 text-fp-muted'>{s.mostBusyHour ?? '—'}</td>
                    <td className='px-4 py-3 text-fp-muted'>{s.newUsers ?? 0}</td>
                    <td className='px-4 py-3 text-fp-muted'>{s.repeatUsers ?? 0}</td>
                    <td className='px-4 py-3 text-fp-subtle text-xs'>{fmtDate(s.generatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
const TABS = ['Ventas', 'Uso'];

export const RestaurantReportsPage = () => {
  const { selectedRestaurant } = useRestaurantStore();
  const [tab, setTab] = useState('Ventas');

  if (!selectedRestaurant) return <NoRestaurant />;

  return (
    <div className='space-y-6 animate-fadeUp'>
      <div>
        <h1 className='font-display text-2xl text-fp-text'>Reportes</h1>
        <p className='text-fp-muted text-sm mt-0.5'>
          {selectedRestaurant.name} · {selectedRestaurant.category}
        </p>
      </div>

      <div className='flex gap-1 bg-fp-elevated p-1 rounded-lg w-fit'>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-fp-surface text-fp-text shadow-sm'
                : 'text-fp-muted hover:text-fp-text'
            }`}
          >
            {t === 'Ventas' ? 'Reportes de ventas' : 'Estadísticas de uso'}
          </button>
        ))}
      </div>

      {tab === 'Ventas' ? (
        <SalesTab
          restaurantId={selectedRestaurant._id}
          restaurantName={selectedRestaurant.name}
        />
      ) : (
        <UsageTab
          restaurantId={selectedRestaurant._id}
          restaurantName={selectedRestaurant.name}
        />
      )}
    </div>
  );
};
