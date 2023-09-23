export async function compress(blob: Blob) {
  const response = await new Response(blob.stream().pipeThrough(new CompressionStream("deflate")));
  return response.blob();
}

export async function decompress(blob: Blob) {
  const response = await new Response(blob.stream().pipeThrough(new DecompressionStream("deflate")));
  return response.blob();
}

export async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target!.result as string);
    };
    reader.readAsDataURL(blob);
  });
}

export function dataUrlToBase64(dataUrl: string) {
  return dataUrl.slice(dataUrl.indexOf("base64,") + 7);
}
