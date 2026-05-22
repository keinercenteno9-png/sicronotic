import 'dotenv/config'
import { uploadImageToR2, getImageFromR2, deleteImageFromR2 } from '../lib/r2'

const toBuffer = async (body: any) => {
  if (Buffer.isBuffer(body)) return body
  if (body instanceof Uint8Array) return Buffer.from(body)
  if (body?.arrayBuffer) return Buffer.from(await body.arrayBuffer())
  if (body?.pipe) {
    const chunks: Uint8Array[] = []
    for await (const chunk of body) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk))
    }
    return Buffer.concat(chunks)
  }
  return Buffer.from(String(body))
}

async function main() {
  const filename = `test_blob_${Date.now()}.txt`
  const content = `prueba ${new Date().toISOString()}`
  const buffer = Buffer.from(content)

  console.log('1) Subiendo...', filename)
  await uploadImageToR2(filename, buffer, 'text/plain')
  console.log('✅ Subida completada')

  console.log('2) Descargando...', filename)
  const result = await getImageFromR2(filename)
  const bodyBuf = await toBuffer(result.Body)
  console.log('✅ Descargado, bytes =', bodyBuf.length, 'content-type =', result.ContentType)

  console.log('3) Eliminando...', filename)
  await deleteImageFromR2(filename)
  console.log('✅ Eliminado')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error en test-blob:', err)
    process.exit(1)
  })
