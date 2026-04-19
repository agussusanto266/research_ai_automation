export function randomEmail(prefix = "testuser"): string {
  const ts = Date.now();
  return `${prefix}+${ts}@example.test`;
}
