import { $prose } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose/state';

// Images carry their width in the URL fragment (`#w=25%`). The browser ignores
// the fragment for sizing, so by default every image looks the same in the
// editor. This ProseMirror node view reads `#w=` and applies the width to the
// rendered <img>, so the chosen size is visible while editing (the stored
// markdown and the public renderer are unchanged).
export const imageWidth = $prose(() => new Plugin({
  props: {
    nodeViews: {
      image: (node: any) => {
        const img = document.createElement('img');
        const src = String(node.attrs?.src ?? '');
        const m = src.match(/#w=(\d+%?)$/);
        img.src = src;
        img.alt = node.attrs?.alt ?? '';
        if (node.attrs?.title) img.title = node.attrs.title;
        img.style.maxWidth = '100%';
        if (m) img.style.width = m[1];
        return { dom: img };
      },
    },
  },
}));
