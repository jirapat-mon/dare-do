// Generate daily code based on date - changes every day
export function getDailyCode(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const code = ((dayOfYear * 7 + today.getFullYear()) % 9000) + 1000;
  return `#WIN${code}`;
}
