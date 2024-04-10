import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ScriptService } from './services/script.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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

  constructor(private script: ScriptService, private router: Router, private route: ActivatedRoute) { 
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const childRoute = this.route.firstChild;
      if (childRoute) {
        this.setActiveSection(childRoute.snapshot.url[0].path);
      }
    }); 

  }
  pageLoaded = false;
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (this.activeSection != 'jueguito') {
      if (event.key === 'ArrowRight') {
        let currentIndex = this.sectionsList.findIndex(section => section === this.activeSection);
        // Si se presiona la flecha derecha, obtén la siguiente sección
        let nextSection = this.sectionsList[currentIndex + 1] || this.sectionsList[0];
        this.setActiveSection(nextSection);
      } else if (event.key === 'ArrowLeft') {
        let currentIndex = this.sectionsList.findIndex(section => section === this.activeSection);
        // Si se presiona la flecha izquierda, obtén la sección anterior
        let nextSection = this.sectionsList[currentIndex - 1] || this.sectionsList[this.sectionsList.length - 1];
        this.setActiveSection(nextSection);
      } else if (event.key === 'ArrowDown') {
        this.setActiveSection('jueguito');
      }
    }

  }
  sectionsList = ['header', 'about', 'resume', 'contact'];
  ngOnInit(): void {
     this.loadscipts();

  }
  activeSection = 'header';
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
    if (section != "header" && this.activeSection === "header") {
      this.classHeaderTop = true;
      setTimeout((a: any) => {
        console.log("entro")
        this.activeSection = section;
        this.scrollToSection(section);
    }, 500);


    } else if (section != "header") {
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
      console.log("esto funciona")
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
    this.activeSection = 'header';
    this.classHeaderTop = false;
  }




}
