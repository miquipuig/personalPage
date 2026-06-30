import { AfterViewInit, Component, ElementRef, HostListener, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { renderMarkdown, estimateReadingMinutes } from '../../../shared/markdown.util';
import { toJpeg } from '../../../shared/image.util';
import { Editor, rootCtx, defaultValueCtx, editorViewCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { upload, uploadConfig, Uploader } from '@milkdown/plugin-upload';
import { replaceAll, insert, getMarkdown, callCommand } from '@milkdown/utils';
import {
  createCodeBlockCommand,
  toggleStrongCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand,
  wrapInHeadingCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  wrapInBlockquoteCommand,
  insertHrCommand,
  insertHardbreakCommand,
  turnIntoTextCommand,
} from '@milkdown/preset-commonmark';
import {
  toggleStrikethroughCommand,
  insertTableCommand,
  addRowBeforeCommand,
  addRowAfterCommand,
  addColBeforeCommand,
  addColAfterCommand,
} from '@milkdown/preset-gfm';
import { deleteRow, deleteColumn, deleteTable } from 'prosemirror-tables';
import { NodeSelection } from '@milkdown/prose/state';
import { nord } from '@milkdown/theme-nord';
import { imageWidth, SelectedImage } from './image-width.plugin';
import { codeBlock, trailingParagraph } from './code-block.plugin';
import { contextTools } from './table.plugin';
import { BlogService } from '../../../services/blog.service';
import { MediaPickerComponent } from '../media-picker/media-picker.component';

@Component({
  selector: 'app-admin-editor',
  templateUrl: './admin-editor.component.html',
  styleUrls: ['./admin-editor.component.css']
})
export class AdminEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorEl') editorEl!: ElementRef<HTMLDivElement>;
  @ViewChild('mediaPicker') mediaPicker!: MediaPickerComponent;
  @ViewChild('linkInput') linkInput?: ElementRef<HTMLInputElement>;

  id: string | null = null;
  title = '';
  excerpt = '';
  coverImage = '';
  published = false;
  publishDate = ''; // `YYYY-MM-DD` for the date input; '' means auto/none
  tags = ''; // comma-separated in the input; sent as-is (server normalizes)
  content = '';

  saving = false;
  error = '';

  showPreview = false;
  previewHtml: SafeHtml = '';
  previewReadingMinutes = 0;
  previewDate: Date = new Date();
  previewRelated: any[] = [];

  // Currently selected image (drives the controls panel below the editor).
  selImg: SelectedImage | null = null;
  inTable = false;
  hasTextSel = false;

  // Floating toolbar on the selected element (image / table / text)
  floatTop = 0;
  floatLeft = 0;

  // Link editor popover
  showLinkMenu = false;
  linkUrl = '';
  linkTop = 0;
  linkLeft = 0;
  get floatKind(): 'image' | 'table' | 'text' | null {
    if (this.selImg) return 'image';
    if (this.inTable) return 'table';
    if (this.hasTextSel) return 'text';
    return null;
  }

  // Excel-style table size picker
  showTableGrid = false;
  gridArr = [1, 2, 3, 4, 5, 6, 7, 8];
  hoverR = 1;
  hoverC = 1;
  // Widths are a percentage of the text column; capped at 100% so an image
  // never overflows the column (in the editor or the published page).
  imgSizes = [
    { label: '25%', value: '25%' },
    { label: '50%', value: '50%' },
    { label: '75%', value: '75%' },
    { label: '100%', value: '100%' },
  ];

  private editor: Editor | null = null;
  private pendingMarkdown: string | null = null;
  private isBrowser: boolean;

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.blogService.getAdminPost(this.id).subscribe({
        next: (res: any) => {
          const post = res?.post ?? res;
          this.title = post.title ?? '';
          this.excerpt = post.excerpt ?? '';
          this.coverImage = post.coverImage ?? '';
          this.published = !!post.published;
          this.publishDate = this.toDateInput(post.publishedAt);
          this.tags = Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags ?? '');
          this.content = post.content ?? '';
          this.applyMarkdown(this.content);
          if (this.route.snapshot.queryParamMap.get('preview') === '1') {
            this.openPreview();
          }
        },
        error: () => {
          this.error = 'Could not load the post.';
        }
      });
    }
  }

  async ngAfterViewInit(): Promise<void> {
    // Milkdown touches the DOM; only create it in the browser (SSR-safe).
    if (!this.isBrowser) {
      return;
    }

    const uploader: Uploader = async (files, schema) => {
      const nodes: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file || !file.type.includes('image')) continue;
        const url = await this.uploadFile(file);
        if (!url) continue;
        const node = schema.nodes['image'].createAndFill({ src: url, alt: file.name });
        if (node) nodes.push(node);
      }
      return nodes;
    };

    this.editor = await Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, this.editorEl.nativeElement);
        ctx.set(defaultValueCtx, this.content || '');
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          this.content = markdown;
        });
        ctx.update(uploadConfig.key, (prev) => ({ ...prev, uploader }));
      })
      .config(nord)
      .use(commonmark)
      .use(gfm)
      .use(listener)
      .use(upload)
      .use(imageWidth((img) => this.zone.run(() => { this.selImg = img; this.afterSel(); })))
      .use(codeBlock)
      .use(trailingParagraph)
      .use(contextTools((s) => this.zone.run(() => { this.inTable = s.inTable; this.hasTextSel = s.hasText; this.afterSel(); })))
      .create();

    // If the post loaded before the editor was ready, apply now.
    if (this.pendingMarkdown !== null) {
      this.editor.action(replaceAll(this.pendingMarkdown));
      this.pendingMarkdown = null;
    }
  }

  private async uploadFile(file: Blob | File): Promise<string | null> {
    try {
      const jpeg = await toJpeg(file);
      const r: any = await new Promise((resolve, reject) =>
        this.blogService.uploadImage(jpeg, undefined, 'image.jpg').subscribe({ next: resolve, error: reject }));
      return r?.url ?? null;
    } catch {
      this.error = 'Image upload failed.';
      return null;
    }
  }

  onInsertImage(payload: { url: string; width: string; alt: string }): void {
    if (!this.editor) return;
    const { url, width, alt } = payload;
    const src = width ? `${url}#w=${width}` : url;
    const label = alt || (url.split('/').pop() || 'image');
    this.editor.action(insert(`![${label}](${src})`));
  }

  onSelectCover(payload: { url: string }): void {
    this.coverImage = payload.url;
  }

  private run(key: any, payload?: any): void {
    this.editor?.action(callCommand(key, payload));
  }

  insertCode(): void { this.run(createCodeBlockCommand.key); }

  // --- formatting toolbar ---
  toggleBold(): void { this.run(toggleStrongCommand.key); }
  toggleItalic(): void { this.run(toggleEmphasisCommand.key); }
  toggleStrike(): void { this.run(toggleStrikethroughCommand.key); }
  toggleInlineCode(): void { this.run(toggleInlineCodeCommand.key); }
  heading(level: number): void { this.run(wrapInHeadingCommand.key, level); }
  paragraph(): void { this.run(turnIntoTextCommand.key); }
  bulletList(): void { this.run(wrapInBulletListCommand.key); }
  orderedList(): void { this.run(wrapInOrderedListCommand.key); }
  quote(): void { this.run(wrapInBlockquoteCommand.key); }
  horizontalRule(): void { this.run(insertHrCommand.key); }
  lineBreak(): void { this.run(insertHardbreakCommand.key); }

  toggleTableGrid(): void {
    this.showTableGrid = !this.showTableGrid;
    this.hoverR = 1;
    this.hoverC = 1;
  }

  pickTable(row: number, col: number): void {
    this.run(insertTableCommand.key, { row, col });
    this.showTableGrid = false;
  }

  // Table editing (shown when the cursor is inside a table)
  addRowAbove(): void { this.run(addRowBeforeCommand.key); }
  addRowBelow(): void { this.run(addRowAfterCommand.key); }
  addColLeft(): void { this.run(addColBeforeCommand.key); }
  addColRight(): void { this.run(addColAfterCommand.key); }
  private tableCmd(cmd: (state: any, dispatch: any) => boolean): void {
    this.editor?.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      cmd(view.state, view.dispatch);
      view.focus();
    });
  }
  deleteRow(): void { this.tableCmd(deleteRow); }
  deleteColumn(): void { this.tableCmd(deleteColumn); }
  deleteTable(): void { this.tableCmd(deleteTable); }

  // --- floating toolbar positioning ---
  private afterSel(): void {
    setTimeout(() => this.positionFloat(), 0);
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowChange(): void {
    if (this.floatKind) this.positionFloat();
  }

  private positionFloat(): void {
    const kind = this.floatKind;
    if (!kind || !this.isBrowser) return;
    let rect: DOMRect | null = null;
    if (kind === 'text') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const r = sel.getRangeAt(0).getBoundingClientRect();
        if (r.width || r.height) rect = r;
      }
    } else {
      this.editor?.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        let dom: any = null;
        if (kind === 'image' && this.selImg) {
          dom = view.nodeDOM(this.selImg.pos);
        } else if (kind === 'table') {
          const $from = view.state.selection.$from;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d)?.type?.name === 'table') { dom = view.nodeDOM($from.before(d)); break; }
          }
        }
        const el = dom && dom.nodeType === 1 ? dom : dom?.parentElement;
        if (el?.getBoundingClientRect) rect = el.getBoundingClientRect();
      });
    }
    if (!rect) return;
    const H = 46;
    let top = rect.top - H - 8;
    if (top < 84) top = rect.bottom + 8;
    this.floatTop = Math.round(top);
    this.floatLeft = Math.round(Math.min(Math.max(8, rect.left), window.innerWidth - 380));
  }

  // --- link editor popover ---
  private looksLikeUrl(s: string): boolean {
    return /^(https?:\/\/|mailto:|www\.)\S+$/i.test(s) || /^[^\s.]+\.[^\s.]{2,}(\/\S*)?$/i.test(s);
  }

  private normalizeUrl(s: string): string {
    s = s.trim();
    if (!s) return '';
    if (/^(https?:\/\/|mailto:|#|\/)/i.test(s)) return s;
    return 'https://' + s.replace(/^\/+/, '');
  }

  private linkPrefill(): string {
    let prefill = '';
    this.editor?.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const { state } = view;
      const { from, to } = state.selection;
      const linkType = state.schema.marks['link'];
      if (linkType) {
        let href = '';
        state.doc.nodesBetween(from, to, (node: any) => {
          const m = node.marks?.find((mk: any) => mk.type === linkType);
          if (m) href = m.attrs?.['href'] || href;
        });
        if (href) { prefill = href; return; }
      }
      const text = state.doc.textBetween(from, to, ' ').trim();
      if (this.looksLikeUrl(text)) prefill = text;
    });
    return prefill;
  }

  openLinkMenu(ev?: MouseEvent): void {
    this.linkUrl = this.linkPrefill();
    if (this.hasTextSel) {
      this.positionFloat();
      this.linkTop = this.floatTop;
      this.linkLeft = this.floatLeft;
    } else if (ev) {
      const r = (ev.currentTarget as HTMLElement).getBoundingClientRect();
      this.linkTop = Math.round(r.bottom + 6);
      this.linkLeft = Math.round(r.left);
    }
    this.showLinkMenu = true;
    setTimeout(() => this.linkInput?.nativeElement.focus(), 0);
  }

  cancelLinkMenu(): void {
    this.showLinkMenu = false;
  }

  applyLink(): void {
    const url = this.normalizeUrl(this.linkUrl);
    if (url) {
      this.editor?.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const { state } = view;
        const linkType = state.schema.marks['link'];
        const { from, to } = state.selection;
        if (linkType && from !== to) {
          const tr = state.tr.removeMark(from, to, linkType).addMark(from, to, linkType.create({ href: url }));
          view.dispatch(tr);
        }
      });
    }
    this.showLinkMenu = false;
  }

  removeLink(): void {
    this.editor?.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const { state } = view;
      const linkType = state.schema.marks['link'];
      const { from, to } = state.selection;
      if (linkType) view.dispatch(state.tr.removeMark(from, to, linkType));
    });
    this.showLinkMenu = false;
  }

  // --- Selected-image controls (panel below the editor) ---
  private editImage(mutate: (attrs: any) => any | null): void {
    if (!this.editor || !this.selImg) return;
    const pos = this.selImg.pos;
    this.editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const node = view.state.doc.nodeAt(pos);
      if (!node || node.type.name !== 'image') return;
      const next = mutate({ ...node.attrs });
      let tr = view.state.tr;
      if (next === null) {
        tr = tr.delete(pos, pos + node.nodeSize);
      } else {
        tr = tr.setNodeMarkup(pos, undefined, next).setSelection(NodeSelection.create(tr.doc, pos));
      }
      view.dispatch(tr);
      view.focus();
    });
  }

  setImgSize(width: string): void {
    this.editImage((attrs) => {
      const base = String(attrs.src ?? '').replace(/#w=[\d.]+(?:vw|px|%)?$/, '');
      attrs.src = width ? `${base}#w=${width}` : base;
      return attrs;
    });
  }

  setImgAlt(value: string): void {
    this.editImage((attrs) => {
      attrs.alt = value;
      return attrs;
    });
  }

  removeImg(): void {
    this.editImage(() => null);
    this.selImg = null;
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }

  private applyMarkdown(markdown: string): void {
    if (this.editor) {
      this.editor.action(replaceAll(markdown || ''));
    } else {
      this.pendingMarkdown = markdown || '';
    }
  }

  private currentMarkdown(): string {
    return this.editor ? this.editor.action(getMarkdown()) : this.content;
  }

  private toDateInput(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  }

  save(): void {
    const content = this.currentMarkdown();
    if (!this.title.trim() || !content.trim()) {
      this.error = 'Title and content are required.';
      return;
    }

    this.error = '';
    this.saving = true;
    const body = {
      title: this.title,
      excerpt: this.excerpt,
      coverImage: this.coverImage,
      published: this.published,
      publishedAt: this.publishDate || '',
      tags: this.tags,
      content
    };

    const request$ = this.id
      ? this.blogService.updatePost(this.id, body)
      : this.blogService.createPost(body);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.saving = false;
        this.error = 'Could not save the post.';
      }
    });
  }

  openPreview(): void {
    const md = this.currentMarkdown();
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(renderMarkdown(md));
    this.previewReadingMinutes = estimateReadingMinutes(md);
    // Use the chosen publish date, or today as the published page would.
    this.previewDate = this.publishDate ? new Date(this.publishDate) : new Date();
    // Mirror the published page's "related" sidebar with other posts.
    this.blogService.listPosts().subscribe({
      next: (res: any) => {
        const all: any[] = res?.posts ?? [];
        this.previewRelated = all.filter((p) => String(p.id) !== String(this.id)).slice(0, 5);
      },
      error: () => { this.previewRelated = []; },
    });
    this.showPreview = true;
  }

  closePreview(): void {
    this.showPreview = false;
  }

  get previewTags(): string[] {
    return this.tags.split(',').map((t) => t.trim()).filter(Boolean);
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
