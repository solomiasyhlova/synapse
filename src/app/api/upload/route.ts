import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { uploadFileToR2 } from "@/lib/r2";
import {
  getFileExtension,
  getMimeType,
  isUploadKind,
  validateUploadFile,
} from "@/lib/upload-constraints";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = formData.get("kind");

  if (!(file instanceof File) || !isUploadKind(kind)) {
    return NextResponse.json({ success: false, error: "Invalid upload" }, { status: 400 });
  }

  const validationError = validateUploadFile(kind, file.name, file.size);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  const extension = getFileExtension(file.name);
  const key = `${session.user.id}/${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const fileUrl = await uploadFileToR2(key, buffer, getMimeType(kind, extension));

  return NextResponse.json({
    success: true,
    data: { fileUrl, fileName: file.name, fileSize: file.size },
  });
}
