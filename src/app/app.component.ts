import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ScriptService } from './services/script.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit{
  @ViewChildren('header, about,resume,services,portfolio,contact') sections!: QueryList<ElementRef>; title = 'personal-page';
  /**
   * The reference to the 'header' element in the component's template.
   */
  @ViewChild('skills-content') skillsContent: ElementRef | undefined;

  constructor(private script: ScriptService) {}
  ngOnInit(): void {
    this.loadscipts();
  }
  activeSection = 'header';
  classBiList = true;
  navbarMobile = false;
  classHeaderTop = false;
  ngAfterViewInit() {
    // Ahora puedes acceder a skillsContent

    // Aquí puedes poner la lógica que depende de skillsContent
  }
  setActiveSection(section: string) {

    if (this.navbarMobile) {
      this.navbarMobile = false;
      this.classBiList = !this.classBiList;

    }
    if (section != "header" && this.activeSection === "header") {
      this.classHeaderTop = true;
      setTimeout((a: any) => {
        this.activeSection = section;
        this.scrollToSection(section)
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
      sectionElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navBarClick() {
    console.log('entro');
    console.log(this.navbarMobile)
    this.navbarMobile = !this.navbarMobile;
    this.classBiList = !this.classBiList;
    console.log(this.navbarMobile)

  }

  public loadscipts(){
    this.script.load('main').then( (data2: any) => {

    }).catch(error => console.log(error));
  }

  


}
