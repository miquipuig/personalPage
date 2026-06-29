import { $prose } from '@milkdown/utils';
import { Plugin, NodeSelection } from '@milkdown/prose/state';

// Image width is carried in the URL fragment (`#w=25%`). This node view applies
// it so sized images look right while editing, and clicking an image selects it
// as a node. The actual edit controls (size / alt / delete) live OUTSIDE the
// editor as an Angular panel — a floating in-editor toolbar overlapped content
// and intercepted clicks. `onSelect` reports the selected image to the host.

export interface SelectedImage {
  pos: number;
  width: string;
  alt: string;
}

function widthOf(src: string): string {
  const m = src.match(/#w=(\d+%?)$/);
  return m ? m[1] : '';
}

class ImageView {
  dom: HTMLElement;
  private img: HTMLImageElement;

  constructor(private node: any) {
    this.dom = document.createElement('span');
    this.dom.className = 'img-node';
    this.img = document.createElement('img');
    this.dom.appendChild(this.img);
    this.render();
  }

  private render(): void {
    const src = String(this.node.attrs?.src ?? '');
    const w = widthOf(src);
    this.img.src = src;
    this.img.alt = this.node.attrs?.alt ?? '';
    this.img.style.maxWidth = '100%';
    this.img.style.width = w || '';
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

export function imageWidth(onSelect: (img: SelectedImage | null) => void) {
  return $prose(() => new Plugin({
    view: () => ({
      update: (view: any) => {
        const sel = view.state.selection;
        if (sel instanceof NodeSelection && sel.node?.type?.name === 'image') {
          const attrs = sel.node.attrs as any;
          const src = String(attrs?.src ?? '');
          onSelect({ pos: sel.from, width: widthOf(src), alt: attrs?.alt ?? '' });
        } else {
          onSelect(null);
        }
      },
    }),
    props: {
      nodeViews: {
        image: (node: any) => new ImageView(node),
      },
      // Inline images don't node-select on a normal click (the browser drops a
      // caret on mousedown). Intercept it so the node selects cleanly.
      handleDOMEvents: {
        mousedown: (view: any, event: any) => {
          const t = event.target as HTMLElement;
          if (!t || t.nodeName !== 'IMG' || !t.closest?.('.img-node')) return false;
          const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (!at) return false;
          const pos = at.inside >= 0 ? at.inside : at.pos;
          const node = view.state.doc.nodeAt(pos);
          if (node?.type?.name === 'image') {
            event.preventDefault();
            view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)));
            return true;
          }
          return false;
        },
      },
    },
  }));
}
