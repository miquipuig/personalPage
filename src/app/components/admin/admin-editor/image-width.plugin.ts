import { $prose } from '@milkdown/utils';
import { Plugin, NodeSelection } from '@milkdown/prose/state';

// Interactive image node view for Milkdown. It applies the width carried in the
// `#w=` URL fragment so sized images look right while editing, and — when the
// image is selected (clicked) — shows a small toolbar to change the size, edit
// the alt text, or delete the image. Storage stays plain markdown.

const SIZES = [
  { label: 'S', value: '25%' },
  { label: 'M', value: '50%' },
  { label: 'L', value: '100%' },
  { label: 'Original', value: '' },
];

function widthOf(src: string): string {
  const m = src.match(/#w=(\d+%?)$/);
  return m ? m[1] : '';
}
function stripWidth(src: string): string {
  return src.replace(/#w=\d+%?$/, '');
}

class ImageView {
  dom: HTMLElement;
  private img: HTMLImageElement;
  private tools: HTMLElement;
  private altInput!: HTMLInputElement;

  constructor(private node: any, private view: any, private getPos: () => number | undefined) {
    this.dom = document.createElement('span');
    this.dom.className = 'img-tools-wrap';

    this.img = document.createElement('img');
    this.dom.appendChild(this.img);

    this.tools = this.buildTools();
    this.dom.appendChild(this.tools);

    this.render();
  }

  private render(): void {
    const src = String(this.node.attrs?.src ?? '');
    const w = widthOf(src);
    this.img.src = src;
    this.img.alt = this.node.attrs?.alt ?? '';
    this.img.style.maxWidth = '100%';
    this.img.style.width = w || '';
    if (this.altInput && this.altInput.value !== (this.node.attrs?.alt ?? '')) {
      this.altInput.value = this.node.attrs?.alt ?? '';
    }
    // Highlight the active size button.
    this.tools.querySelectorAll('button[data-size]').forEach((b) => {
      (b as HTMLElement).classList.toggle('active', (b as HTMLElement).dataset['size'] === w);
    });
  }

  private buildTools(): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'img-tools';

    SIZES.forEach((s) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = s.label;
      btn.dataset['size'] = s.value;
      btn.title = `Size: ${s.label}`;
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', () => this.setSize(s.value));
      bar.appendChild(btn);
    });

    this.altInput = document.createElement('input');
    this.altInput.type = 'text';
    this.altInput.placeholder = 'alt text';
    this.altInput.className = 'img-alt';
    this.altInput.addEventListener('change', () => this.setAttrs({ alt: this.altInput.value }));
    bar.appendChild(this.altInput);

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Delete';
    del.className = 'img-del';
    del.addEventListener('mousedown', (e) => e.preventDefault());
    del.addEventListener('click', () => this.remove());
    bar.appendChild(del);

    return bar;
  }

  private setSize(w: string): void {
    const base = stripWidth(String(this.node.attrs?.src ?? ''));
    this.setAttrs({ src: w ? `${base}#w=${w}` : base });
  }

  private setAttrs(partial: object): void {
    const pos = this.getPos();
    if (pos == null) return;
    const attrs = { ...this.node.attrs, ...partial };
    const tr = this.view.state.tr.setNodeMarkup(pos, undefined, attrs);
    // Keep the image selected so the toolbar stays up across edits.
    tr.setSelection(NodeSelection.create(tr.doc, pos));
    this.view.dispatch(tr);
  }

  private remove(): void {
    const pos = this.getPos();
    if (pos == null) return;
    this.view.dispatch(this.view.state.tr.delete(pos, pos + this.node.nodeSize));
    this.view.focus();
  }

  selectNode(): void {
    this.dom.classList.add('selected');
  }
  deselectNode(): void {
    this.dom.classList.remove('selected');
  }
  // Let the toolbar's own clicks/typing work without ProseMirror intercepting.
  stopEvent(e: Event): boolean {
    return this.tools.contains(e.target as Node);
  }
  ignoreMutation(): boolean {
    return true;
  }
  update(node: any): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.render();
    return true;
  }
}

export const imageWidth = $prose(() => new Plugin({
  props: {
    nodeViews: {
      image: (node: any, view: any, getPos: any) => new ImageView(node, view, getPos),
    },
  },
}));
