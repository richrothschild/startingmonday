export function getOwnerEmail(): string | undefined {
  return process.env.OWNER_EMAIL ?? process.env.NOTIFY_EMAIL
}
