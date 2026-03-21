export function formatTimestamp(iso?: string) {
  if (!iso) {
    return "Not recorded";
  }

  return new Date(iso).toLocaleString();
}

export function formatDateOnly(iso?: string) {
  if (!iso) {
    return "Any date";
  }

  return new Date(iso).toLocaleDateString();
}
