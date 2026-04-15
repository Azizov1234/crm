"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud, Video } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { uploadsApi } from "@/lib/api/services";
import { Button } from "@/components/ui/button";

type UploadKind = "image" | "video";

type AvatarUploadFieldProps = {
  value?: string;
  onChange: (url?: string) => void;
  kind?: UploadKind;
  title?: string;
  hint?: string;
};

const ACCEPT_BY_KIND: Record<UploadKind, string> = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/mkv,video/webm,video/avi,video/quicktime",
};

const MAX_SIZE_BY_KIND: Record<UploadKind, number> = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
};

function bytesToMb(size: number): string {
  return `${Math.round((size / 1024 / 1024) * 10) / 10}MB`;
}

export function AvatarUploadField({
  value,
  onChange,
  kind = "image",
  title = "Avatar yuklash",
  hint,
}: AvatarUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = MAX_SIZE_BY_KIND[kind];
    if (file.size > maxSize) {
      toast.error(`Fayl juda katta. Maksimal: ${bytesToMb(maxSize)}`);
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      const result =
        kind === "video"
          ? await uploadsApi.uploadVideo(file)
          : await uploadsApi.uploadImage(file);

      onChange(result.url);
      toast.success(kind === "video" ? "Video yuklandi" : "Rasm yuklandi");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Upload xatosi");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#d7dff2] bg-[#f8faff] p-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_BY_KIND[kind]}
        className="hidden"
        onChange={onPickFile}
      />
      {value ? (
        <div className="space-y-3">
          {kind === "video" ? (
            <video
              src={value}
              controls
              className="h-44 w-full rounded-xl border border-[#dce4f5] bg-black/80 object-contain"
            />
          ) : (
            <img
              src={value}
              alt="Avatar preview"
              className="h-44 w-full rounded-xl border border-[#dce4f5] bg-white object-cover"
            />
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-[#d7dff2]"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : kind === "video" ? (
                <Video className="mr-1 h-4 w-4" />
              ) : (
                <UploadCloud className="mr-1 h-4 w-4" />
              )}
              Qayta yuklash
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-lg text-[#c7475c] hover:bg-[#fff0f3]"
              disabled={uploading}
              onClick={() => onChange(undefined)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Olib tashlash
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          {kind === "video" ? (
            <Video className="mx-auto h-6 w-6 text-[#8e9ac3]" />
          ) : (
            <ImagePlus className="mx-auto h-6 w-6 text-[#8e9ac3]" />
          )}
          <p className="mt-2 text-sm font-medium text-[#4d5a84]">{title}</p>
          <p className="text-xs text-[#8d98b7]">
            {hint ??
              (kind === "video"
                ? "Cloudinary orqali video yuklanadi"
                : "Cloudinary orqali rasm yuklanadi")}
          </p>
          <Button
            type="button"
            className="mt-3 h-9 rounded-lg bg-[#4a57d7] px-4 text-sm hover:bg-[#3f4cc8]"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : kind === "video" ? (
              <Video className="mr-1 h-4 w-4" />
            ) : (
              <UploadCloud className="mr-1 h-4 w-4" />
            )}
            {uploading ? "Yuklanmoqda..." : "Fayl tanlash"}
          </Button>
        </div>
      )}
    </div>
  );
}
