import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/Home.vue";
import About from "../pages/About.vue";
import Contact from "../pages/Contact.vue";
import SavedRecipes from "../pages/SavedRecipes.vue";
import MealPlans from "../pages/MealPlans.vue";
import MealPlanEditor from "../pages/MealPlanEditor.vue";

import SignIn from "../pages/auth/SignIn.vue";
import SignUp from "../pages/auth/SignUp.vue";
import RecipeView from "../pages/recipes/RecipeView.vue";
import AddRecipe from "../pages/recipes/AddRecipe.vue";

import MyProfileView from "../pages/profile/MyProfileView.vue";
import MyProfileAdvance from "../pages/profile/MyProfileAdvance.vue";
import ProfileView from "../pages/profile/ProfileView.vue";

import AdminPanelView from "../pages/admin/AdminPanelView.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/about", name: "about", component: About },
  { path: "/contact", name: "contact", component: Contact },
  { path: "/saved", name: "saved", component: SavedRecipes, meta: { requiresAuth: true } },
  { path: "/meal-plans", name: "meal-plans", component: MealPlans },
  { path: "/meal-plans/create", name: "meal-plans-create", component: MealPlanEditor },
  { path: "/meal-plans/:id/edit", name: "meal-plans-edit", component: MealPlanEditor },

  { path: "/signin", name: "signin", component: SignIn, meta: { hideLayout: true } },
  { path: "/signup", name: "signup", component: SignUp, meta: { hideLayout: true } },

  { path: "/recipes/:id", name: "recipe", component: RecipeView },
  { path: "/add-recipe", name: "add-recipe", component: AddRecipe, meta: { requiresAuth: true } },
  { path: "/edit-recipe/:id", name: "edit-recipe", component: () => import("../pages/recipes/EditRecipe.vue"), meta: { requiresAuth: true } },

  { path: "/profile/:id", name: "profile", component: ProfileView },

  { path: "/my-profile", name: "my-profile", component: MyProfileView, alias: "/me", meta: { requiresAuth: true } },
  { path: "/my-profile/advanced", name: "my-profile-advanced", component: MyProfileAdvance, alias: "/me/advanced", meta: { requiresAuth: true } },
  { path: "/me/admin", name: "admin-panel", component: AdminPanelView, meta: { requiresAuth: true, requiresAdmin: true } },

  { path: "/:pathMatch(.*)*", redirect: { name: "home" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    return { top: 0, left: 0 };
  },
});

router.beforeEach((to) => {
  const loggedIn = Boolean(localStorage.getItem("lsToken"));
  const role = localStorage.getItem("userRole");

  if (to.meta.requiresAuth && !loggedIn) {
    return { name: "signin" };
  }

  if (to.meta.requiresAdmin && role !== "admin") {
    return { name: "my-profile" };
  }

  return true;
});

export default router;
