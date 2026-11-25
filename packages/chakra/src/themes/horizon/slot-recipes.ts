import { bannerSlotRecipe } from './recipes/banner.recipe';
import { sidebarSlotRecipe } from './recipes/sidebar.recipe';
import { pendingSlotRecipe } from './recipes/pending.recipe';
import { navbarSlotRecipe } from './recipes/navbar.recipe';

export const slotRecipes = {
  banner: bannerSlotRecipe,
  sidebar: sidebarSlotRecipe,
  pending: pendingSlotRecipe,
  navbar: navbarSlotRecipe,
};
