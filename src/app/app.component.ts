import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ScriptService } from './services/script.service';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { filter } from 'rxjs/operators';



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

  constructor(private script: ScriptService, private router: Router, private route: ActivatedRoute,) {

    // Obtener solo la parte de la ruta de la URL actual
    // this.route.url.subscribe(segments => {
    //   console.log('Segmentos de la ruta:', segments.join('/'));
    // });

    // Acceder a los parámetros de la ruta si es necesario
    // this.route.params.subscribe(params => {
    //   console.log('Parámetros de la ruta:', params);
    // });



    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const childRoute = this.route.firstChild;


      if (childRoute && childRoute.snapshot.url[0]) {
        this.setActiveSection(childRoute.snapshot.url[0].path);
      } else {
        this.setActiveSection('/');
      }
    });

  }
  pageLoaded = false;
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (this.activeSection != 'mickeyDino') {
      if (event.key === 'ArrowRight') {
        let currentIndex = this.sectionsList.findIndex(section => section === this.activeSection);
        // Si se presiona la flecha derecha, obtén la siguiente sección
        let nextSection = this.sectionsList[currentIndex + 1] || this.sectionsList[0];
        this.router.navigate([nextSection]);
      } else if (event.key === 'ArrowLeft') {
        let currentIndex = this.sectionsList.findIndex(section => section === this.activeSection);
        // Si se presiona la flecha izquierda, obtén la sección anterior
        let nextSection = this.sectionsList[currentIndex - 1] || this.sectionsList[this.sectionsList.length - 1];
        this.router.navigate([nextSection]);
      } else if (event.key === 'ArrowDown') {
        this.router.navigate(['mickeyDino']);
      }
    }

  }


  sectionsList = ['/', 'about', 'resume', 'contact'];
  ngOnInit(): void {
    this.loadscipts();

  }
  activeSection = '';
  classBiList = true;
  navbarMobile = false;
  classHeaderTop = false;

  ngAfterViewInit() {
    this.pageLoaded = true;
  }
  setActiveSection(section: string) {

    if (this.navbarMobile) {
      this.navbarMobile = false;
      this.classBiList = !this.classBiList;

    }
    if (section != "/" && this.activeSection === "/") {
      this.classHeaderTop = true;
      setTimeout((a: any) => {
        this.activeSection = section;
        this.scrollToSection(section);
      }, 500);


    } else if (section != "/") {
      this.classHeaderTop = true;
      this.activeSection = section;
      this.scrollToSection(section)

    } else {
      this.classHeaderTop = false;
      this.activeSection = section;
      this.scrollToSection(section)

    }
  }

  isSectionActive(section: string): boolean {
    return this.activeSection === section;
  }

  scrollToSection(sectionId: string): void {
    const sectionElement = this.sections.find((el) => el.nativeElement.id === sectionId);
    if (sectionElement) {
      sectionElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navBarClick() {
    this.navbarMobile = !this.navbarMobile;
    this.classBiList = !this.classBiList;
  }

  public loadscipts() {
    this.script.load('main').then((data2: any) => {

    }).catch(error => console.log(error));
  }

  public closeSection() {
    this.activeSection = '';
    this.classHeaderTop = false;
  }




}
