export type CompressedImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image."));
    };

    image.src = objectUrl;
  });
}

function getTargetDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export function useImageCompression() {
  async function compressImage(
    file: File,
    options: CompressedImageOptions = {},
  ): Promise<File> {
    const maxWidth = options.maxWidth ?? 1600;
    const maxHeight = options.maxHeight ?? 1600;
    const quality = options.quality ?? 0.82;

    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files can be compressed.");
    }

    const image = await loadImage(file);
    const { width, height } = getTargetDimensions(
      image.width,
      image.height,
      maxWidth,
      maxHeight,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Image compression is not supported in this browser.");
    }

    context.drawImage(image, 0, 0, width, height);

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, quality);
    });

    if (!blob) {
      throw new Error("Failed to compress image.");
    }

    return new File([blob], file.name, {
      type: outputType,
      lastModified: Date.now(),
    });
  }

  return {
    compressImage,
  };
}
