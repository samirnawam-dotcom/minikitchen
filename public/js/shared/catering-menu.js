// Dish lists published with the website. A site config saved before a list was published keeps that
// list empty; upgradeCateringMenu fills such empty lists once from the defaults. Lists the owner has
// filled in are never touched, and a Back Office save records the version so later edits stay his.

export const CATERING_MENU_VERSION = 2;

/** Returns the choice groups to use: saved groups with empty lists filled from the defaults. */
export function upgradeCateringMenu(siteConfig, defaults) {
  const saved = siteConfig?.cateringChoiceGroups;
  const fallback = Array.isArray(defaults?.cateringChoiceGroups) ? defaults.cateringChoiceGroups : [];
  if (!Array.isArray(saved)) return fallback;
  if ((Number(siteConfig.cateringMenuVersion) || 0) >= CATERING_MENU_VERSION) return saved;
  return saved.map(group => {
    if (Array.isArray(group?.items) && group.items.length) return group;
    const published = fallback.find(g => g.id === group?.id);
    return published && published.items?.length ? { ...group, items: published.items } : group;
  });
}
