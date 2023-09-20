export async function objectToDataUrl(object: any): Promise<string> {
  const blob = new Blob([JSON.stringify(object)], { type: "application/json" });

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target!.result as string);
    };
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToObject<T = any>(dataUrl: string): Promise<T> {
  const result = await fetch(dataUrl).then((res) => res.json());
  console.log("decoded", result);
  return result;
}
