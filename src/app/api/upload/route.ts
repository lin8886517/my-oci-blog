import { NextResponse } from "next/server";
import path from "path";
import { getBucketName, getNamespaceName, getObjectStorageClient } from "@/lib/oci";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = path.extname(file.name) || ".bin";
    const safeBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "-");
    const objectName = `uploads/${Date.now()}-${safeBase}${ext}`;

    const client = getObjectStorageClient();
    const namespaceName = getNamespaceName();
    const bucketName = getBucketName();

    await client.putObject({
      namespaceName,
      bucketName,
      objectName,
      putObjectBody: buffer,
      contentLength: buffer.length,
      contentType: file.type || "application/octet-stream",
    });

    return NextResponse.json({
      success: true,
      objectName,
      url: `oci://${bucketName}/${objectName}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}