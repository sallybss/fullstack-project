export type ImageDimensionRules = {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
};

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Failed to read image."));
      nextImage.src = objectUrl;
    });

    return {
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function validateImageDimensions(
  file: File,
  rules: ImageDimensionRules,
  label: string,
): Promise<void> {
  const { width, height } = await getImageDimensions(file);

  if (width < rules.minWidth || height < rules.minHeight) {
    throw new Error(
      `${label} must be at least ${rules.minWidth}x${rules.minHeight}px.`,
    );
  }

  if (width > rules.maxWidth || height > rules.maxHeight) {
    throw new Error(
      `${label} must be no larger than ${rules.maxWidth}x${rules.maxHeight}px.`,
    );
  }
}
