<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__top">
        <div class="footer__brand">
          <img class="footer__logo" src="../../assets/images/foodfinder.svg" alt="FoodFinder" />
        </div>

        <div class="footer__social" aria-label="Social links">
          <a class="footer__iconBtn" href="mailto:foodfindersupport@gmail.com" aria-label="Email">
            <i class="pi pi-envelope"></i>
          </a>
          <a class="footer__iconBtn" href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
            <i class="pi pi-facebook"></i>
          </a>
          <a class="footer__iconBtn" href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
            <i class="pi pi-instagram"></i>
          </a>
        </div>
      </div>

      <div class="footer__divider"></div>

      <div class="footer__bottom">
        <small class="footer__copy">&copy; 2026 FoodFinder</small>

        <nav class="footer__links" aria-label="Footer links">
          <RouterLink class="footer__link" to="/privacy-policy">Privacy Policy</RouterLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.footer {
  background: #f6f6fb;
  padding: 56px 0 18px;
}

.footer__inner {
  width: min(1200px, 92vw);
  margin: 0 auto;
}

.footer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.footer__brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.footer__logo {
  height: 100px;
  width: auto;
  display: block;
}

.footer__social {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.footer__iconBtn {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(255, 114, 76, 0.16);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 10px 24px rgba(31, 26, 22, 0.06);
  display: grid;
  place-items: center;
  text-decoration: none;
  color: rgba(0, 0, 0, 0.65);
  transition: background 120ms ease, transform 120ms ease, border-color 120ms ease;
}

.footer__iconBtn .pi {
  font-size: 16px;
}

.footer__iconBtn:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 114, 76, 0.3);
  transform: translateY(-1px);
}

.footer__divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 22px 0 14px;
}

.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.footer__copy {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.footer__links {
  display: inline-flex;
  align-items: center;
  gap: 22px;
}

.footer__link {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  text-decoration: none;
}

.footer__link:hover {
  color: rgba(0, 0, 0, 0.75);
}

@media (max-width: 640px) {
  .footer {
    padding: 40px 0 24px;
  }

  .footer__inner {
    width: min(94vw, 560px);
  }

  .footer__top,
  .footer__bottom {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .footer__top {
    gap: 18px;
  }

  .footer__brand {
    justify-content: center;
  }

  .footer__logo {
    width: min(72vw, 280px);
    height: auto;
  }

  .footer__social {
    justify-content: center;
    gap: 12px;
    width: 100%;
  }

  .footer__divider {
    margin: 20px 0 16px;
  }

  .footer__bottom {
    gap: 10px;
  }

  .footer__links {
    width: 100%;
    justify-content: center;
  }

  .footer__copy,
  .footer__link {
    font-size: 14px;
  }
}
</style>
