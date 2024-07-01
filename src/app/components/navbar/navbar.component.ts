import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  navbarMobile = false;
  classBiList = true;
  activeSection = '';
  @Output() setActiveSection = new EventEmitter<any>();
  constructor(private router: Router, private route: ActivatedRoute) { }
  
  ngOnInit() {
    this.activeSection = '/';
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const childRoute = this.route.firstChild;


      if (childRoute && childRoute.snapshot.url[0]) {
        this.setActiveSection.emit(childRoute.snapshot.url[0].path);
      } else {
        this.setActiveSection.emit('/');
      }
    });
  }


  isSectionActive(section: string): boolean {
    return this.activeSection === section;
  }
  navBarClick() {
    this.navbarMobile = !this.navbarMobile;
    this.classBiList = !this.classBiList;
  }
}
