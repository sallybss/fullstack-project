<template>
  <div class="about-page">
    <HeroSection :imageUrl="heroImage">
      <div class="hero-copy">
        <p class="hero-copy__eyebrow">About FoodFinder</p>
        <h1>Recipe sharing built for real kitchens and curious cooks.</h1>
        <p class="hero-copy__lead">
          FoodFinder is a place to collect recipes, trade ideas, and turn
          everyday cooking into something more social, useful, and personal.
        </p>
      </div>
    </HeroSection>

    <main class="about-main">
      <section class="story-grid">
        <article class="story-card story-card--intro">
          <p class="story-card__kicker">Why it exists</p>
          <h2>Cooking feels better when good recipes do not disappear.</h2>
          <p>
            FoodFinder was designed for people who screenshot recipes, save links
            they never find again, and keep family favorites scattered across
            notes, chats, and browser tabs. The platform brings those moments
            into one place so recipes stay easy to save, revisit, and share.
          </p>
        </article>

        <article class="story-card story-card--accent">
          <p class="story-card__kicker">What the platform does</p>
          <ul class="feature-list">
            <li>Share recipes with a clean profile and public recipe pages.</li>
            <li>Save favorites so inspiration stays organized.</li>
            <li>Explore dishes from other cooks and different cuisines.</li>
            <li>Keep your own cooking style visible, not buried in bookmarks.</li>
          </ul>
        </article>
      </section>

      <section class="principles">
        <div class="section-heading">
          <p class="section-heading__eyebrow">Platform mindset</p>
          <h2>Simple to use, warm in tone, and built around sharing.</h2>
        </div>

        <div class="principles__grid">
          <article class="principle">
            <span class="principle__index">01</span>
            <h3>Recipes first</h3>
            <p>
              The experience centers on the food itself: what it is, how to make
              it, and why someone would want to cook it again.
            </p>
          </article>

          <article class="principle">
            <span class="principle__index">02</span>
            <h3>People matter too</h3>
            <p>
              Behind every dish is a person, a routine, a memory, or a small
              trick worth passing on. FoodFinder makes space for that context.
            </p>
          </article>

          <article class="principle">
            <span class="principle__index">03</span>
            <h3>Discovery should feel easy</h3>
            <p>
              Browsing recipes should feel like walking through a kitchen full of
              ideas, not searching through a cluttered archive.
            </p>
          </article>
        </div>
      </section>

      <section class="closing-banner">
        <div>
          <p class="closing-banner__eyebrow">What FoodFinder is for</p>
          <h2>
            A home for recipes you want to keep, recipes you want to try, and
            recipes worth passing on.
          </h2>
        </div>
        <p class="closing-banner__text">
          Whether you cook every day or only when inspiration strikes, the goal
          is the same: make great food easier to share.
        </p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import HeroSection from "../components/common/HeroSection.vue";
import heroImage from "../assets/images/hero.jpg";
</script>

<style scoped lang="scss">
.about-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(255, 114, 76, 0.12), transparent 32%),
    linear-gradient(180deg, #f3f1ee 0%, #f7f6f3 42%, #f5f5f7 100%);
}

.hero-copy {
  width: min(760px, 92vw);
  color: #fff;
  text-align: center;
}

.hero-copy__eyebrow,
.section-heading__eyebrow,
.story-card__kicker,
.closing-banner__eyebrow {
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(32px, 4.1vw, 50px);
  line-height: 1.08;
  font-weight: 700;
}

.hero-copy__lead {
  width: min(620px, 100%);
  margin: 18px auto 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.86);
}

.about-main {
  width: min(1180px, 92vw);
  margin: -74px auto 72px;
  position: relative;
  z-index: 1;
  display: grid;
  gap: 28px;
}

.story-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
}

.story-card,
.principles,
.closing-banner {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(10px);
  box-shadow: 0 24px 70px rgba(31, 24, 18, 0.08);
}

.story-card {
  padding: 34px;
}

.story-card--intro h2,
.section-heading h2,
.closing-banner h2 {
  margin: 0;
  color: #1d1a16;
  line-height: 1.08;
}

.story-card--intro h2 {
  font-size: clamp(24px, 3vw, 34px);
  max-width: 12ch;
}

.story-card p {
  margin: 16px 0 0;
  color: #5c5852;
  font-size: 14px;
}

.story-card--accent {
  background: linear-gradient(160deg, #ff724c 0%, #f29d52 100%);
  color: #fff;
}

.story-card--accent .story-card__kicker {
  color: rgba(255, 255, 255, 0.74);
}

.feature-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
  padding: 0;
}

.feature-list li {
  position: relative;
  padding-left: 22px;
  font-size: 14px;
  line-height: 1.55;
}

.feature-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
}

.principles {
  padding: 36px 34px;
}

.section-heading__eyebrow {
  color: rgba(29, 26, 22, 0.48);
}

.section-heading h2 {
  font-size: clamp(24px, 3vw, 36px);
  max-width: 14ch;
}

.principles__grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.principle {
  border-radius: 22px;
  background: #fbfaf8;
  border: 1px solid rgba(29, 26, 22, 0.08);
  padding: 24px;
}

.principle__index {
  display: inline-block;
  margin-bottom: 18px;
  color: #ff724c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.principle h3 {
  margin: 0;
  font-size: 18px;
  color: #1d1a16;
}

.principle p {
  margin: 12px 0 0;
  color: #5b5853;
  font-size: 14px;
}

.closing-banner {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 22px;
  align-items: end;
  padding: 34px;
  background: linear-gradient(135deg, #1f1a16 0%, #352720 100%);
}

.closing-banner__eyebrow {
  color: rgba(255, 255, 255, 0.58);
}

.closing-banner h2 {
  color: #fff;
  font-size: clamp(24px, 3.2vw, 38px);
  max-width: 14ch;
}

.closing-banner__text {
  margin: 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 15px;
  line-height: 1.65;
}

@media (max-width: 900px) {
  .story-grid,
  .principles__grid,
  .closing-banner {
    grid-template-columns: 1fr;
  }

  .about-main {
    margin-top: -48px;
  }
}

@media (max-width: 640px) {
  .story-card,
  .principles,
  .closing-banner {
    border-radius: 22px;
  }

  .story-card,
  .principles,
  .closing-banner {
    padding: 24px;
  }

  .hero-copy__lead,
  .closing-banner__text,
  .principle p,
  .story-card p {
    font-size: 14px;
  }
}
</style>
