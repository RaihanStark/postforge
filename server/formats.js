// Carousel configuration shared by the generator and surfaced over /api/meta.
// Formats are the canvas sizes carousels are exported at; the web UI keeps a
// matching copy in web/src/constants.js for live preview math.
export const FORMATS = {
  portrait: { label: 'Portrait 4:5', w: 1080, h: 1350 },
  square: { label: 'Square 1:1', w: 1080, h: 1080 },
}

export const TONES = ['Professional', 'Casual', 'Witty', 'Bold', 'Inspirational', 'Educational', 'Friendly', 'Luxurious']

export const SLIDES = { min: 3, max: 10, default: 5 }

// The slide archetypes the model may emit. The renderer has a layout for each.
export const SLIDE_TYPES = {
  cover: 'The opening hook slide. A short punchy title that stops the scroll, optional eyebrow + subtitle.',
  point: 'A single idea: a short heading plus a sentence or two of body copy.',
  list: 'A heading plus 2-5 short bullet items.',
  quote: 'A bold standalone statement or quote, with optional attribution.',
  cta: 'The closing call-to-action: a prompt to follow/save/comment, with the handle.',
}
