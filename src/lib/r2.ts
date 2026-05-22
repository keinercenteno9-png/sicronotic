import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from 'process'
import { mkdir, writeFile, readFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const bucket = env.R2_BUCKET_NAME
const endpoint = env.R2_ENDPOINT
const accessKeyId = env.R2_ACCESS_KEY_ID
const secretAccessKey = env.R2_SECRET_ACCESS_KEY
const region = env.R2_REGION || 'auto'

const vercelUrl = env.VERCEL_BLOB_URL
const vercelToken = env.VERCEL_BLOB_TOKEN

const r2Enabled = Boolean(bucket && endpoint && accessKeyId && secretAccessKey)
const vercelEnabled = Boolean(vercelUrl && vercelToken)

let client: S3Client | undefined

if (r2Enabled) {
  const credsProvider = async () => ({
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  })

  client = new S3Client({
    region,
    endpoint: endpoint!,
    credentials: credsProvider,
    forcePathStyle: true,
  })
  console.log('☁️ Cloudflare R2 configurado y habilitado')
} else if (vercelEnabled) {
  console.log('☁️ Vercel Blob configurado y habilitado')
} else {
  console.warn('⚠️ Ningún proveedor de blob configurado. Se usará almacenamiento local en public/uploads/noticias')
}

const localUploadsDir = join(process.cwd(), 'public/uploads/noticias')
const buildKey = (filename: string) => `noticias/${filename}`
const localFilePath = (filename: string) => join(localUploadsDir, filename)

const normalizeKey = (filename: string) => {
  return filename.startsWith('noticias/') ? filename : buildKey(filename)
}

const ensureLocalUploadsDir = async () => {
  if (!existsSync(localUploadsDir)) {
    await mkdir(localUploadsDir, { recursive: true })
  }
}

const getContentType = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

export const uploadImageToR2 = async (
  filename: string,
  body: Uint8Array | Buffer,
  contentType: string
) => {
  const key = buildKey(filename)

  if (r2Enabled && client) {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    )
    return key
  }

  if (vercelEnabled) {
    const url = `${vercelUrl!.replace(/\/$/, '')}/${key}`
    const payload = Buffer.isBuffer(body) ? body : Buffer.from(body)
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${vercelToken!}`,
        'Content-Type': contentType,
      },
      body: payload as any,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Error subiendo a Vercel Blob: ${res.status} ${text}`)
    }

    return key
  }

  await ensureLocalUploadsDir()
  await writeFile(localFilePath(filename), body)
  return key
}

export const getImageFromR2 = async (filename: string) => {
  const key = normalizeKey(filename)

  if (r2Enabled && client) {
    return client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )
  }

  if (vercelEnabled) {
    const url = `${vercelUrl!.replace(/\/$/, '')}/${key}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${vercelToken!}`,
      },
    })

    if (!res.ok) {
      throw new Error(`Archivo no encontrado en Vercel Blob: ${res.status}`)
    }

    const arrayBuffer = await res.arrayBuffer()
    const Body = Buffer.from(arrayBuffer)
    const ContentType = res.headers.get('content-type') || getContentType(key.replace(/^noticias\//, ''))
    return { Body, ContentType }
  }

  const Body = await readFile(localFilePath(key.replace(/^noticias\//, '')))
  return {
    Body,
    ContentType: getContentType(key.replace(/^noticias\//, '')),
  }
}

export const deleteImageFromR2 = async (filename: string) => {
  const key = normalizeKey(filename)

  if (r2Enabled && client) {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )
    return
  }

  if (vercelEnabled) {
    const url = `${vercelUrl!.replace(/\/$/, '')}/${key}`
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${vercelToken!}`,
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Error eliminando en Vercel Blob: ${res.status} ${text}`)
    }

    return
  }

  await unlink(localFilePath(key.replace(/^noticias\//, ''))).catch(() => {})
}
