import html2canvas from 'html2canvas'
import JSZip from 'jszip'

export async function captureElement(
  el: HTMLElement,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    scale: 1,
    width,
    height,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  })
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function downloadZip(
  files: { canvas: HTMLCanvasElement; name: string }[],
  zipName: string,
) {
  const zip = new JSZip()
  for (const f of files) {
    const blob = await canvasToBlob(f.canvas)
    zip.file(f.name, blob)
  }
  const content = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.download = zipName + '.zip'
  link.href = URL.createObjectURL(content)
  link.click()
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise(resolve =>
    canvas.toBlob(b => resolve(b!), 'image/png')
  )
}
