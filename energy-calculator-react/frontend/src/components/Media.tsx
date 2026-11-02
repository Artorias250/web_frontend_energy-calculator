import { useState } from "react";

export const DEFAULT_IMAGE = "/media/default.png";
export const DEFAULT_VIDEO = "/media/default.mp4";

interface ImageProps {
  src: string | null;
  alt: string;
  className?: string;
}
function ImageContent({ src, alt, className }: ImageProps) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      className={className}
      src={failed ? DEFAULT_IMAGE : src?.trim() || DEFAULT_IMAGE}
      alt={alt}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}
export function MediaImage(props: ImageProps) {
  // Новый источник создаёт новое состояние обработки ошибки без setState в эффекте.
  return <ImageContent key={props.src} {...props} />;
}

interface VideoProps {
  src: string | null;
  image: string | null;
  title: string;
  className?: string;
  controls?: boolean;
}
function VideoContent({
  src,
  image,
  title,
  className,
  controls = false,
}: VideoProps) {
  const [errorCount, setErrorCount] = useState(0);
  const primary = src?.trim() || DEFAULT_VIDEO;
  if (errorCount > 1 || (errorCount === 1 && primary === DEFAULT_VIDEO)) {
    return <MediaImage src={image} alt={title} className={className} />;
  }
  const resolved = errorCount ? DEFAULT_VIDEO : primary;
  return (
    <video
      key={resolved}
      className={className}
      src={resolved}
      poster={image?.trim() || DEFAULT_IMAGE}
      aria-label={title}
      autoPlay
      loop
      muted
      playsInline
      controls={controls}
      preload="metadata"
      onError={() => setErrorCount((count) => count + 1)}
    />
  );
}
export function MediaVideo(props: VideoProps) {
  return <VideoContent key={props.src} {...props} />;
}
