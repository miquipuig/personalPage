import { $prose } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose/state';

// Code-block node view with a language field. The language is stored on the
// node's `language` attr and serialized to the fenced block (```lang), so the
// public renderer (highlight.js) highlights it correctly.

const LANGS = [
  'js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'scss', 'bash', 'shell',
  'python', 'java', 'go', 'rust', 'c', 'cpp', 'csharp', 'php', 'ruby', 'sql',
  'yaml', 'xml', 'markdown', 'kotlin', 'swift', 'dockerfile', 'plaintext',
];

const DATALIST_ID = 'milkdown-code-langs';

function ensureDatalist(): void {
  if (typeof document === 'undefined' || document.getElementById(DATALIST_ID)) return;
  const dl = document.createElement('datalist');
  dl.id = DATALIST_ID;
  LANGS.forEach((l) => {
    const o = document.createElement('option');
    o.value = l;
    dl.appendChild(o);
  });
  document.body.appendChild(dl);
}

class CodeBlockView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  private langInput: HTMLInputElement;

  constructor(private node: any, private view: any, private getPos: () => number | undefined) {
    ensureDatalist();
    this.dom = document.createElement('div');
    this.dom.className = 'cm-codeblock';

    const header = document.createElement('div');
    header.className = 'cm-codeblock-header';
    const label = document.createElement('span');
    label.className = 'cm-codeblock-label';
    label.textContent = 'Code';
    this.langInput = document.createElement('input');
    this.langInput.className = 'cm-codeblock-lang';
    this.langInput.setAttribute('list', DATALIST_ID);
    this.langInput.placeholder = 'language (e.g. js, python)';
    this.langInput.value = node.attrs?.language ?? '';
    this.langInput.addEventListener('input', () => this.setLang(this.langInput.value.trim()));
    header.appendChild(label);
    header.appendChild(this.langInput);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    pre.appendChild(code);
    this.contentDOM = code;

    this.dom.appendChild(header);
    this.dom.appendChild(pre);
  }

  private setLang(lang: string): void {
    const pos = this.getPos();
    if (pos == null) return;
    this.view.dispatch(this.view.state.tr.setNodeMarkup(pos, undefined, { ...this.node.attrs, language: lang }));
  }

  // Let the language input handle its own typing.
  stopEvent(e: Event): boolean {
    return e.target === this.langInput;
  }
  ignoreMutation(m: any): boolean {
    if (m.type === 'selection') return false;
    return !this.contentDOM.contains(m.target as Node);
  }
  update(node: any): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;
    const lang = node.attrs?.language ?? '';
    if (document.activeElement !== this.langInput && this.langInput.value !== lang) {
      this.langInput.value = lang;
    }
    return true;
  }
}

export const codeBlock = $prose(() => new Plugin({
  props: {
    nodeViews: {
      code_block: (node: any, view: any, getPos: any) => new CodeBlockView(node, view, getPos),
    },
  },
}));

// Always keep a trailing paragraph at the end of the document, so you're never
// trapped inside a code block (or any block) that ends the post — you can click
// below it and keep writing.
export const trailingParagraph = $prose(() => new Plugin({
  appendTransaction: (trs: readonly any[], _old: any, state: any) => {
    if (!trs.some((t) => t.docChanged)) return null;
    const para = state.schema.nodes['paragraph'];
    const last = state.doc.lastChild;
    if (para && (!last || last.type.name !== 'paragraph')) {
      return state.tr.insert(state.doc.content.size, para.create());
    }
    return null;
  },
}));
