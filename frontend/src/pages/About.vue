<template>
  <div class="about-page">
    <section class="about-hero" :style="heroBackgroundStyle">
      <div class="about-hero__overlay"></div>
      <AdminCoverEditor
        setting-key="about-hero"
        :initial-image-url="heroImageUrl"
        :onUpdated="updateHeroImage"
      />
      <div class="about-hero__content">
        <h1>Our Story</h1>
        <p>
          A community of food lovers, united by the joy of cooking and sharing.
        </p>
      </div>
    </section>

    <main class="about-main">
      <section class="story-section">
        <article class="story-copy">
          <h2>Why we started <span>FoodFinder</span></h2>
          <p>
            FoodFinder was born from a simple idea: everyone has a recipe worth
            sharing. We noticed that the best dishes we ever tasted were not in
            fancy restaurants. They were in family kitchens, at neighborhood
            potlucks, and around campfires.
          </p>
          <p>
            So we built a place where anyone, from first-time cooks to seasoned
            chefs, can share their favorite recipes, discover new flavors, and
            connect with people who love food as much as they do.
          </p>
        </article>

        <div class="story-photo" :style="storyPhotoStyle" aria-hidden="true"></div>
      </section>

      <section class="stats-section" aria-label="FoodFinder stats">
        <article class="stat-card">
          <div class="stat-card__icon">
            <i class="pi pi-users"></i>
          </div>
          <strong>50K+</strong>
          <span>Home Cooks</span>
        </article>

        <article class="stat-card">
          <div class="stat-card__icon">
            <i class="pi pi-heart"></i>
          </div>
          <strong>120K+</strong>
          <span>Recipes Shared</span>
        </article>

        <article class="stat-card">
          <div class="stat-card__icon">
            <i class="pi pi-globe"></i>
          </div>
          <strong>80+</strong>
          <span>Cuisines</span>
        </article>

        <article class="stat-card">
          <div class="stat-card__icon">
            <i class="pi pi-map-marker"></i>
          </div>
          <strong>45+</strong>
          <span>Countries</span>
        </article>
      </section>

      <section class="belief-section">
        <div class="belief-photo" :style="beliefPhotoStyle" aria-hidden="true"></div>

        <article class="belief-copy">
          <h2>What we believe in</h2>

          <div class="belief-item">
            <h3>Community First</h3>
            <p>
              We believe the best recipes come from real kitchens, shared by
              real people. Every dish tells a story, and we are here to help
              you tell yours.
            </p>
          </div>

          <div class="belief-item">
            <h3>Inclusivity</h3>
            <p>
              Whether you are vegan, gluten-free, or a die-hard carnivore,
              there is a place for everyone at our table. Every palate is
              welcome.
            </p>
          </div>

          <div class="belief-item">
            <h3>Quality Over Quantity</h3>
            <p>
              We encourage detailed, well-tested recipes with honest reviews.
              Our community holds each other to a high standard, with kindness.
            </p>
          </div>
        </article>
      </section>

      <section class="cta-section">
        <h2>Ready to share your recipe?</h2>
        <p>
          Join thousands of home cooks already sharing their favorite dishes
          with the world.
        </p>
        <RouterLink to="/add-recipe" class="cta-button">Start Cooking</RouterLink>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AdminCoverEditor from "../components/common/AdminCoverEditor.vue";
import heroImage from "../assets/images/hero.jpg";
import kitchenImage from "../assets/images/auth_bg.jpg";

const heroImageUrl = ref(heroImage);

function updateHeroImage(imageUrl: string) {
  heroImageUrl.value = imageUrl;
}

const heroBackgroundStyle = computed(() => ({
  backgroundImage: `linear-gradient(180deg, rgba(13, 10, 8, 0.28) 0%, rgba(13, 10, 8, 0.62) 100%), url(${heroImageUrl.value})`,
}));

const storyPhotoStyle = {
  backgroundImage: `linear-gradient(180deg, rgba(24, 18, 14, 0.14), rgba(24, 18, 14, 0.18)), url(${kitchenImage})`,
};

const beliefPhotoStyle = {
  backgroundImage: `linear-gradient(180deg, rgba(47, 25, 10, 0.08), rgba(47, 25, 10, 0.16)), url(${heroImage})`,
};
</script>

<style scoped lang="scss">
.about-page {
  min-height: 100vh;
  background: #f7f4ef;
  color: #2a2420;
}

.about-hero {
  position: relative;
  height: 420px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 120px 24px 72px;
  background-position: center 38%;
  background-size: cover;
  background-repeat: no-repeat;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  overflow: hidden;
}

.about-hero__overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top center, rgba(255, 161, 115, 0.14), transparent 34%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.3));
}

.about-hero__content {
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
}

.about-hero h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(2rem, 4vw, 3.15rem);
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: 0;
}

.about-hero p {
  margin: 12px auto 0;
  max-width: 560px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

.about-main {
  width: min(1120px, calc(100vw - 80px));
  margin: 0 auto;
  padding: 58px 0 0;
}

.story-section,
.belief-section {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 1fr);
  align-items: center;
  gap: 54px;
}

.story-copy h2,
.belief-copy h2 {
  margin: 0 0 18px;
  font-size: clamp(1.7rem, 2.6vw, 2.2rem);
  line-height: 1.15;
  letter-spacing: 0;
}

.story-copy h2 span {
  color: var(--accent);
}

.story-copy p,
.belief-item p {
  margin: 0;
  color: #6a645d;
  font-size: 0.95rem;
  line-height: 1.75;
}

.story-copy p + p,
.belief-item + .belief-item {
  margin-top: 16px;
}

.story-photo,
.belief-photo {
  min-height: 280px;
  border-radius: 16px;
  box-shadow: 0 18px 46px rgba(35, 24, 18, 0.12);
}

.story-photo {
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
  padding: 68px 0 62px;
}

.stat-card {
  text-align: center;
}

.stat-card__icon {
  width: 42px;
  height: 42px;
  margin: 0 auto 16px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 114, 76, 0.1);
  color: #f08c63;
  font-size: 1rem;
}

.stat-card strong {
  display: block;
  color: #36302b;
  font-size: 2rem;
  line-height: 1;
  letter-spacing: 0;
}

.stat-card span {
  display: block;
  margin-top: 10px;
  color: #9a9188;
  font-size: 0.83rem;
}

.belief-section {
  padding: 18px 0 72px;
}

.belief-photo {
  min-height: 300px;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

.belief-copy {
  align-self: start;
}

.belief-item h3 {
  margin: 0 0 6px;
  color: #34302c;
  font-size: 1rem;
  letter-spacing: 0;
}

.cta-section {
  margin: 0 calc(50% - 50vw);
  padding: 58px 24px 64px;
  background: #e37b4f;
  text-align: center;
}

.cta-section h2 {
  margin: 0;
  color: #fff;
  font-size: clamp(1.8rem, 3vw, 2.3rem);
  line-height: 1.15;
  letter-spacing: 0;
}

.cta-section p {
  width: min(420px, 100%);
  margin: 12px auto 0;
  color: rgba(255, 248, 243, 0.9);
  font-size: 0.92rem;
  line-height: 1.6;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 142px;
  margin-top: 24px;
  padding: 12px 22px;
  border-radius: 999px;
  background: #fff;
  color: #df7548;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0;
  box-shadow: 0 10px 24px rgba(103, 49, 27, 0.14);
}

.cta-button:hover {
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .about-main {
    width: min(1120px, calc(100vw - 40px));
    padding-top: 42px;
  }

  .story-section,
  .belief-section {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .stats-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 30px 18px;
    padding: 50px 0;
  }
}

@media (max-width: 560px) {
  .about-hero {
    height: 380px;
    padding: 110px 20px 54px;
  }

  .about-main {
    width: min(1120px, calc(100vw - 28px));
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .story-photo,
  .belief-photo {
    min-height: 220px;
  }

  .cta-section {
    padding: 48px 18px 54px;
  }
}
</style>
