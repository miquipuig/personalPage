import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  navbarMobile = false;
  classBiList = true;
  activeSection = '';
  classHeaderTop = false;
  sectionsList = ['/', 'about', 'resume', 'contact'];
  fullRoute = '';
  userMenu = false;
  @Output() scrollToSection = new EventEmitter<any>();


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

  constructor(private router: Router, private route: ActivatedRoute, public auth: AuthService) { }
  
  ngOnInit() {
    this.activeSection = '/';
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const childRoute = this.route.firstChild as any;


      if (childRoute && childRoute.snapshot.url[0]) {
        this.setActiveSection(childRoute.snapshot.url[0].path);

        if(childRoute.snapshot._routerState){
          this.fullRoute=childRoute?.snapshot?._routerState.url;
        }
        console.log(childRoute?.snapshot?._routerState.url);

      } else {
        this.setActiveSection('/');
      }
    });
  }



  isSectionActive(section: string): boolean {
    return this.activeSection === section;
  }

  isFullRouteActive(section: string): boolean {
    return this.fullRoute === section;
  }
  navBarClick() {
    this.navbarMobile = !this.navbarMobile;
    this.classBiList = !this.classBiList;
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
        this.activeSection = section;
        this.scrollToSection.emit(section);
      }, 500);


    } else if (section != "/") {
      this.classHeaderTop = true;
      this.activeSection = section;
      this.activeSection = section;

      this.scrollToSection.emit(section)

    } else {
      this.classHeaderTop = false;
      this.activeSection = section;
      this.activeSection = section;
      this.scrollToSection.emit(section)

    }
  }
}
