import { Component, ElementRef, Inject, Input, OnChanges, OnDestroy, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';

interface TocItem { id: string; text: string; level: number; }

// Presentational chrome for a blog post (title, meta, cover, body, related
// sidebar + table of contents). Shared by the public detail page and the editor
// preview so they always look identical. The markdown body itself is styled by
// global rules in styles.css (it's injected via [innerHTML]).
@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.css'],
})
export class PostViewComponent implements OnChanges, OnDestroy {
  @Input() title = '';
  @Input() publishedAt: any = null;
  @Input() readingMinutes = 0;
  @Input() coverImage = '';
  @Input() coverCaption = '';
  @Input() bodyHtml: SafeHtml | string = '';
  @Input() relatedPosts: any[] = [];
  @Input() tags: string[] = [];
  @Input() translations: any[] = [];
  // In preview mode the related cards and the back link don't navigate.
  @Input() preview = false;

  readonly langLabels: Record<string, string> = { ca: 'Català', es: 'Español', en: 'English' };
  langLabel(l: string): string { return this.langLabels[l] || (l || '').toUpperCase(); }

  tocItems: TocItem[] = [];
  activeId = '';

  private headingEls: HTMLElement[] = [];
  private scrollHandler?: () => void;
  private rafPending = false;
  private readonly isBrowser: boolean;

  constructor(private el: ElementRef, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // The body is injected via [innerHTML]; read its headings after the DOM has
    // been updated (next tick). Browser-only (the spy needs window scroll).
    if (changes['bodyHtml'] && this.isBrowser) {
      setTimeout(() => {
        this.buildToc();
        this.enhanceCodeBlocks();
      });
    }
  }

  // Add a "copy" button to each rendered code block. The body is injected via
  // [innerHTML], so this is done imperatively after render.
  private enhanceCodeBlocks(): void {
    const root = this.el.nativeElement.querySelector('.post-body') as HTMLElement | null;
    if (!root) return;
    for (const pre of Array.from(root.querySelectorAll('pre')) as HTMLElement[]) {
      if (pre.querySelector('.code-copy')) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = 'Copiar';
      btn.addEventListener('click', () => {
        const code = (pre.querySelector('code')?.textContent ?? pre.textContent ?? '').replace(/Copiar$/, '');
        navigator.clipboard?.writeText(code).then(() => {
          btn.textContent = 'Copiat!';
          setTimeout(() => { btn.textContent = 'Copiar'; }, 1500);
        }).catch(() => {});
      });
      pre.appendChild(btn);
    }
  }

  ngOnDestroy(): void {
    this.detachScroll();
  }

  private buildToc(): void {
    this.detachScroll();
    const root = this.el.nativeElement.querySelector('.post-body') as HTMLElement | null;
    const headings = root ? (Array.from(root.querySelectorAll('h2, h3')) as HTMLElement[]).filter((h) => h.id) : [];
    const items = headings.map((h) => ({ id: h.id, text: (h.textContent || '').trim(), level: h.tagName === 'H3' ? 3 : 2 }));
    // Only worth a TOC for posts with a few sections.
    this.tocItems = items.length >= 3 ? items : [];
    if (!this.tocItems.length) return;

    this.headingEls = headings;
    this.scrollHandler = () => {
      if (this.rafPending) return;
      this.rafPending = true;
      requestAnimationFrame(() => {
        this.rafPending = false;
        this.updateActive();
      });
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.updateActive();
  }

  // The active section is the last heading whose top has scrolled above the
  // reading line (~120px from the top of the viewport).
  private updateActive(): void {
    let current = this.headingEls[0]?.id ?? '';
    for (const h of this.headingEls) {
      if (h.getBoundingClientRect().top <= 120) current = h.id;
      else break;
    }
    this.activeId = current;
  }

  private detachScroll(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = undefined;
    }
  }

  scrollTo(id: string, ev: Event): void {
    ev.preventDefault();
    const target = this.el.nativeElement.querySelector('#' + (window as any).CSS.escape(id)) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeId = id;
    }
  }
}
