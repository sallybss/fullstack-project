<template>
  <div class="privacy-page">
    <section class="privacy-hero" :style="heroBackgroundStyle">
      <div class="privacy-hero__overlay"></div>
      <AdminCoverEditor
        setting-key="privacy-policy-hero"
        :initial-image-url="heroImageUrl"
        :onUpdated="updateHeroImage"
      />
      <div class="privacy-hero__content">
        <p class="privacy-hero__eyebrow">Privacy Policy</p>
        <h1>Your Privacy at FoodFinder</h1>
        <p>
          Clear information about what we collect, how we use it, and how we
          protect your data when you use FoodFinder.
        </p>
      </div>
    </section>

    <main class="privacy-main">
      <section class="privacy-shell">
        <article class="intro-card">
          <p>
            FoodFinder collects limited account, recipe, profile, and contact
            data to run the platform safely and properly. This policy explains
            what information we use, why we use it, and what choices you have.
          </p>
        </article>

        <PolicySectionCard
          v-for="section in policySections"
          :key="section.title"
          :title="section.title"
          :icon="section.icon"
          :text="section.text"
        />

        <article class="privacy-cta">
          <h2>Questions About Privacy?</h2>
          <p>
            If you have questions about privacy, data handling, or account
            information, contact us at
            <a href="mailto:foodfindersupport@gmail.com">foodfindersupport@gmail.com</a>.
          </p>

          <a class="privacy-cta__button" href="mailto:foodfindersupport@gmail.com">
            foodfindersupport@gmail.com
          </a>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import AdminCoverEditor from "../components/common/AdminCoverEditor.vue";
import PolicySectionCard from "../components/privacy/PolicySectionCard.vue";
import heroImage from "../assets/images/hero.jpg";
import { useEditableHero } from "../composables/useEditableHero";

const { heroImageUrl, heroBackgroundStyle, updateHeroImage } = useEditableHero(
  heroImage,
  "linear-gradient(180deg, rgba(13, 10, 8, 0.34) 0%, rgba(13, 10, 8, 0.66) 100%)",
);

const policySections = [
  {
    title: "1. Information We Collect",
    icon: "pi-database",
    text: "We collect account details such as username, email address, password hash, profile details, published recipes, favorites, comments, ratings, and support messages you choose to send.",
  },
  {
    title: "2. How We Use It",
    icon: "pi-shield",
    text: "We use your information to create and manage accounts, display profiles and recipes, support saved items and ratings, respond to requests, and improve platform reliability and safety.",
  },
  {
    title: "3. Contact Form Data",
    icon: "pi-envelope",
    text: "When you use the contact form, we send your message to our support inbox and use your email only to reply to your request. Contact submissions are validated and rate-limited.",
  },
  {
    title: "4. Authentication and Security",
    icon: "pi-lock",
    text: "Passwords are stored as hashes, not plain text. Protected actions require authentication, and backend validation is applied to routes that manage account or content changes.",
  },
  {
    title: "5. Sharing Policy",
    icon: "pi-share-alt",
    text: "We do not sell your personal data. Public information you choose to publish, such as recipes, usernames, profile text, and ratings, can be visible to other users of the platform.",
  },
  {
    title: "6. Data Retention",
    icon: "pi-clock",
    text: "We keep information for as long as your account is active or as needed for security, platform operations, and legitimate legal or technical requirements.",
  },
  {
    title: "7. User Choices",
    icon: "pi-cog",
    text: "You can update profile information, change your password, manage saved content, and request account deletion through the parts of the application where those features are available.",
  },
  {
    title: "8. Third-Party Services",
    icon: "pi-server",
    text: "FoodFinder may rely on third-party tools for infrastructure, email delivery, and data hosting. Those services process only the information needed to support the platform.",
  },
];
</script>

<style scoped lang="scss">
.privacy-page {
  min-height: 100vh;
  background: #f7f4ef;
  color: #2b2521;
}

.privacy-hero {
  position: relative;
  height: 390px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 120px 24px 78px;
  background-position: center 38%;
  background-size: cover;
  background-repeat: no-repeat;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  overflow: hidden;
}

.privacy-hero__overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top center, rgba(255, 161, 115, 0.15), transparent 34%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.34));
}

.privacy-hero__content {
  position: relative;
  z-index: 1;
  width: min(740px, 100%);
}

.privacy-hero__eyebrow {
  margin: 0 0 10px;
  color: #f08b62;
  font-size: 0.82rem;
  font-weight: 700;
}

.privacy-hero h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.06;
}

.privacy-hero p:last-child {
  margin: 14px auto 0;
  max-width: 620px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.96rem;
  line-height: 1.72;
}

.privacy-main {
  width: min(980px, calc(100vw - 48px));
  margin: -18px auto 0;
  padding-bottom: 56px;
  position: relative;
  z-index: 1;
}

.privacy-shell {
  display: grid;
  gap: 14px;
}

.intro-card {
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(34, 26, 20, 0.08);
}

.intro-card {
  padding: 18px 20px;
}

.intro-card p {
  margin: 0;
  color: #6f645b;
  line-height: 1.72;
  font-size: 0.95rem;
}

.privacy-cta {
  margin-top: 10px;
  border-radius: 18px;
  padding: 26px 24px 24px;
  text-align: center;
  background: #f08b62;
  color: #fff;
  box-shadow: 0 16px 34px rgba(226, 123, 64, 0.24);
}

.privacy-cta h2 {
  margin: 0;
  font-size: 1.9rem;
  line-height: 1.1;
}

.privacy-cta p {
  margin: 12px auto 0;
  max-width: 560px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.94rem;
  line-height: 1.7;
}

.privacy-cta a {
  color: #fff;
  font-weight: 700;
}

.privacy-cta__button {
  display: inline-flex;
  margin-top: 18px;
  align-items: center;
  justify-content: center;
  min-width: 250px;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  background: #fff8f3;
  color: #7f4b29 !important;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(100, 47, 18, 0.12);
}

@media (max-width: 760px) {
  .privacy-main {
    width: min(980px, calc(100vw - 24px));
    padding-bottom: 42px;
  }

  .privacy-hero {
    height: 360px;
    padding: 104px 18px 84px;
  }

  .privacy-cta {
    padding: 22px 18px;
  }

  .privacy-cta h2 {
    font-size: 1.6rem;
  }

  .privacy-cta__button {
    min-width: unset;
    width: 100%;
  }
}
</style>
