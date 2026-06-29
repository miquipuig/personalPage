import { $prose } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose/state';

// Reports to the host whether the selection is currently inside a table, so the
// editor can show table controls (add/remove rows & columns, delete table).
export function tableTools(onChange: (inTable: boolean) => void) {
  return $prose(() => new Plugin({
    view: () => ({
      update: (view: any) => {
        const $from = view.state.selection.$from;
        let inTable = false;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d)?.type?.name === 'table') { inTable = true; break; }
        }
        onChange(inTable);
      },
    }),
  }));
}
