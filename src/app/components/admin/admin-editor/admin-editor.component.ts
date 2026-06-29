import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { renderMarkdown } from '../../../shared/markdown.util';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { upload, uploadConfig, Uploader } from '@milkdown/plugin-upload';
import { replaceAll, insert, getMarkdown } from '@milkdown/utils';
import { nord } from '@milkdown/theme-nord';
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

  id: string | null = null;
  title = '';
  excerpt = '';
  coverImage = '';
  published = false;
  content = '';

  saving = false;
  error = '';

  showPreview = false;
  previewHtml: SafeHtml = '';

  private editor: Editor | null = null;
  private pendingMarkdown: string | null = null;
  private isBrowser: boolean;

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
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
      .create();

    // If the post loaded before the editor was ready, apply now.
    if (this.pendingMarkdown !== null) {
      this.editor.action(replaceAll(this.pendingMarkdown));
      this.pendingMarkdown = null;
    }
  }

  private async uploadFile(file: Blob | File): Promise<string | null> {
    try {
      const r: any = await new Promise((resolve, reject) =>
        this.blogService.uploadImage(file).subscribe({ next: resolve, error: reject }));
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
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(renderMarkdown(this.currentMarkdown()));
    this.showPreview = true;
  }

  closePreview(): void {
    this.showPreview = false;
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
