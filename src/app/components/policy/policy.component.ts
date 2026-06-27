import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { marked } from 'marked';
import { POLICY_DOCS, PolicyDoc } from './policy-content';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css']
})
export class PolicyComponent implements OnInit, OnDestroy {
  isSectionActive = false;
  doc: PolicyDoc = 'privacy';
  html: SafeHtml = '';
  private dataSub?: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // Subscribe (not snapshot) so navigating /policy → /terms → /cookies while
    // the component instance is reused still re-renders the right document.
    this.dataSub = this.route.data.subscribe(data => {
      this.doc = (data['doc'] as PolicyDoc | undefined) ?? this.docFromUrl();
      const rendered = marked.parse(POLICY_DOCS[this.doc]) as string;
      this.html = this.sanitizer.bypassSecurityTrustHtml(rendered);
    });
    setTimeout(() => { this.isSectionActive = true; }, 50);
  }

  ngOnDestroy() {
    this.dataSub?.unsubscribe();
  }

  // Fallback when route data is absent (e.g. a hard refresh): use the URL path.
  private docFromUrl(): PolicyDoc {
    const path = this.router.url.split('?')[0].split('#')[0];
    if (path.startsWith('/terms')) return 'terms';
    if (path.startsWith('/cookies')) return 'cookie';
    return 'privacy';
  }
}
