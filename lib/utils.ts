import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge only knows Tailwind's stock scales, so our custom token classes
 * (shadow-e1, rounded-card, text-display-lg, ...) get mis-grouped — `shadow-e1` was
 * being read as a shadow *colour*, which silently recoloured arbitrary shadows it was
 * merged with. Teaching it our scales keeps "last class wins" correct.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display-xl', 'display-lg', 'display-md', 'display-sm', 'body-lg', 'body', 'body-sm', 'label', 'eyebrow'] }],
      rounded: [{ rounded: ['chip', 'field', 'card', 'card-lg', 'card-xl', 'pill'] }],
      shadow: [{ shadow: ['e1', 'e2', 'e3', 'lime'] }],
      z: [{ z: ['sticky', 'header', 'overlay', 'modal', 'toast', 'tooltip'] }],
      duration: [{ duration: ['fast', 'base', 'slow'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
