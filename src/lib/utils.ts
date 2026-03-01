export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace('/api', '');
  
  // Replace backslashes with forward slashes for Windows paths and ensure it starts with /
  let cleanUrl = url.replace(/\\/g, '/');
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = `/${cleanUrl}`;
  }
  
  // If we're working with local uploads, return the relative path to use the Next.js rewrite
  // This bypasses the "private IP" SSRF protection in Next.js Image Optimization
  if ((apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) && !url.startsWith('http')) {
     return cleanUrl;
  }
  
  return `${baseUrl}${cleanUrl}`;
};

export const slugify = (text: string) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

export const createProductSlug = (name: string, id: string) => {
  return `${slugify(name)}-${id}`;
};

export const extractIdFromSlug = (slug: string) => {
  // If no hyphen, assume it IS the ID
  if (!slug.includes('-')) return slug;
  // If the last part is not an ID (e.g. 24 chars for CUID/ObjectId), we might fall back to full slug
  // For now simple split is fine as we construct it reliably
  const parts = slug.split('-');
  return parts[parts.length - 1];
};
