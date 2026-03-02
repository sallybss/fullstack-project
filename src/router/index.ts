import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/Home.vue";
import SignIn from "../pages/SignIn.vue";
import SignUp from "../pages/SignUp.vue";
import RecipeView from "../pages/RecipeView.vue";
import AddRecipe from "../pages/AddRecipe.vue";
import MyProfileView from "../pages/MyProfileView.vue";
import MyProfileAdvance from "../pages/MyProfileAdvance.vue";

const routes = [
  { path: "/", name: "home", component: Home },

  { path: "/signin", name: "signin", component: SignIn, meta: { hideLayout: true } },
  { path: "/signup", name: "signup", component: SignUp, meta: { hideLayout: true } },

  { path: "/recipes/:id", name: "recipe", component: RecipeView },
  { path: "/add-recipe", name: "add-recipe", component: AddRecipe },

  { path: "/profile/:id", name: "profile", component: () => import("../pages/ProfileView.vue") },

  { path: "/my-profile", name: "my-profile", component: MyProfileView, alias: "/me" },
  { path: "/my-profile/advanced", name: "my-profile-advanced", component: MyProfileAdvance, alias: "/me/advanced" },

  { path: "/:pathMatch(.*)*", redirect: { name: "home" } },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});