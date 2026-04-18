<template>
  <div class="contact-page">
    <HeroSection :imageUrl="heroImage">
      <div class="contact-hero">
        <p class="contact-hero__eyebrow">Ask us</p>
        <h1>Questions, ideas, recipe feedback, or partnership inquiries.</h1>
        <p class="contact-hero__lead">
          If something on FoodFinder sparked a thought, send it through. We are
          always interested in feedback from cooks, creators, and curious users.
        </p>
      </div>
    </HeroSection>

    <main class="contact-main">
      <section class="contact-shell">
        <div class="contact-info">
          <p class="contact-info__eyebrow">Get in touch</p>
          <h2>Tell us what you need and we will point it to the right place.</h2>
          <p class="contact-info__text">
            Use the form for product questions, feedback about the recipe
            experience, collaboration ideas, or anything else related to the
            platform.
          </p>

          <div class="contact-points">
            <article class="contact-point">
              <span class="contact-point__icon">01</span>
              <div>
                <h3>General questions</h3>
                <p>Anything about using FoodFinder, profiles, recipes, or discovery.</p>
              </div>
            </article>

            <article class="contact-point">
              <span class="contact-point__icon">02</span>
              <div>
                <h3>Ideas and feedback</h3>
                <p>Suggestions for features, UX improvements, or platform direction.</p>
              </div>
            </article>

            <article class="contact-point">
              <span class="contact-point__icon">03</span>
              <div>
                <h3>Collaboration</h3>
                <p>Partnerships, creator opportunities, or community-related requests.</p>
              </div>
            </article>
          </div>
        </div>

        <section class="form-panel">
          <div class="form-card__header">
            <p class="form-card__eyebrow">Contact form</p>
            <h2>Contact us</h2>
            <p>Don’t hesitate to get in touch for anything.</p>
          </div>

          <form class="contact-form" @submit.prevent="handleSubmit">
            <label class="field">
              <span>Name</span>
              <input
                v-model="form.name"
                type="text"
                placeholder="Your name"
                autocomplete="name"
                required
              />
            </label>

            <label class="field">
              <span>Company (Optional)</span>
              <input
                v-model="form.company"
                type="text"
                placeholder="Studio or company"
                autocomplete="organization"
              />
            </label>

            <label class="field">
              <span>Email</span>
              <input
                v-model="form.email"
                type="email"
                placeholder="you@email.com"
                autocomplete="email"
                required
              />
            </label>

            <label class="field">
              <span>Subject</span>
              <input
                v-model="form.subject"
                type="text"
                placeholder="What is this about?"
                required
              />
            </label>

            <label class="field field--full">
              <span>Message</span>
              <textarea
                v-model="form.message"
                rows="6"
                placeholder="Tell us what is on your mind."
                required
              ></textarea>
            </label>

            <p v-if="submitted" class="form-card__success">
              Thanks. Your message is ready to send.
            </p>

            <div class="form-card__actions">
              <BaseButton type="submit" variant="primary">
                Submit
              </BaseButton>
            </div>
          </form>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import HeroSection from "../components/common/HeroSection.vue";
import BaseButton from "../components/common/BaseButton.vue";
import heroImage from "../assets/images/hero.jpg";

const form = reactive({
  name: "",
  company: "",
  email: "",
  subject: "",
  message: "",
});

const submitted = ref(false);

function handleSubmit() {
  submitted.value = true;
}
</script>

<style scoped lang="scss">
.contact-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(255, 114, 76, 0.12), transparent 28%),
    linear-gradient(180deg, #f3f1ee 0%, #f7f6f3 42%, #f5f5f7 100%);
}

.contact-hero {
  width: min(800px, 92vw);
  text-align: center;
  color: #fff;
}

.contact-hero__eyebrow,
.contact-info__eyebrow,
.form-card__eyebrow {
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.contact-hero h1 {
  margin: 0;
  font-size: clamp(24px, 3.3vw, 38px);
  line-height: 1.12;
  font-weight: 700;
  max-width: 14ch;
  margin-inline: auto;
}

.contact-hero__lead {
  width: min(640px, 100%);
  margin: 18px auto 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.84);
}

.contact-main {
  width: min(1180px, 92vw);
  margin: 72px auto 72px;
  position: relative;
  z-index: 1;
}

.contact-shell {
  display: grid;
  grid-template-columns: 0.95fr 1.15fr;
  gap: 65px;
  align-items: stretch;
}

.contact-info {
  padding: 18px 6px 0 6px;
}

.contact-info__eyebrow {
  color: rgba(29, 26, 22, 0.48);
}

.contact-info h2,
.form-card__header h2 {
  margin: 0;
  color: #1d1a16;
  line-height: 1.08;
}

.contact-info h2 {
  font-size: clamp(26px, 3vw, 36px);
  max-width: 12ch;
}

.contact-info__text,
.form-card__header p,
.contact-point p {
  color: #5d5954;
  font-size: 14px;
}

.contact-info__text {
  margin: 16px 0 0;
  max-width: 42ch;
}

.contact-points {
  display: grid;
  gap: 16px;
  margin-top: 28px;
}

.contact-point {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: start;
  padding: 0 0 18px;
  border-bottom: 1px solid rgba(29, 26, 22, 0.1);
}

.contact-point__icon {
  min-width: 40px;
  height: 40px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 114, 76, 0.1);
  color: #ff724c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.contact-point h3 {
  margin: 2px 0 6px;
  color: #1d1a16;
  font-size: 18px;
}

.contact-point p,
.form-card__header p {
  margin: 0;
  line-height: 1.6;
}

.form-panel {
  height: 100%;
  padding: 34px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 24px 70px rgba(31, 24, 18, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.58);
  display: flex;
  flex-direction: column;
}

.form-card__eyebrow {
  color: rgba(29, 26, 22, 0.48);
}

.form-card__header p {
  margin-top: 12px;
}

.contact-form {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  height: 100%;
  align-content: start;
}

.field {
  display: grid;
  gap: 8px;
}

.field--full {
  grid-column: 1 / -1;
}

.field span {
  color: #2d2925;
  font-size: 14px;
  font-weight: 600;
}

.field input,
.field textarea {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(45, 41, 37, 0.14);
  background: #fffdfa;
  padding: 14px 16px;
  font: inherit;
  color: #1d1a16;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input {
  height: 50px;
}

.field textarea {
  resize: vertical;
  min-height: 150px;
}

.field input::placeholder,
.field textarea::placeholder {
  color: #9e978f;
}

.field input:focus,
.field textarea:focus {
  border-color: rgba(255, 114, 76, 0.45);
  box-shadow: 0 0 0 4px rgba(255, 114, 76, 0.08);
}

.form-card__success {
  grid-column: 1 / -1;
  margin: 0;
  color: #c86443;
  font-size: 14px;
  font-weight: 500;
}

.form-card__actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

@media (max-width: 900px) {
  .contact-shell,
  .contact-form {
    grid-template-columns: 1fr;
  }

  .contact-main {
    margin-top: 48px;
  }
}

@media (max-width: 640px) {
  .form-panel {
    padding: 24px;
    border-radius: 22px;
  }
}
</style>
