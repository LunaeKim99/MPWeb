export class ObjectUrlRegistry {
  private readonly urls = new Map<string, string>();

  create(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    return url;
  }

  track(key: string, url: string): void {
    this.urls.set(key, url);
  }

  get(key: string): string | undefined {
    return this.urls.get(key);
  }

  revoke(key: string): void {
    const url = this.urls.get(key);
    if (url) {
      URL.revokeObjectURL(url);
      this.urls.delete(key);
    }
  }

  revokeAll(): void {
    for (const url of this.urls.values()) {
      URL.revokeObjectURL(url);
    }
    this.urls.clear();
  }
}

export function createTrackObjectUrl(file: Blob): string {
  return URL.createObjectURL(file);
}