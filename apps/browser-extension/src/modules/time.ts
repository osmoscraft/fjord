const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function getSensibleAbsoluteTime(rawTime: number) {
  const now = Date.now();
  if (now - rawTime < DAY_IN_MS) {
    return new Date(rawTime).toLocaleTimeString();
  } else {
    return new Date(rawTime).toLocaleDateString();
  }
}
