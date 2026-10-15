import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderType = (formData.get("folder") as string) || "chat";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    // Supported MIME types: images & common project documents
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan gambar (JPG, PNG, WebP) atau dokumen (PDF, ZIP, DOCX)." },
        { status: 400 }
      );
    }

    // Max 25MB
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 25 MB." },
        { status: 400 }
      );
    }

    const originalName = file.name || "upload";
    const extension = path.extname(originalName).replace(".", "") || (file.type.startsWith("image/") ? "png" : "bin");
    const sanitizedExt = extension.toLowerCase();
    const uniqueFileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${sanitizedExt}`;

    // Target directory: persistent shared/uploads or public/uploads/<folderType>/
    const sanitizedFolder = ["avatars", "projects", "services", "chat"].includes(folderType) ? folderType : "chat";
    const sharedUploadsDir = "/var/www/creatorin/shared/uploads";
    const uploadBaseDir = fs.existsSync(sharedUploadsDir)
      ? sharedUploadsDir
      : path.join(process.cwd(), "public", "uploads");
    const uploadDir = path.join(uploadBaseDir, sanitizedFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${sanitizedFolder}/${uniqueFileName}`;
    const isImage = file.type.startsWith("image/");

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      fileSize: file.size,
      fileType: isImage ? "image" : "document",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}
