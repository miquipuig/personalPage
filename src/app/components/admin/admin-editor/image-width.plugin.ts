import { $prose } from '@milkdown/utils';
import { Plugin, NodeSelection, TextSelection } from '@milkdown/prose/state';

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
  const m = src.match(/#w=([\d.]+(?:vw|px|%)?)$/);
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
    // Width is a percentage of the column; max-width:100% keeps the image inside
    // the editing box no matter what. Centred within the column.
    const s = this.img.style;
    s.width = w || '';
    s.maxWidth = '100%';
    s.display = 'block';
    s.margin = '0 auto';
    this.dom.style.display = 'block';
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
      // caret on mousedown). Intercept it so the node selects cleanly — but only
      // when the pointer is over the image's painted box. ProseMirror otherwise
      // node-selects an inline atom when you click the empty line space beside
      // it; there we want a plain text caret instead.
      handleDOMEvents: {
        mousedown: (view: any, event: any) => {
          const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (!at) return false;
          const pos = at.inside >= 0 ? at.inside : at.pos;
          const node = view.state.doc.nodeAt(pos);
          if (node?.type?.name !== 'image') return false;

          const dom = view.nodeDOM(pos) as HTMLElement | null;
          const imgEl = (dom?.nodeName === 'IMG' ? dom : dom?.querySelector?.('img')) as HTMLElement | null;
          const r = imgEl?.getBoundingClientRect();
          const overImage = !!r &&
            event.clientX >= r.left && event.clientX <= r.right &&
            event.clientY >= r.top && event.clientY <= r.bottom;

          event.preventDefault();
          if (overImage) {
            view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)));
          } else {
            // Clicked beside the image — drop a caret next to it, don't select it.
            const sel = TextSelection.near(view.state.doc.resolve(at.pos));
            view.dispatch(view.state.tr.setSelection(sel));
          }
          // Keep the editor focused, otherwise the caret disappears and the
          // next click re-selects the image instead of placing the cursor.
          view.focus();
          return true;
        },
      },
    },
  }));
}
