<script setup lang="ts">
import type { RecipeComment } from "../../interfaces/recipe";

defineProps<{
  comments: RecipeComment[];
  visibleComments: RecipeComment[];
  remainingCommentCount: number;
  showAllComments: boolean;
  commentText: string;
  commentError: string;
  editingCommentId: string;
  editingCommentText: string;
  canEditComment: (commentUserId: string) => boolean;
  canDeleteComment: (commentUserId: string) => boolean;
  commentAvatarSrc: (avatarUrl?: string) => string;
  commentInitials: (username: string) => string;
  formatDate: (value?: string) => string;
}>();

const emit = defineEmits<{
  "update:commentText": [value: string];
  "update:editingCommentText": [value: string];
  "update:showAllComments": [value: boolean];
  submit: [];
  startEditing: [comment: RecipeComment];
  cancelEditing: [];
  saveEditing: [];
  deleteComment: [commentId: string];
}>();
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h2>Comments</h2>
      <p v-if="commentError" class="error">{{ commentError }}</p>
    </div>

    <div class="box">
      <textarea
        :value="commentText"
        class="comment-input"
        rows="4"
        placeholder="Share your thoughts about this recipe"
        @input="emit('update:commentText', ($event.target as HTMLTextAreaElement).value)"
      />

      <div class="comment-actions">
        <button class="primary-btn" type="button" @click="emit('submit')">
          Post comment
        </button>
      </div>
    </div>

    <div v-if="comments.length === 0" class="box box--spaced">
      No comments yet.
    </div>

    <div v-else-if="remainingCommentCount > 0" class="comment-toggle">
      <button
        class="link-btn comment-toggle__btn"
        type="button"
        @click="emit('update:showAllComments', !showAllComments)"
      >
        {{ showAllComments ? "Show fewer comments" : `See more comments (${remainingCommentCount})` }}
      </button>
    </div>

    <article
      v-for="comment in visibleComments"
      :key="comment._id"
      class="box comment-item"
    >
      <div class="comment-top">
        <div class="comment-meta">
          <div class="comment-avatar">
            <img
              v-if="commentAvatarSrc(comment.avatarUrl)"
              :src="commentAvatarSrc(comment.avatarUrl)"
              alt="Comment avatar"
              class="comment-avatar__image"
            />
            <span v-else>{{ commentInitials(comment.username) }}</span>
          </div>

          <div>
            <strong>{{ comment.username }}</strong>
            <p class="comment-date">{{ formatDate(comment.createdAt) }}</p>
          </div>
        </div>

        <div
          v-if="canEditComment(comment.user) || canDeleteComment(comment.user)"
          class="comment-tools"
        >
          <button
            v-if="canEditComment(comment.user)"
            class="link-btn"
            type="button"
            @click="emit('startEditing', comment)"
          >
            Edit
          </button>

          <button
            v-if="canDeleteComment(comment.user)"
            class="link-btn"
            type="button"
            @click="emit('deleteComment', comment._id)"
          >
            Delete
          </button>
        </div>
      </div>

      <template v-if="editingCommentId === comment._id">
        <textarea
          :value="editingCommentText"
          class="comment-input comment-input--inline"
          rows="3"
          @input="emit('update:editingCommentText', ($event.target as HTMLTextAreaElement).value)"
        />

        <div class="comment-actions">
          <button class="link-btn" type="button" @click="emit('cancelEditing')">
            Cancel
          </button>
          <button class="primary-btn" type="button" @click="emit('saveEditing')">
            Save
          </button>
        </div>
      </template>

      <p v-else class="comment-text">{{ comment.text }}</p>
    </article>
  </section>
</template>

<style scoped>
.box {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.box--spaced {
  margin-top: 16px;
}

.section {
  margin-top: 22px;
}

.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
  resize: vertical;
  font: inherit;
}

.comment-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.comment-item + .comment-item {
  margin-top: 16px;
}

.comment-toggle {
  margin-top: 16px;
}

.comment-toggle__btn {
  padding: 0;
  font-weight: 600;
}

.comment-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #f1f1f6;
  color: #333;
  display: grid;
  place-items: center;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}

.comment-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.comment-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-date {
  margin: 4px 0 0;
  color: #777;
  font-size: 13px;
}

.comment-text {
  margin: 12px 0 0;
  color: #333;
  line-height: 1.5;
}

.comment-input--inline {
  margin-top: 12px;
}

.primary-btn,
.link-btn {
  border: 0;
  cursor: pointer;
  font: inherit;
}

.primary-btn {
  padding: 10px 16px;
  border-radius: 999px;
  background: #ff724c;
  color: #fff;
}

.link-btn {
  background: transparent;
  color: #ff724c;
}

.error {
  color: #c62828;
}

@media (max-width: 640px) {
  .box {
    border-radius: 18px;
  }

  .section__head,
  .comment-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .comment-tools {
    gap: 10px;
    justify-content: flex-start;
  }
}
</style>
