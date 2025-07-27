export function getRegex(text: string) {
  return new RegExp(escapeRegExp(text), 'i');
}

export function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
