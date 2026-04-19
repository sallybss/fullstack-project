<template>
  <div class="contact-page">
    <section class="contact-hero" :style="heroBackgroundStyle">
      <div class="contact-hero__overlay"></div>
      <AdminCoverEditor
        setting-key="contact-hero"
        :initial-image-url="heroImageUrl"
        @updated="updateHeroImage($event)"
      />
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
        <ContactInfoCard
          v-for="card in contactCards"
          :key="card.title"
          :icon="card.icon"
          :title="card.title"
          :text="card.text"
          :href="card.href"
        />
      </section>

      <section class="contact-content">
        <section class="message-panel">
          <h2>Send us a message</h2>
          <p>Fill out the form and we'll get back to you as soon as possible.</p>

          <form class="contact-form" @submit.prevent="handleSubmit">
            <input
              v-model="form.name"
              type="text"
              maxlength="100"
              placeholder="Your name"
              autocomplete="name"
              required
            />

            <input
              v-model="form.email"
              type="email"
              maxlength="255"
              placeholder="Your email"
              autocomplete="email"
              required
            />

            <input
              v-model="form.subject"
              type="text"
              maxlength="150"
              placeholder="Subject"
              required
            />

            <textarea
              v-model="form.message"
              rows="6"
              :maxlength="MAX_MESSAGE_LENGTH"
              placeholder="Your message"
              required
            ></textarea>

            <p class="contact-form__counter">
              ({{ form.message.length }}/{{ MAX_MESSAGE_LENGTH }})
            </p>

            <p v-if="submitSuccess" class="contact-form__success">
              Your message has been sent successfully.
            </p>

            <p v-if="submitError" class="contact-form__error">
              {{ submitError }}
            </p>

            <button class="contact-form__button" type="submit" :disabled="isSubmitting">
              <i class="pi pi-send"></i>
              {{ isSubmitting ? "Sending..." : "Send Message" }}
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
import AdminCoverEditor from "../components/common/AdminCoverEditor.vue";
import ContactInfoCard from "../components/contact/ContactInfoCard.vue";
import heroImage from "../assets/images/hero.jpg";
import { useEditableHero } from "../composables/useEditableHero";

const MAX_MESSAGE_LENGTH = 1000;

const { heroImageUrl, heroBackgroundStyle, updateHeroImage } = useEditableHero(
  heroImage,
  "linear-gradient(180deg, rgba(11, 10, 9, 0.24) 0%, rgba(11, 10, 9, 0.5) 100%)",
);

const contactCards = [
  {
    icon: "pi-envelope",
    title: "Email us",
    text: "foodfindersupport@gmail.com",
    href: "mailto:foodfindersupport@gmail.com",
  },
  {
    icon: "pi-map-marker",
    title: "Based in",
    text: "San Francisco, CA",
  },
  {
    icon: "pi-clock",
    title: "Response time",
    text: "Within 24 hours",
  },
];

const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const API_URL = import.meta.env.VITE_API_URL;
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref("");

async function handleSubmit() {
  try {
    isSubmitting.value = true;
    submitSuccess.value = false;
    submitError.value = "";

    const response = await fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error || "Failed to send message.");
    }

    submitSuccess.value = true;
    form.name = "";
    form.email = "";
    form.subject = "";
    form.message = "";
  } catch (error) {
    submitError.value = (error as Error).message || "Failed to send message.";
  } finally {
    isSubmitting.value = false;
  }
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

.faq-card {
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(34, 26, 20, 0.08);
}

.message-panel h2,
.faq-panel h2 {
  margin: 0;
  color: #332d28;
  letter-spacing: 0;
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

.contact-form__counter {
  margin: -4px 2px 0;
  color: #9d9288;
  font-size: 0.85rem;
  text-align: right;
}

.contact-form__error {
  margin: 0;
  color: #c2543f;
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

.contact-form__button:disabled {
  cursor: wait;
  opacity: 0.84;
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

}
</style>
