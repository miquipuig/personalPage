import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ScriptService } from './services/script.service';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NgcCookieConsentService } from 'ngx-cookieconsent';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit {

  @ViewChildren('header, about,resume,services,portfolio,contact') sections!: QueryList<ElementRef>; title = 'personal-page';
  /**
   * The reference to the 'header' element in the component's template.
   */
  @ViewChild('skills-content') skillsContent: ElementRef | undefined;
  @ViewChild(NavbarComponent) navbar!: NavbarComponent;

  private isBrowser: boolean;

  // ccService is injected so the cookie-consent banner initialises on load.
  constructor(private script: ScriptService, private router: Router, private route: ActivatedRoute,
    private ccService: NgcCookieConsentService, @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }


  pageLoaded = false;

  ngOnInit(): void {
    // Browser-only: script injection and direct DOM access break during SSR.
    if (!this.isBrowser) {
      return;
    }
    this.loadscipts();

    // Toggle the black & white background: colour on the home view, grayscale
    // once a section is open. CSS (body.section-open #background-image) animates
    // the transition.
    this.applySectionBg();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.applySectionBg());
  }
  activeSection = '';

  private applySectionBg(): void {
    const path = this.router.url.split('?')[0].split('#')[0];
    const isHome = path === '/' || path === '';
    document.body.classList.toggle('section-open', !isHome);
  }

  ngAfterViewInit() {
    // Defer to the next microtask: setting pageLoaded synchronously here flips
    // an *ngIf already checked this cycle, triggering NG0100 in dev mode.
    Promise.resolve().then(() => (this.pageLoaded = true));
  }


  scrollToSection(sectionId: string): void {
    const sectionElement = this.sections.find((el) => el.nativeElement.id === sectionId);
    if (sectionElement) {
      sectionElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }


  public loadscipts() {
    this.script.load('main').then((data2: any) => {

    }).catch(error => console.log(error));
  }


}
