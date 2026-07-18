import { Component, ElementRef, Inject, NgZone, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BlogService } from '../../../services/blog.service';

interface ChartPoint {
  date: string;
  total: number;
  unique: number;
  x: number;      // SVG viewBox x for this point
  yTotal: number; // SVG viewBox y for total
  yUnique: number;
}

interface ChartModel {
  w: number; h: number;
  pad: number;
  totalPts: string;
  uniquePts: string;
  maxY: number;
  xLabels: { x: number; label: string }[];
  points: ChartPoint[];
  bandW: number;  // width per hover column in SVG units
}

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.css'],
})
export class AdminAnalyticsComponent implements OnInit {
  @ViewChild('mapEl') mapEl?: ElementRef<HTMLElement>;

  loading = true;
  error = '';
  days = 30;
  periods = [7, 30, 90, 365];
  selectedCountry = '';
  selectedPage = '';
  selectedReferrer = '';
  data: any = { totals: {}, pages: [], referrers: [], countries: [], series: [] };
  chart: ChartModel = { w: 1000, h: 240, pad: 28, totalPts: '', uniquePts: '', maxY: 1, xLabels: [], points: [], bandW: 0 };
  hoverIndex: number | null = null;

  private isBrowser: boolean;
  private mapInstance: any = null;

  constructor(private blog: BlogService, private zone: NgZone, @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.blog.getAnalytics(this.days, this.selectedCountry, this.selectedPage, this.selectedReferrer).subscribe({
      next: (r: any) => {
        this.data = r ?? this.data;
        this.loading = false;
        this.buildChart();
        setTimeout(() => this.renderMap());
      },
      error: () => { this.error = 'No s\'ha pogut carregar l\'analítica.'; this.loading = false; },
    });
  }

  setDays(d: number): void { this.days = d; this.load(); }

  // Toggle the country filter (totals/pages/referrers/chart narrow to it; the
  // map/list stay full so you can pick another).
  selectCountry(cc: string): void {
    const c = String(cc || '').toUpperCase();
    if (!c || c.length !== 2) return;
    this.selectedCountry = this.selectedCountry === c ? '' : c;
    this.load();
  }

  clearCountry(): void {
    this.selectedCountry = '';
    this.load();
  }

  // Toggle the page filter (totals/referrers/chart narrow to it; the pages
  // list stays full so you can pick another).
  selectPage(p: string): void {
    const s = String(p || '').trim();
    if (!s) return;
    this.selectedPage = this.selectedPage === s ? '' : s;
    this.load();
  }

  clearPage(): void {
    this.selectedPage = '';
    this.load();
  }

  // Toggle the referrer filter (totals/pages/countries/chart narrow to it;
  // the referrers list stays full so you can pick another).
  selectReferrer(r: string): void {
    const s = String(r || '').trim();
    if (!s) return;
    this.selectedReferrer = this.selectedReferrer === s ? '' : s;
    this.load();
  }

  clearReferrer(): void {
    this.selectedReferrer = '';
    this.load();
  }

  pageLabel(p: string): string {
    const map: Record<string, string> = { home: 'Home', about: 'About', resume: 'Resume', contact: 'Contact', blog: 'Blog' };
    if (map[p]) return map[p];
    if (p?.startsWith('post:')) return 'Post · ' + p.slice(5);
    return p;
  }

  flag(cc: string): string {
    if (!cc || cc.length !== 2) return '';
    try {
      return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
    } catch {
      return '';
    }
  }

  private buildChart(): void {
    const byDate: Record<string, { total: number; unique: number }> = {};
    for (const s of (this.data.series ?? [])) {
      byDate[String(s.date).slice(0, 10)] = { total: +s.total || 0, unique: +s.unique || 0 };
    }
    const raw: { date: string; total: number; unique: number }[] = [];
    const today = new Date();
    for (let i = this.days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const rec = byDate[key] ?? { total: 0, unique: 0 };
      raw.push({ date: key, total: rec.total, unique: rec.unique });
    }
    const W = 1000, H = 240, pad = 28;
    const n = raw.length;
    const maxY = Math.max(1, ...raw.map((p) => p.total));
    const x = (i: number) => pad + (n <= 1 ? 0 : (i / (n - 1)) * (W - 2 * pad));
    const y = (v: number) => H - pad - (v / maxY) * (H - 2 * pad);
    const idxs = n <= 1 ? [0] : [0, Math.floor(n / 2), n - 1];
    const points: ChartPoint[] = raw.map((p, i) => ({
      date: p.date, total: p.total, unique: p.unique,
      x: x(i), yTotal: y(p.total), yUnique: y(p.unique),
    }));
    this.chart = {
      w: W, h: H, pad, maxY,
      totalPts: points.map((p) => `${p.x.toFixed(1)},${p.yTotal.toFixed(1)}`).join(' '),
      uniquePts: points.map((p) => `${p.x.toFixed(1)},${p.yUnique.toFixed(1)}`).join(' '),
      xLabels: idxs.map((i) => ({ x: x(i), label: points[i].date.slice(5) })),
      points,
      bandW: n <= 1 ? W : (W - 2 * pad) / (n - 1),
    };
    // Reset hover when data changes so a stale index can't point past the end.
    this.hoverIndex = null;
  }

  setHover(i: number | null): void {
    this.hoverIndex = i;
  }

  // Position for the SVG hover band centred on point i (clamped at edges so
  // first/last band doesn't overflow past the axis).
  bandX(i: number): number {
    const half = this.chart.bandW / 2;
    return Math.max(0, this.chart.points[i]?.x - half);
  }

  bandWidth(i: number): number {
    const half = this.chart.bandW / 2;
    const p = this.chart.points[i];
    if (!p) return 0;
    const left = p.x - half;
    const right = p.x + half;
    return Math.min(this.chart.w, right) - Math.max(0, left);
  }

  // Tooltip left position (0-100%). The chart SVG uses preserveAspectRatio
  // "none", so an SVG x of W maps to the full rendered width — a plain
  // proportion works.
  hoverLeftPct(): number {
    const i = this.hoverIndex;
    if (i == null) return 0;
    return (this.chart.points[i]?.x / this.chart.w) * 100;
  }

  // True when the tooltip should render on the left of the hovered point
  // (right half of the chart) so it doesn't overflow past the container.
  hoverOnRight(): boolean {
    return this.hoverLeftPct() > 60;
  }

  // Interpolate from a light red (t=0) to vivid red (t=1).
  private redShade(t: number): string {
    const a = [255, 180, 162];
    const b = [255, 38, 0];
    const k = Math.max(0, Math.min(1, t));
    const c = a.map((x, i) => Math.round(x + (b[i] - x) * k));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  private async renderMap(): Promise<void> {
    if (!this.isBrowser || !this.mapEl?.nativeElement) return;
    const values: Record<string, number> = {};
    const stats: Record<string, { total: number; unique: number }> = {};
    for (const c of (this.data.countries ?? [])) {
      const cc = String(c.country || '').toUpperCase();
      if (cc.length === 2) {
        values[cc] = +c.total || 0;
        stats[cc] = { total: +c.total || 0, unique: +c.unique || 0 };
      }
    }
    try {
      try { this.mapInstance?.destroy(); } catch { /* ignore */ }
      this.mapEl.nativeElement.innerHTML = '';
      const mod: any = await import('jsvectormap');
      const jsVectorMap = mod.default || mod;
      (window as any).jsVectorMap = jsVectorMap;
      await import('jsvectormap/dist/maps/world.js');
      this.mapInstance = new jsVectorMap({
        selector: this.mapEl.nativeElement,
        map: 'world',
        backgroundColor: 'transparent',
        zoomButtons: true,
        regionStyle: {
          initial: { fill: '#2a3340', stroke: '#11151c', strokeWidth: 0.4 },
          // Highlight on hover WITHOUT changing the fill, so the country's
          // colour stays visible instead of resetting to the base grey.
          hover: { fillOpacity: 1, stroke: '#ffffff', strokeWidth: 0.9 },
          selected: { stroke: '#ffffff', strokeWidth: 2.5, fillOpacity: 1 },
        },
        onRegionTooltipShow: (_event: any, tooltip: any, code: string) => {
          const s = stats[String(code).toUpperCase()] || { total: 0, unique: 0 };
          const name = tooltip.text() || code;
          // Country visits for the selected period: total + unique visitors.
          tooltip.text(
            `<strong>${name}</strong><br>Total: ${s.total} · Úniques: ${s.unique}`,
            true,
          );
        },
        onRegionClick: (_event: any, code: string) => {
          this.zone.run(() => this.selectCountry(code));
        },
      });
      // Colour visited countries through jsvectormap's own style model
      // (element.setStyle → style.current), so the colour survives hover and
      // mouse-out instead of being reset to the base grey. More visits → more
      // saturated red. (Its numeric scale breaks with a single country, so we
      // still compute the shade ourselves.)
      const regions: Record<string, any> = this.mapInstance?.regions || {};
      const maxV = Math.max(1, ...Object.values(values));
      for (const [cc, v] of Object.entries(values)) {
        regions[cc]?.element?.setStyle('fill', this.redShade(v / maxV));
      }
      // Highlight the active country (clicked in the table or on the map) using
      // jsvectormap's own selected state, and lift it above its neighbours so
      // the outline is fully visible.
      if (this.selectedCountry && regions[this.selectedCountry]) {
        try { this.mapInstance.setSelectedRegions([this.selectedCountry]); } catch { /* ignore */ }
        const node = regions[this.selectedCountry].element?.shape?.node;
        if (node?.parentNode) node.parentNode.appendChild(node);
      }
    } catch {
      // Map is optional — ignore failures silently.
    }
  }
}
