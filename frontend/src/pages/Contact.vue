<template>
  <div class="contact-page">
    <section class="contact-hero" :style="heroBackgroundStyle">
      <div class="contact-hero__overlay"></div>
      <div class="contact-hero__content">
        <p class="contact-hero__eyebrow">Ask us</p>
        <h1>Ask Us</h1>
        <p>
          Got a question, suggestion, or just want to say hi? We'd love to
          hear from you.
        </p>
      </div>
    </section>

    <main class="contact-main">
      <section class="contact-cards" aria-label="Contact details">
        <article class="contact-card">
          <div class="contact-card__icon">
            <i class="pi pi-envelope"></i>
          </div>
          <h2>Email us</h2>
          <p>hello@foodfinder.com</p>
        </article>

        <article class="contact-card">
          <div class="contact-card__icon">
            <i class="pi pi-map-marker"></i>
          </div>
          <h2>Based in</h2>
          <p>San Francisco, CA</p>
        </article>

        <article class="contact-card">
          <div class="contact-card__icon">
            <i class="pi pi-clock"></i>
          </div>
          <h2>Response time</h2>
          <p>Within 24 hours</p>
        </article>
      </section>

      <section class="contact-content">
        <section class="message-panel">
          <h2>Send us a message</h2>
          <p>Fill out the form and we'll get back to you as soon as possible.</p>

          <form class="contact-form" @submit.prevent="handleSubmit">
            <input
              v-model="form.name"
              type="text"
              placeholder="Your name"
              autocomplete="name"
              required
            />

            <input
              v-model="form.email"
              type="email"
              placeholder="Your email"
              autocomplete="email"
              required
            />

            <input
              v-model="form.subject"
              type="text"
              placeholder="Subject"
              required
            />

            <textarea
              v-model="form.message"
              rows="6"
              placeholder="Your message"
              required
            ></textarea>

            <p v-if="submitted" class="contact-form__success">
              Your message is ready to send.
            </p>

            <button class="contact-form__button" type="submit">
              <i class="pi pi-send"></i>
              Send Message
            </button>
          </form>
        </section>

        <section class="faq-panel">
          <h2>Frequently Asked</h2>
          <p>Quick answers to common questions.</p>

          <article class="faq-card">
            <h3>How do I submit a recipe?</h3>
            <p>
              Click the 'Add recipe' button in the navigation bar. You'll be
              guided through adding your ingredients, instructions, and photos.
            </p>
          </article>

          <article class="faq-card">
            <h3>Can I edit my recipe after posting?</h3>
            <p>
              Yes. Navigate to your recipe and click the edit button. You can
              update ingredients, instructions, and photos at any time.
            </p>
          </article>

          <article class="faq-card">
            <h3>How do ratings work?</h3>
            <p>
              Anyone who has tried a recipe can leave a rating from 1 to 5
              stars along with a comment. Ratings help the community discover
              the best dishes.
            </p>
          </article>

          <article class="faq-card">
            <h3>Is FoodFinder free to use?</h3>
            <p>
              Absolutely. FoodFinder is completely free for everyone. Browsing,
              sharing, and saving recipes costs nothing.
            </p>
          </article>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import heroImage from "../assets/images/hero.jpg";

const heroBackgroundStyle = {
  backgroundImage: `linear-gradient(180deg, rgba(11, 10, 9, 0.24) 0%, rgba(11, 10, 9, 0.5) 100%), url(${heroImage})`,
};

const form = reactive({
  name: "",
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
  background: #f7f4ef;
  color: #2c2622;
}

.contact-hero {
  position: relative;
  height: 420px;
  padding: 112px 24px 72px;
  display: grid;
  place-items: center;
  text-align: center;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  z-index: 0;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  overflow: hidden;
}

.contact-hero__overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top center, rgba(255, 151, 105, 0.14), transparent 32%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.2));
}

.contact-hero__content {
  position: relative;
  z-index: 1;
  width: min(560px, 100%);
}

.contact-hero__eyebrow {
  margin: 0 0 10px;
  color: #f08b62;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0;
}

.contact-hero h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
  letter-spacing: 0;
}

.contact-hero p:last-child {
  margin: 14px auto 0;
  color: rgba(255, 255, 255, 0.87);
  font-size: 0.95rem;
  line-height: 1.7;
}

.contact-main {
  width: min(980px, calc(100vw - 48px));
  margin: -14px auto 0;
  padding-bottom: 40px;
  position: relative;
  z-index: 1;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  align-items: start;
}

.contact-card,
.faq-card {
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(34, 26, 20, 0.08);
}

.contact-card {
  padding: 26px 24px;
  text-align: center;
}

.contact-card__icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 14px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 114, 76, 0.1);
  color: #ef8358;
  font-size: 1rem;
}

.contact-card h2,
.message-panel h2,
.faq-panel h2 {
  margin: 0;
  color: #332d28;
  letter-spacing: 0;
}

.contact-card h2 {
  font-size: 1rem;
}

.contact-card p {
  margin: 8px 0 0;
  color: #9a8f85;
  font-size: 0.92rem;
}

.contact-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.98fr);
  gap: 34px;
  padding: 42px 0 24px;
}

.message-panel,
.faq-panel {
  min-width: 0;
}

.message-panel p,
.faq-panel > p,
.faq-card p {
  color: #968d85;
  font-size: 0.92rem;
  line-height: 1.7;
}

.message-panel > p,
.faq-panel > p {
  margin: 10px 0 0;
}

.contact-form {
  margin-top: 20px;
  display: grid;
  gap: 12px;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  border: 1px solid #ece4da;
  border-radius: 12px;
  background: #fffdfa;
  padding: 14px 16px;
  color: #2e2824;
  font: inherit;
  letter-spacing: 0;
}

.contact-form textarea {
  min-height: 126px;
  resize: vertical;
}

.contact-form input::placeholder,
.contact-form textarea::placeholder {
  color: #b6aca2;
}

.contact-form__success {
  margin: 0;
  color: #7f6d60;
}

.contact-form__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 14px 18px;
  background: #e37749;
  color: #fff;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(164, 92, 57, 0.16);
}

.faq-panel {
  display: grid;
  align-content: start;
  gap: 14px;
}

.faq-card {
  padding: 18px 20px;
}

.faq-card h3 {
  margin: 0 0 8px;
  color: #35302a;
  font-size: 0.98rem;
  letter-spacing: 0;
}

.faq-card p {
  margin: 0;
}

@media (max-width: 1080px) {
  .contact-main {
    width: min(980px, calc(100vw - 32px));
  }

  .contact-content {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}

@media (max-width: 760px) {
  .contact-main {
    width: min(980px, calc(100vw - 24px));
    margin-top: -10px;
  }

  .contact-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .contact-hero {
    height: 380px;
    padding: 104px 18px 92px;
  }

  .contact-card {
    padding: 22px 18px;
  }
}
</style>
