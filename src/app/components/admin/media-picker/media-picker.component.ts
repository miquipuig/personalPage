import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { BlogService } from '../../../services/blog.service';

interface MediaFile {
  id: number;
  name: string;
  url: string;
  description: string;
  originalName: string;
  size: number;
  mimetype: string;
  mtime: number;
}

type PickerMode = 'insert' | 'cover';

@Component({
  selector: 'app-media-picker',
  templateUrl: './media-picker.component.html',
  styleUrls: ['./media-picker.component.css']
})
export class MediaPickerComponent {
  // Insert into the post body (with chosen width + alt) or select a cover.
  @Output() insert = new EventEmitter<{ url: string; width: string; alt: string }>();
  @Output() cover = new EventEmitter<{ url: string }>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  open = false;
  loading = false;
  uploading = false;
  mode: PickerMode = 'insert';
  files: MediaFile[] = [];
  error = '';

  search = '';
  sortBy: 'new' | 'name' | 'size' = 'new';

  sizes = [
    { label: 'Original', value: '' },
    { label: 'Small', value: '25%' },
    { label: 'Medium', value: '50%' },
    { label: 'Large', value: '100%' },
  ];
  selectedWidth = '';

  editingName: string | null = null;
  editingDesc = '';

  // Crop + convert step before uploading
  cropFile: File | null = null;
  croppedBlob: Blob | null = null;
  forcePng = false;
  quality = 82;

  constructor(private blogService: BlogService) {}

  show(mode: PickerMode = 'insert'): void {
    this.mode = mode;
    this.open = true;
    this.error = '';
    this.search = '';
    this.editingName = null;
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
        this.error = 'Could not load the media library.';
        this.loading = false;
      }
    });
  }

  get visibleFiles(): MediaFile[] {
    const q = this.search.trim().toLowerCase();
    let list = this.files;
    if (q) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.description || '').toLowerCase().includes(q) ||
          (f.originalName || '').toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (this.sortBy === 'name') {
      sorted.sort((a, b) => (a.originalName || a.name).localeCompare(b.originalName || b.name));
    } else if (this.sortBy === 'size') {
      sorted.sort((a, b) => b.size - a.size);
    } else {
      sorted.sort((a, b) => b.mtime - a.mtime);
    }
    return sorted;
  }

  pick(file: MediaFile): void {
    if (this.mode === 'cover') {
      this.cover.emit({ url: file.url });
    } else {
      const alt = file.description?.trim() || file.originalName || file.name;
      this.insert.emit({ url: file.url, width: this.selectedWidth, alt });
    }
    this.hide();
  }

  triggerUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    // Open the crop/convert step instead of uploading directly.
    this.error = '';
    this.croppedBlob = null;
    this.cropFile = file;
    input.value = '';
  }

  onCropped(e: ImageCroppedEvent): void {
    this.croppedBlob = e.blob ?? null;
  }

  cancelCrop(): void {
    this.cropFile = null;
    this.croppedBlob = null;
  }

  confirmUpload(): void {
    if (!this.croppedBlob) return;
    this.uploading = true;
    this.error = '';
    const ext = this.forcePng ? 'png' : 'jpg';
    this.blogService.uploadImage(this.croppedBlob, undefined, `image.${ext}`).subscribe({
      next: () => {
        this.uploading = false;
        this.cropFile = null;
        this.croppedBlob = null;
        this.load();
      },
      error: () => {
        this.uploading = false;
        this.error = 'Upload failed.';
      }
    });
  }

  startEdit(file: MediaFile): void {
    this.editingName = file.name;
    this.editingDesc = file.description || '';
  }

  cancelEdit(): void {
    this.editingName = null;
    this.editingDesc = '';
  }

  saveEdit(file: MediaFile): void {
    const desc = this.editingDesc;
    this.blogService.updateUpload(file.name, desc).subscribe({
      next: () => {
        file.description = desc;
        this.editingName = null;
      },
      error: () => {
        this.error = 'Could not save the description.';
      }
    });
  }

  // Two-step delete: a first call returns 409 + refs if the file is used in any
  // post; surface the titles and ask for confirmation before forcing.
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
              error: () => { this.error = 'Could not delete the file.'; }
            });
          }
        } else {
          this.error = 'Could not delete the file.';
        }
      }
    });
  }

  copyUrl(file: MediaFile): void {
    navigator.clipboard?.writeText(file.url).catch(() => {});
  }

  formatSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatDate(mtime: number): string {
    try {
      return new Date(mtime).toLocaleDateString();
    } catch {
      return '';
    }
  }
}
