import { Component } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css']
})
export class PolicyComponent {
  isSectionActive = false;
  markdown = '# Hello, world!';
  // html: string;
  constructor() {
    // this.html = this.markdownService.parse(this.markdown);
  }
  ngOnInit() {
    console.log('PolicyComponent');
    // temporizador que se espera 0.5 segundos y setea la variable isSectionActive a true``
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);
  }
}
