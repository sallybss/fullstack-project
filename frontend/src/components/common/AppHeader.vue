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
        <RouterLink to="/about" class="nav__link" active-class="is-active">
          About
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

        <button
          class="menuToggle"
          type="button"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Toggle navigation menu"
          @click="toggleMobileMenu"
        >
          <i :class="['pi', isMobileMenuOpen ? 'pi-times' : 'pi-bars']"></i>
        </button>
      </div>
    </div>

    <div v-if="isMobileMenuOpen" class="mobileMenu">
      <nav class="mobileMenu__nav" aria-label="Mobile navigation">
        <RouterLink to="/" class="mobileMenu__link" active-class="is-active" @click="closeMobileMenu">
          Home
        </RouterLink>
        <RouterLink to="/about" class="mobileMenu__link" active-class="is-active" @click="closeMobileMenu">
          About
        </RouterLink>
        <RouterLink to="/contact" class="mobileMenu__link" active-class="is-active" @click="closeMobileMenu">
          Ask us
        </RouterLink>
      </nav>

      <div class="mobileMenu__actions">
        <RouterLink
          v-if="isLoggedIn"
          to="/saved"
          class="mobileMenu__link mobileMenu__link--icon"
          @click="closeMobileMenu"
        >
          Saved recipes
        </RouterLink>

        <RouterLink
          v-if="isLoggedIn"
          to="/me"
          class="mobileMenu__link mobileMenu__link--icon"
          @click="closeMobileMenu"
        >
          My profile
        </RouterLink>

        <template v-if="isLoggedIn">
          <button class="mobileMenu__button mobileMenu__button--ghost" type="button" @click="handleLogout">
            Logout
          </button>
        </template>

        <template v-else>
          <button class="mobileMenu__button mobileMenu__button--outline" type="button" @click="goToSignIn">
            Sign In
          </button>
          <button class="mobileMenu__button mobileMenu__button--primary" type="button" @click="goToSignUp">
            Register
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseButton from "../common/BaseButton.vue";
import { useUser } from "../../modules/auth/useUser";

const router = useRouter();
const route = useRoute();
const { isLoggedIn, logout } = useUser();
const isMobileMenuOpen = ref(false);

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
  }
);

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}

// Redirect guest users to auth pages
function goToSignIn() {
  closeMobileMenu();
  router.push("/signin");
}

function goToSignUp() {
  closeMobileMenu();
  router.push("/signup");
}

// Clear auth state and return to home
function handleLogout() {
  closeMobileMenu();
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

.menuToggle {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.24);
  color: #fff;
  place-items: center;
  cursor: pointer;
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

.mobileMenu {
  display: none;
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

  .actions > :not(.menuToggle) {
    display: none;
  }

  .menuToggle {
    display: grid;
  }

  .brand__logo {
    width: 160px;
  }

  .mobileMenu {
    display: grid;
    gap: 18px;
    width: min(92vw, 420px);
    margin: 14px auto 0;
    padding: 18px;
    border-radius: 22px;
    background: rgba(14, 11, 9, 0.9);
    backdrop-filter: blur(12px);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  }

  .mobileMenu__nav,
  .mobileMenu__actions {
    display: grid;
    gap: 10px;
  }

  .mobileMenu__link,
  .mobileMenu__button {
    width: 100%;
    min-height: 44px;
    border-radius: 14px;
    padding: 12px 14px;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0;
    text-align: left;
    text-decoration: none;
  }

  .mobileMenu__link {
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.88);
  }

  .mobileMenu__link.is-active {
    border-color: rgba(255, 114, 76, 0.44);
    color: #fff;
  }

  .mobileMenu__button {
    cursor: pointer;
  }

  .mobileMenu__button--primary {
    border: 0;
    background: var(--accent);
    color: #fff;
  }

  .mobileMenu__button--outline {
    border: 1px solid var(--accent);
    background: transparent;
    color: var(--accent);
  }

  .mobileMenu__button--ghost {
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
