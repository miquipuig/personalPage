import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { BlogService } from '../../../services/blog.service';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  mtime: number;
}

@Component({
  selector: 'app-media-picker',
  templateUrl: './media-picker.component.html',
  styleUrls: ['./media-picker.component.css']
})
export class MediaPickerComponent {
  // Parent listens for the URL the user picked, then closes the picker.
  @Output() pick = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  open = false;
  loading = false;
  uploading = false;
  files: MediaFile[] = [];
  error = '';

  constructor(private blogService: BlogService) {}

  show(): void {
    this.open = true;
    this.error = '';
    this.load();
  }

  hide(): void {
    this.open = false;
    this.closed.emit();
  }

  load(): void {
    this.loading = true;
    this.blogService.listUploads().subscribe({
      next: (r: any) => {
        this.files = r?.files ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load media library.';
        this.loading = false;
      }
    });
  }

  onPick(file: MediaFile): void {
    this.pick.emit(file.url);
    this.hide();
  }

  triggerUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.uploading = true;
    this.error = '';
    this.blogService.uploadImage(file).subscribe({
      next: () => {
        this.uploading = false;
        input.value = '';
        this.load();
      },
      error: () => {
        this.uploading = false;
        this.error = 'Upload failed.';
      }
    });
  }

  // Two-step delete: a first call returns 409 + refs if the file is used in
  // any post; we surface the titles and ask the admin to confirm with force.
  remove(file: MediaFile): void {
    this.error = '';
    this.blogService.deleteUpload(file.name).subscribe({
      next: () => this.load(),
      error: (err: any) => {
        if (err?.status === 409) {
          const refs = err?.error?.refs ?? [];
          const titles = refs.map((r: any) => `• ${r.title}${r.published ? '' : ' (draft)'}`).join('\n');
          const msg = `"${file.name}" is used in ${refs.length} post(s):\n\n${titles}\n\nDelete anyway?`;
          if (confirm(msg)) {
            this.blogService.deleteUpload(file.name, true).subscribe({
              next: () => this.load(),
              error: () => { this.error = 'Could not delete file.'; }
            });
          }
        } else {
          this.error = 'Could not delete file.';
        }
      }
    });
  }

  copyUrl(file: MediaFile): void {
    navigator.clipboard?.writeText(file.url).catch(() => {});
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
