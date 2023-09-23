export async function compressString(str: string): Promise<string> {
  const blob = new Blob([str], { type: "text/plain" });
  return compressBlob(blob).then(blobToDataUrl);
}

export async function decompressString(str: string): Promise<string> {
  return dataUrlToBlob(str)
    .then(decompressBlob)
    .then((blob) => blob.text());
}

async function compressBlob(blob: Blob) {
  const response = await new Response(blob.stream().pipeThrough(new CompressionStream("deflate")));
  return response.blob();
}

async function decompressBlob(blob: Blob) {
  const response = await new Response(blob.stream().pipeThrough(new DecompressionStream("deflate")));
  return response.blob();
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target!.result as string);
    };
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string) {
  return fetch(dataUrl).then((res) => res.blob());
}
