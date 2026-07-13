import { customAlphabet } from "nanoid";

const ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";
const nano = customAlphabet(ALPHABET, 6);

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

/** Genera un slug único y legible para el link personal de un invitado. */
export function generateGuestSlug(name: string) {
  const base = slugify(name) || "invitado";
  return `${base}-${nano()}`;
}
