<template>
  <footer class="footer">
    <div class="footer__inner">
      <!-- Top row -->
      <div class="footer__top">
        <div class="footer__brand">
          <!-- Replace with your actual logo image if you have one -->
          <img class="footer__logo" src="../../assets/images/foodfinder.svg" alt="FoodFinder" />
        </div>

        <div class="footer__social" aria-label="Social links">
          <a class="footer__iconBtn" href="#" aria-label="Email">
            <i class="pi pi-envelope"></i>
          </a>
          <a class="footer__iconBtn" href="#" aria-label="Facebook">
            <i class="pi pi-facebook"></i>
          </a>
          <a class="footer__iconBtn" href="#" aria-label="Instagram">
            <i class="pi pi-instagram"></i>
          </a>
        </div>
      </div>

      <div class="footer__divider"></div>

      <!-- Bottom row -->
      <div class="footer__bottom">
        <small class="footer__copy">© 2026 FoodFinder</small>

        <nav class="footer__links" aria-label="Footer links">
          <a class="footer__link" href="#">Privacy Policy</a>
          <a class="footer__link" href="#">Terms of Service</a>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.footer {
  background: #f5f5f7;
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

/* If you use an image logo later */
.footer__logo {
  height: 100px;
  width: auto;
  display: block;
}

.footer__logoText {
  font-size: 44px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--accent);
  line-height: 1;
}

.footer__social {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.footer__iconBtn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.10);
  display: grid;
  place-items: center;
  text-decoration: none;
  color: rgba(0, 0, 0, 0.65);
  transition: background 120ms ease, transform 120ms ease;
}

.footer__iconBtn .pi {
  font-size: 14px;
}

.footer__iconBtn:hover {
  background: rgba(0, 0, 0, 0.16);
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
  text-decoration: underline;
  text-underline-offset: 3px;
}

.footer__link:hover {
  color: rgba(0, 0, 0, 0.75);
}

/* small screens */
@media (max-width: 640px) {
  .footer__top,
  .footer__bottom {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer__logoText {
    font-size: 34px;
  }
}
</style>