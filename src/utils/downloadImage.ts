interface DownloadOptions {
  blob: Blob;
  fileName: string;
}

export function downloadImage({ blob, fileName }: DownloadOptions): void {
  const lastDotIndex = fileName.lastIndexOf(".");
  const nameWithoutExt =
    lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${nameWithoutExt}-nobg.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
