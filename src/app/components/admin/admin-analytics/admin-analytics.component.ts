import { Component, ElementRef, Inject, NgZone, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BlogService } from '../../../services/blog.service';

interface ChartModel {
  w: number; h: number;
  totalPts: string;
  uniquePts: string;
  maxY: number;
  xLabels: { x: number; label: string }[];
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
  data: any = { totals: {}, pages: [], referrers: [], countries: [], series: [] };
  chart: ChartModel = { w: 1000, h: 240, totalPts: '', uniquePts: '', maxY: 1, xLabels: [] };

  private isBrowser: boolean;
  private mapInstance: any = null;

  constructor(private blog: BlogService, private zone: NgZone, @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.blog.getAnalytics(this.days, this.selectedCountry).subscribe({
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
    const points: { date: string; total: number; unique: number }[] = [];
    const today = new Date();
    for (let i = this.days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const rec = byDate[key] ?? { total: 0, unique: 0 };
      points.push({ date: key, total: rec.total, unique: rec.unique });
    }
    const W = 1000, H = 240, pad = 28;
    const n = points.length;
    const maxY = Math.max(1, ...points.map((p) => p.total));
    const x = (i: number) => pad + (n <= 1 ? 0 : (i / (n - 1)) * (W - 2 * pad));
    const y = (v: number) => H - pad - (v / maxY) * (H - 2 * pad);
    const idxs = n <= 1 ? [0] : [0, Math.floor(n / 2), n - 1];
    this.chart = {
      w: W, h: H, maxY,
      totalPts: points.map((p, i) => `${x(i).toFixed(1)},${y(p.total).toFixed(1)}`).join(' '),
      uniquePts: points.map((p, i) => `${x(i).toFixed(1)},${y(p.unique).toFixed(1)}`).join(' '),
      xLabels: idxs.map((i) => ({ x: x(i), label: points[i].date.slice(5) })),
    };
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
        regionStyle: { initial: { fill: '#2a3340', stroke: '#11151c', strokeWidth: 0.4 } },
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
      // Colour visited countries manually (jsvectormap's own scale breaks when a
      // single country has data). More visits → more saturated red.
      const root = this.mapEl.nativeElement;
      const maxV = Math.max(1, ...Object.values(values));
      for (const [cc, v] of Object.entries(values)) {
        const el = root.querySelector(`[data-code="${cc}"]`);
        if (el) el.setAttribute('fill', this.redShade(v / maxV));
      }
      // Outline the active filter so it stands out without changing its colour.
      if (this.selectedCountry) {
        const sel = root.querySelector(`[data-code="${this.selectedCountry}"]`);
        if (sel) { sel.setAttribute('stroke', '#fff'); sel.setAttribute('stroke-width', '1.4'); }
      }
    } catch {
      // Map is optional — ignore failures silently.
    }
  }
}
