"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { uploadsApi } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUp, ImageIcon, FileText, Video } from "lucide-react";

interface UploadResult {
  type: "image" | "video" | "document";
  url: string;
  publicId: string;
}

export default function UploadsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function upload(type: UploadResult["type"]) {
    if (!file) {
      toast.error("Avval fayl tanlang");
      return;
    }

    try {
      setUploading(true);
      const response =
        type === "image"
          ? await uploadsApi.uploadImage(file)
          : type === "video"
            ? await uploadsApi.uploadVideo(file)
            : await uploadsApi.uploadDocument(file);

      setResult({
        type,
        url: response.url,
        publicId: response.publicId,
      });
      toast.success("Fayl yuklandi");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Upload xatosi");
    } finally {
      setUploading(false);
    }
  }

  return (
    <DashboardLayout
      title="Fayl yuklash"
      description="uploads/image, uploads/video va uploads/document endpointlari"
    >
      <Card className="glass max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileUp className="h-4 w-4 text-primary" />
            Multipart file upload
          </CardTitle>
          <CardDescription>
            Backendda FileInterceptor, guard va swagger multipart schema bilan ishlaydi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="file"
            className="w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-card file:px-3 file:py-2"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />

          <div className="flex flex-wrap gap-2">
            <Button className="gap-2" disabled={uploading} onClick={() => upload("image")}>
              <ImageIcon className="h-4 w-4" />
              Image yuklash
            </Button>
            <Button
              className="gap-2"
              variant="outline"
              disabled={uploading}
              onClick={() => upload("video")}
            >
              <Video className="h-4 w-4" />
              Video yuklash
            </Button>
            <Button
              className="gap-2"
              variant="secondary"
              disabled={uploading}
              onClick={() => upload("document")}
            >
              <FileText className="h-4 w-4" />
              Document yuklash
            </Button>
          </div>

          {result && (
            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge>{result.type}</Badge>
                <span className="text-xs text-muted-foreground">{result.publicId}</span>
              </div>
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline underline-offset-4 break-all"
              >
                {result.url}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
