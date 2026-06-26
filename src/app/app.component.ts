import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ScriptService } from './services/script.service';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NgcCookieConsentService } from 'ngx-cookieconsent';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChildren('header, about,resume,services,portfolio,contact') sections!: QueryList<ElementRef>; title = 'personal-page';
  /**
   * The reference to the 'header' element in the component's template.
   */
  @ViewChild('skills-content') skillsContent: ElementRef | undefined;
  @ViewChild(NavbarComponent) navbar!: NavbarComponent;

  constructor(private script: ScriptService, private router: Router, private route: ActivatedRoute,
    private ccService: NgcCookieConsentService) {}


  pageLoaded = false;
  // true once the visitor has accepted/declined → the footer link offers to
  // "Change" the choice instead of "Decline" it.
  cookieDecided = false;
  private ccStatusSub?: Subscription;

  ngOnInit(): void {
    this.loadscipts();

    this.cookieDecided = this.ccService.hasConsented();
    this.ccStatusSub = this.ccService.statusChange$.subscribe(() => {
      this.cookieDecided = this.ccService.hasConsented();
    });
  }
  activeSection = '';

  ngAfterViewInit() {
    this.pageLoaded = true;
  }

  ngOnDestroy(): void {
    this.ccStatusSub?.unsubscribe();
  }

  // Re-open the cookie-consent banner so the visitor can review/change consent.
  cookiePolicy(): void {
    this.ccService.destroy();
    this.ccService.init(this.ccService.getConfig());
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
