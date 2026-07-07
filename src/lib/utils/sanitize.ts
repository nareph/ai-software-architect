// src/lib/utils/sanitize.ts
// Sanitisation du contenu LLM avant affichage dans le browser
// Utilise rehype-sanitize pour éviter les injections XSS

/**
 * Sanitise une chaîne de caractères provenant du LLM
 * pour suppression des caractères de contrôle dangereux
 * avant insertion dans le DOM via dangerouslySetInnerHTML
 */
export function sanitizeLLMText(text: string): string {
  if (!text) return ''

  return text
    // Supprimer les balises HTML potentiellement injectées
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Normaliser les sauts de ligne
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}

/**
 * Sanitise un objet JSON provenant du LLM en profondeur
 * — supprime les valeurs string dangereuses récursivement
 */
export function sanitizeLLMJSON<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeLLMText(obj) as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeLLMJSON) as unknown as T
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeLLMJSON(value)
    }
    return result as T
  }

  return obj
}

/**
 * Configuration rehype-sanitize pour le rendu Markdown des artefacts
 * Utilisé avec react-markdown dans les views
 */
export const markdownSanitizeSchema = {
  strip: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'hr', 'a', 'img',
    'div', 'span',
  ],
  allowedAttributes: {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'code': ['className'],
    'pre': ['className'],
    'div': ['className'],
    'span': ['className'],
    'th': ['align', 'scope'],
    'td': ['align'],
  },
  allowedSchemes: ['https', 'http', 'mailto'],
}
