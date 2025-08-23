// withMinDelay.js
export async function withMinDelay(promise, ms = 900) {
  const sleeper = new Promise((r) => setTimeout(r, ms));
  const [result] = await Promise.all([promise, sleeper]);
  return result;
}
