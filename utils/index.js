export function formatPrice(price) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return Number.isFinite(num) ? `$${num.toFixed(2)}` : '$0.00';
}

export const SECTION_CATEGORIES = ['starters', 'mains', 'desserts', 'drinks'];

// The API serves photo URLs, but one of them (grilledFish.jpg) is a blank black
// file and another (lemonDessert.jpg) 404s. The course asset pack ships the same
// dishes, so the list renders from the bundled images and never depends on the
// network for pictures.
const MENU_IMAGES = {
  'greekSalad.jpg': require('../assets/greek-salad.png'),
  'bruschetta.jpg': require('../assets/bruschetta.png'),
  'grilledFish.jpg': require('../assets/grilled-fish.png'),
  'pasta.jpg': require('../assets/pasta.png'),
  'lemonDessert.jpg': require('../assets/lemon-dessert.png'),
};

export function getMenuImage(fileName) {
  return MENU_IMAGES[fileName] || require('../assets/logo.png');
}
