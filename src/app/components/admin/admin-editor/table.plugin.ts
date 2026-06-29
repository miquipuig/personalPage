import { $prose } from '@milkdown/utils';
import { Plugin, TextSelection } from '@milkdown/prose/state';

// Reports the current selection context (in a table, and/or a non-empty text
// selection) so the host can show a floating toolbar on the element.
export interface SelCtx {
  inTable: boolean;
  hasText: boolean;
}

export function contextTools(onChange: (s: SelCtx) => void) {
  return $prose(() => new Plugin({
    view: () => ({
      update: (view: any) => {
        const sel = view.state.selection;
        const $from = sel.$from;
        let inTable = false;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d)?.type?.name === 'table') { inTable = true; break; }
        }
        const hasText = !sel.empty && sel instanceof TextSelection;
        onChange({ inTable, hasText });
      },
    }),
  }));
}
