import { bannerRecipe } from './recipes/banner.recipe';
import { sidebarRecipe } from './recipes/sidebar.recipe';
import { pendingRecipe } from './recipes/pending.recipe';
import { navbarRecipe } from './recipes/navbar.recipe';

export const slotRecipes = {
  banner: bannerRecipe,
  sidebar: sidebarRecipe,
  pending: pendingRecipe,
  navbar: navbarRecipe,
};
