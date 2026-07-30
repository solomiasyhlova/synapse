import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getItemById } from "@/lib/db/items";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getItemById(session.user.id, id);
  if (!item?.fileUrl) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }

  const upstream = await fetch(item.fileUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }

  const safeName = (item.fileName ?? "download").replace(/["\r\n]/g, "");

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      ...(upstream.headers.get("content-length")
        ? { "Content-Length": upstream.headers.get("content-length")! }
        : {}),
    },
  });
}
