import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export async function uploadFileToR2(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
  return `${PUBLIC_URL}/${key}`;
}

export function r2KeyFromUrl(fileUrl: string): string {
  return fileUrl.replace(`${PUBLIC_URL}/`, "");
}

export function isR2Url(fileUrl: string): boolean {
  return !!PUBLIC_URL && fileUrl.startsWith(`${PUBLIC_URL}/`);
}

export async function deleteFileFromR2(fileUrl: string): Promise<void> {
  const key = r2KeyFromUrl(fileUrl);
  await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
