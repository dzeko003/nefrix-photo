import Image from "next/image";
import { PHOTOS } from "@/lib/photos";

type Props = {
  name: keyof typeof PHOTOS | string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  preload?: boolean;
  loading?: "eager" | "lazy";
};

export default function Photo({
  name,
  alt,
  className,
  fill,
  sizes = "100vw",
  preload,
  loading,
}: Props) {
  const meta = PHOTOS[name as string];
  const src = `/photos/${name}.jpg`;

  const common = {
    src,
    sizes,
    placeholder: meta ? ("blur" as const) : undefined,
    blurDataURL: meta?.blur,
    className,
    ...(loading ? { loading } : { preload }),
  };

  if (fill) return <Image {...common} alt={alt} fill />;

  return (
    <Image
      {...common}
      alt={alt}
      width={meta?.w ?? 1200}
      height={meta?.h ?? 800}
    />
  );
}
