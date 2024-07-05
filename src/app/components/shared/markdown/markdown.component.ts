import { Component } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-markdown',
  template: `
    <div [innerHTML]="html"></div>
  `,
  
})


export class MarkdownComponent {
  markdown = "# Esto es un encabezado de nivel 1 \n## Esto es un encabezado de nivel 2 \n### Esto es un encabezado de nivel 3 \n\n- Esto es un ítem de una lista no ordenada \n- Otro ítem";

  html: string="<h1>Hello, world!</h1>";

  constructor(private markdownService: MarkdownService) {
    this.html = this.markdownService.parse(this.markdown);
  }
}
