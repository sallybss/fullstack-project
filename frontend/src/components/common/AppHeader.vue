<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink to="/" class="brand" aria-label="FoodFinder home">
        <img
          class="brand__logo"
          src="../../assets/images/foodfinder.svg"
          alt="FoodFinder"
        />
      </RouterLink>

      <nav class="nav" aria-label="Main navigation">
        <RouterLink to="/" class="nav__link" active-class="is-active">
          Home
        </RouterLink>
        <RouterLink to="/story" class="nav__link" active-class="is-active">
          Our story
        </RouterLink>
        <RouterLink to="/contact" class="nav__link" active-class="is-active">
          Ask us
        </RouterLink>
      </nav>

      <div class="actions">
        <RouterLink
          v-if="isLoggedIn"
          to="/saved"
          class="iconBtn"
          aria-label="Saved recipes"
        >
          <i class="pi pi-bookmark"></i>
        </RouterLink>

        <RouterLink
          v-if="isLoggedIn"
          to="/me"
          class="iconBtn"
          aria-label="My profile"
        >
          <i class="pi pi-user"></i>
        </RouterLink>

        <template v-if="isLoggedIn">
          <BaseButton variant="outline" type="button" @click="handleLogout">
            Logout
          </BaseButton>
        </template>

        <template v-else>
          <BaseButton variant="outline" type="button" @click="goToSignIn">
            Sign In
          </BaseButton>
          <BaseButton variant="primary" type="button" @click="goToSignUp">
            Register
          </BaseButton>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import BaseButton from "../common/BaseButton.vue";
import { useUser } from "../../modules/auth/useUser";

const router = useRouter();
const { isLoggedIn, logout } = useUser();

// Redirect guest users to auth pages
function goToSignIn() {
  router.push("/signin");
}

function goToSignUp() {
  router.push("/signup");
}

// Clear auth state and return to home
function handleLogout() {
  logout();
  router.push("/");
}
</script>

<style scoped lang="scss">
.header {
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 10;
  padding: 18px 0;
}

.header__inner {
  width: min(1200px, 92vw);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
}

.brand {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.brand__logo {
  width: 200px;
  height: auto;
  display: block;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 28px;
}

.nav__link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.nav__link:hover,
.nav__link.is-active {
  color: #fff;
}

.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.iconBtn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.92);
  display: grid;
  place-items: center;
  text-decoration: none;
}

.iconBtn:hover {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.3);
}

@media (max-width: 820px) {
  .nav {
    display: none;
  }

  .header__inner {
    grid-template-columns: 1fr auto;
  }

  .actions {
    gap: 8px;
  }
}
</style>