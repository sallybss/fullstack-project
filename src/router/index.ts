import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import SignIn from '../pages/SignIn.vue'
import SignUp from '../pages/SignUp.vue'
import RecipeView from '../pages/RecipeView.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/signin', component: SignIn, meta: { hideLayout: true }},
  { path: '/signup', component: SignUp, meta: { hideLayout: true } },
  //(dynamic id, when user clicks recipe1 in the Url is /recipes/1)
  { path: '/recipes/:id', name: 'recipe', component: RecipeView },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router