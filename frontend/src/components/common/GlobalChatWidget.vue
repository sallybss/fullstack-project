<template>
  <aside class="chat-widget" aria-label="Recipe assistant">
    <button
      v-if="!isOpen"
      class="chat-launcher"
      type="button"
      aria-label="Open Cooking Genie chat"
      @click="isOpen = true"
    >
      <img class="chat-launcher__avatar" :src="genieAvatar" alt="Cooking Genie avatar" />
      <span>Cooking Genie</span>
    </button>

    <section v-else class="chat-panel">
      <header class="chat-panel__header">
        <div class="chat-panel__title">
          <button class="chat-panel__iconButton" type="button" aria-label="Minimize chat" @click="isOpen = false">
            <i class="pi pi-angle-down"></i>
          </button>
          <img class="chat-panel__avatar" :src="genieAvatar" alt="Cooking Genie avatar" />
          <div>
            <p>Cooking Genie</p>
            <span>Online now</span>
          </div>
        </div>

        <button class="chat-panel__iconButton" type="button" aria-label="Clear chat" @click="resetChat">
          <i class="pi pi-refresh"></i>
        </button>
      </header>

      <div ref="messagesRef" class="chat-panel__messages">
        <article
          v-for="entry in messages"
          :key="entry.id"
          :class="['chat-message', `chat-message--${entry.role}`]"
        >
          <img
            v-if="entry.role === 'assistant'"
            class="chat-message__avatar"
            :src="genieAvatar"
            alt="Cooking Genie avatar"
          />
          <div :class="['chat-bubble', `chat-bubble--${entry.role}`]">
            <p class="chat-bubble__text">{{ entry.text }}</p>
          </div>
        </article>

        <article v-if="isLoading" class="chat-message chat-message--assistant">
          <img class="chat-message__avatar" :src="genieAvatar" alt="Cooking Genie avatar" />
          <div class="chat-bubble chat-bubble--assistant">
            <p class="chat-bubble__text">Thinking...</p>
          </div>
        </article>
      </div>

      <form class="chat-panel__composer" @submit.prevent="handleSubmit">
        <textarea
          v-model="draft"
          rows="2"
          maxlength="1000"
          placeholder="Your message"
          :disabled="isLoading"
        ></textarea>

        <div class="chat-panel__composerFooter">
          <span>{{ draft.length }}/1000</span>
          <button type="submit" :disabled="isLoading || !trimmedDraft" aria-label="Send message">
            <i class="pi pi-send"></i>
          </button>
        </div>

        <p v-if="errorMessage" class="chat-panel__error">
          {{ errorMessage }}
        </p>
      </form>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import genieAvatar from "../../assets/images/genie.png";
import { sendChatMessage } from "../../services/chatService";

type ChatEntry = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const starterMessages: ChatEntry[] = [
  {
    id: 1,
    role: "assistant",
    text: "Hi, I’m your Cooking Genie. What ingredients do you have?",
  },
  {
    id: 2,
    role: "assistant",
    text: "I can suggest recipes, substitutions, and fast meal ideas.",
  },
];

const messagesRef = ref<HTMLElement | null>(null);
const draft = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const isOpen = ref(true);
const nextMessageId = ref(3);
const messages = ref<ChatEntry[]>([...starterMessages]);

const trimmedDraft = computed(() => draft.value.trim());

function appendMessage(role: ChatEntry["role"], text: string) {
  messages.value.push({
    id: nextMessageId.value++,
    role,
    text,
  });
}

async function scrollToBottom() {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
}

async function handleSubmit() {
  if (!trimmedDraft.value || isLoading.value) {
    return;
  }

  const message = trimmedDraft.value;
  appendMessage("user", message);
  draft.value = "";
  errorMessage.value = "";
  isLoading.value = true;
  await scrollToBottom();

  try {
    const reply = await sendChatMessage(message);
    appendMessage("assistant", reply);
  } catch (error) {
    errorMessage.value = (error as Error).message || "Failed to send chat message.";
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
}

function resetChat() {
  messages.value = [...starterMessages];
  nextMessageId.value = 3;
  draft.value = "";
  errorMessage.value = "";
}
</script>

<style scoped lang="scss">
.chat-widget {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 40;
}

.chat-launcher {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff724c, #ff8c67);
  color: #fff;
  padding: 13px 16px;
  box-shadow: 0 18px 38px rgba(255, 114, 76, 0.28);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.chat-launcher__avatar {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 999px;
  object-fit: cover;
  object-position: center;
  transform: scale(1.18);
  box-shadow: 0 0 0 5px rgba(255, 206, 187, 0.22);
}

.chat-panel {
  width: min(330px, calc(100vw - 24px));
  height: min(500px, calc(100vh - 100px));
  display: grid;
  grid-template-rows: auto 1fr auto;
  border-radius: 22px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 22px 56px rgba(94, 47, 29, 0.18);
  border: 1px solid rgba(255, 114, 76, 0.14);
}

.chat-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #ff724c, #ff8c67);
  color: #fff;
}

.chat-panel__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-panel__title p {
  margin: 0;
  font-weight: 700;
}

.chat-panel__avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 999px;
  object-fit: cover;
  object-position: center;
  background: transparent;
  padding: 0;
  overflow: hidden;
  transform: scale(1.22);
}

.chat-panel__title span {
  display: block;
  margin-top: 2px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.8);
}

.chat-panel__iconButton {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  cursor: pointer;
}

.chat-panel__messages {
  display: grid;
  align-content: start;
  gap: 10px;
  overflow-y: auto;
  padding: 14px 12px;
  background:
    radial-gradient(circle at top right, rgba(255, 114, 76, 0.08), transparent 28%),
    #fffaf7;
}

.chat-message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.chat-message--assistant {
  justify-self: start;
}

.chat-message--user {
  justify-self: end;
}

.chat-message__avatar {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 999px;
  object-fit: cover;
  object-position: center;
  background: transparent;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(94, 47, 29, 0.08);
  transform: scale(1.22);
}

.chat-bubble {
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  box-shadow: 0 8px 18px rgba(94, 47, 29, 0.06);
}

.chat-bubble--assistant {
  background: #fff1eb;
  color: #40261b;
  border-bottom-left-radius: 6px;
}

.chat-bubble--user {
  background: #ff724c;
  color: #fff;
  border-bottom-right-radius: 6px;
}

.chat-bubble__text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.55;
  font-size: 0.92rem;
}

.chat-panel__composer {
  padding: 10px;
  border-top: 1px solid rgba(255, 114, 76, 0.14);
  background: #fff;
}

.chat-panel__composer textarea {
  width: 100%;
  resize: none;
  border: 0;
  padding: 8px 10px 0;
  font: inherit;
  color: #1f2633;
  background: transparent;
  font-size: 0.94rem;
}

.chat-panel__composer textarea:focus {
  outline: none;
}

.chat-panel__composerFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 4px;
}

.chat-panel__composerFooter span {
  color: #9a786a;
  font-size: 0.8rem;
}

.chat-panel__composerFooter button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: #ff724c;
  color: #fff;
  cursor: pointer;
}

.chat-panel__composerFooter button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.chat-panel__error {
  margin: 0;
  padding: 0 8px 6px;
  color: #be3a27;
  font-size: 0.86rem;
}

@media (max-width: 640px) {
  .chat-widget {
    right: 12px;
    left: 12px;
    bottom: 12px;
  }

  .chat-panel {
    width: 100%;
    height: min(72vh, 620px);
  }

  .chat-launcher {
    width: 100%;
    justify-content: center;
  }
}
</style>
