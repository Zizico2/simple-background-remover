"use client";

import { Button } from "@cloudflare/kumo/components/button";
import { Meter } from "@cloudflare/kumo/components/meter";
import { cva } from "class-variance-authority";
import Image from "next/image";
import { useState } from "react";
import { downloadImage } from "../utils/downloadImage";
import ImageUpload from "./ImageUpload";

interface ImageData {
  src: string;
  file: File;
  width: number;
  height: number;
}

const toolbarStyles = cva(["flex items-center flex-wrap gap-2 mb-4"]);
const infoTextStyles = cva(["text-[0.85rem] text-(--foreground-muted)"]);
const buttonGroupStyles = cva(["flex gap-2 ml-auto"]);
const imageStyles = cva(["block max-w-full h-auto"]);
const previewContainerStyles = cva([
  "relative rounded-lg overflow-hidden",
  "bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)]",
  "bg-size-[20px_20px]",
]);

export default function BackgroundRemoverApp() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    key: string;
    current: number;
    total: number;
  } | null>(null);

  const handleImageSelected = (url: string, file: File) => {
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setProgress(null);

    const img = new window.Image();
    img.onload = () => {
      setImageData({
        src: url,
        file,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = url;
  };

  const onRemoveBackground = async () => {
    if (!imageData) return;

    setIsProcessing(true);
    setProgress(null);
    try {
      const { removeBackground } = await import("@imgly/background-removal");

      const blob = await removeBackground(imageData.src, {
        model: "isnet",
        device: "gpu",
        progress: (key, current, total) => {
          setProgress({ key, current, total });
        },
      });

      setResultBlob(blob);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to remove background");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const onDownload = () => {
    if (!resultBlob || !imageData) return;
    downloadImage({ blob: resultBlob, fileName: imageData.file.name });
  };

  const handleReset = () => {
    if (imageData) URL.revokeObjectURL(imageData.src);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImageData(null);
    setResultBlob(null);
    setResultUrl(null);
    setProgress(null);
  };

  const progressPercent =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <>
      <div className={toolbarStyles()}>
        <p className={infoTextStyles()}>
          {imageData
            ? resultUrl
              ? "Background removed — download your image"
              : "Click \u201CRemove Background\u201D to start"
            : "No image selected"}
        </p>

        <div className={buttonGroupStyles()}>
          {!resultUrl && (
            <Button
              onClick={onRemoveBackground}
              disabled={isProcessing || !imageData}
              type="button"
              variant="secondary"
              loading={isProcessing}
            >
              Remove Background
            </Button>
          )}

          {resultUrl && (
            <Button onClick={onDownload} type="button" variant="secondary">
              Download
            </Button>
          )}

          <Button
            onClick={handleReset}
            disabled={!imageData || isProcessing}
            type="button"
            variant="secondary-destructive"
          >
            Reset
          </Button>
        </div>
      </div>

      {isProcessing && progress && (
        <div className="mb-4">
          <Meter
            label={
              progress.key.includes("fetch")
                ? "Fetching model…"
                : "Removing background…"
            }
            value={progressPercent}
          />
        </div>
      )}

      {!imageData ? (
        <ImageUpload onImageSelected={handleImageSelected} />
      ) : resultUrl ? (
        <div className={previewContainerStyles()}>
          <Image
            src={resultUrl}
            alt="Background removed"
            width={imageData.width}
            height={imageData.height}
            className={imageStyles()}
            unoptimized
          />
        </div>
      ) : (
        <Image
          src={imageData.src}
          alt="Original image"
          width={imageData.width}
          height={imageData.height}
          className={imageStyles()}
          unoptimized
        />
      )}
    </>
  );
}
