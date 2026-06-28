import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { renderMarkdown } from '../../../shared/markdown.util';
import Editor from '@toast-ui/editor';
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
  uploadingCover = false;
  error = '';

  showPreview = false;
  previewHtml: SafeHtml = '';

  private editor: Editor | null = null;
  private pendingMarkdown: string | null = null;

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

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
        },
        error: () => {
          this.error = 'Could not load the post.';
        }
      });
    }
  }

  ngAfterViewInit(): void {
    // Extra toolbar button that opens the media library picker. Toast-UI lets
    // you pass a plain DOM element with click handlers — no need to register a
    // custom command.
    const mediaButton = document.createElement('button');
    mediaButton.type = 'button';
    mediaButton.className = 'toastui-editor-toolbar-icons';
    mediaButton.style.backgroundImage = 'none';
    mediaButton.style.font = '600 13px/1 sans-serif';
    mediaButton.textContent = 'Media';
    mediaButton.title = 'Insert from media library';
    mediaButton.addEventListener('click', () => this.mediaPicker.show());

    this.editor = new Editor({
      el: this.editorEl.nativeElement,
      height: '500px',
      initialEditType: 'wysiwyg',
      previewStyle: 'vertical',
      initialValue: this.content || '',
      toolbarItems: [
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task', 'indent', 'outdent'],
        ['table', 'image', 'link'],
        ['code', 'codeblock'],
        [{ el: mediaButton, name: 'media', tooltip: 'Insert from media library' }]
      ],
      hooks: {
        addImageBlobHook: (blob: Blob | File, callback: (url: string, altText: string) => void) => {
          this.blogService.uploadImage(blob).subscribe({
            next: (r: any) => callback(r.url, 'image'),
            error: () => {
              this.error = 'Image upload failed.';
            }
          });
          return false;
        }
      }
    });

    // If the post loaded before the editor was ready, apply now.
    if (this.pendingMarkdown !== null) {
      this.editor.setMarkdown(this.pendingMarkdown);
      this.pendingMarkdown = null;
    }
  }

  onMediaPicked(payload: { url: string; width: string }): void {
    if (!this.editor) return;
    const { url, width } = payload;
    const alt = url.split('/').pop() || 'image';
    // Always insert a real markdown image so it renders in the editor. Width is
    // carried in the URL fragment (#w=) and applied by the public/preview
    // renderer (see shared/markdown.util.ts).
    const src = width ? `${url}#w=${width}` : url;
    this.editor.exec('addImage', { imageUrl: src, altText: alt });
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }

  private applyMarkdown(markdown: string): void {
    if (this.editor) {
      this.editor.setMarkdown(markdown || '');
    } else {
      this.pendingMarkdown = markdown || '';
    }
  }

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) {
      return;
    }
    this.uploadingCover = true;
    this.error = '';
    this.blogService.uploadImage(file).subscribe({
      next: (r: any) => {
        this.coverImage = r.url;
        this.uploadingCover = false;
        input.value = '';
      },
      error: () => {
        this.uploadingCover = false;
        this.error = 'Cover image upload failed.';
      }
    });
  }

  save(): void {
    const content = this.editor ? this.editor.getMarkdown() : this.content;
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
    const content = this.editor ? this.editor.getMarkdown() : this.content;
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(renderMarkdown(content));
    this.showPreview = true;
  }

  closePreview(): void {
    this.showPreview = false;
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
