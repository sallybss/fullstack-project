import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/Home.vue";
import SavedRecipes from "../pages/SavedRecipes.vue";

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
  { path: "/saved", name: "saved", component: SavedRecipes },

  { path: "/signin", name: "signin", component: SignIn, meta: { hideLayout: true } },
  { path: "/signup", name: "signup", component: SignUp, meta: { hideLayout: true } },

  { path: "/recipes/:id", name: "recipe", component: RecipeView },
  { path: "/add-recipe", name: "add-recipe", component: AddRecipe },

  { path: "/profile/:id", name: "profile", component: ProfileView },

  { path: "/my-profile", name: "my-profile", component: MyProfileView, alias: "/me" },
  { path: "/my-profile/advanced", name: "my-profile-advanced", component: MyProfileAdvance, alias: "/me/advanced" },
  { path: "/me/admin", name: "admin-panel", component: AdminPanelView },

  { path: "/:pathMatch(.*)*", redirect: { name: "home" } },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});