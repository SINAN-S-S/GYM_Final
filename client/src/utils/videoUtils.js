/**
 * Video helper utilities for AlphaFit
 * Supports YouTube embeds (standard, shorts, share links), Vimeo, and direct video sources.
 */

export const getEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  // YouTube Shorts: youtube.com/shorts/ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&rel=0`;
  }

  // YouTube Shortlink: youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
  }

  // YouTube Watch: youtube.com/watch?v=ID
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch && longMatch[1]) {
    return `https://www.youtube.com/embed/${longMatch[1]}?autoplay=1&rel=0`;
  }

  // YouTube Embed: youtube.com/embed/ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch && embedMatch[1]) {
    return `https://www.youtube.com/embed/${embedMatch[1]}?autoplay=1&rel=0`;
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return null;
};

export const isDirectVideoUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return /\.(mp4|webm|ogg|m4v|mov)|cloudinary/i.test(url);
};
