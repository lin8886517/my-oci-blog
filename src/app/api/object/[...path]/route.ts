import { NextResponse } from "next/server";
import common from "oci-common";
import os from "oci-objectstorage";

export const runtime = "nodejs";

const provider = new common.ConfigFileAuthenticationDetailsProvider(
  "C:\\Users\\linli\\.oci\\config",
  "DEFAULT"
);

const client = new os.ObjectStorageClient({
  authenticationDetailsProvider: provider,
});

const namespaceName = "iddukkrtuh3l";
const bucketName = "my-oci-blog-assets";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { path } = await context.params;
    const objectName = path.join("/");

    const response = await client.getObject({
      namespaceName,
      bucketName,
      objectName,
    });

    const chunks: Buffer[] = [];
    for await (const chunk of response.value as NodeJS.ReadableStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const headers = new Headers();
    headers.set("Content-Type", response.contentType || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(buffer, { headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}