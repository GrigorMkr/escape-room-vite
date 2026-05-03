function normalizeTrailingBase(rawBase: string): string {
  if (rawBase === '') {
    return './';
  }
  if (rawBase.endsWith('/')) {
    return rawBase;
  }
  return `${rawBase}/`;
}

function mergeBaseAndRelativePath(prefix: string, relativePath: string): string {
  return `${prefix}${relativePath}`.replace(/([^:])\/{2,}/g, '$1/');
}

export function resolvePublicAssetUrl(relativePath: string): string {
  const path = relativePath.replace(/^\/+/, '');
  const rawBase = import.meta.env.BASE_URL || '/';
  const baseWithSlash = normalizeTrailingBase(rawBase);

  if (typeof window === 'undefined' || !window.location?.href) {
    return mergeBaseAndRelativePath(baseWithSlash, path);
  }

  try {
    return new URL(path, new URL(baseWithSlash, window.location.href).href).href;
  } catch {
    return mergeBaseAndRelativePath(baseWithSlash, path);
  }
}
