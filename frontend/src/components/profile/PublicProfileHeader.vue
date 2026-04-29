<script setup lang="ts">
import BaseButton from "../common/BaseButton.vue";

defineProps<{
  username: string;
  bio: string;
  avatarSrc: string;
  ownerInitial: string;
  recipeCount: number;
  savedCount: number;
  followerCount: number;
  followingCount: number;
  canFollow: boolean;
  isFollowing: boolean;
}>();

const emit = defineEmits<{
  follow: [];
  openPeople: [type: "followers" | "following"];
}>();
</script>

<template>
  <div class="profile-top">
    <div class="left">
      <div class="avatar">
        <img v-if="avatarSrc" :src="avatarSrc" alt="Profile avatar" class="avatarImage" />
        <span v-else>{{ ownerInitial }}</span>
      </div>

      <div class="meta">
        <h1 class="name">{{ username }}</h1>
        <p class="sub">
          Member profile - <b>{{ recipeCount }}</b> recipes posted
        </p>
      </div>
    </div>

    <div class="right">
      <BaseButton
        v-if="canFollow"
        :variant="isFollowing ? 'outline' : 'primary'"
        type="button"
        @click="emit('follow')"
      >
        {{ isFollowing ? "Following" : "Follow" }}
      </BaseButton>

      <button class="stat stat--button" type="button" @click="emit('openPeople', 'followers')">
        <i class="pi pi-users"></i>
        <span><b>{{ followerCount }}</b> followers</span>
      </button>

      <button class="stat stat--button" type="button" @click="emit('openPeople', 'following')">
        <i class="pi pi-share-alt"></i>
        <span><b>{{ followingCount }}</b> following</span>
      </button>

      <div class="stat">
        <i class="pi pi-book"></i>
        <span><b>{{ recipeCount }}</b> recipes</span>
      </div>

      <div class="stat">
        <i class="pi pi-bookmark"></i>
        <span><b>{{ savedCount }}</b> saved</span>
      </div>
    </div>
  </div>

  <p class="bio">
    {{ bio }}
  </p>
</template>

<style scoped>
.profile-top {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
}

.left {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar {
  width: 54px;
  height: 54px;
  aspect-ratio: 1 / 1;
  flex: 0 0 54px;
  border-radius: 50%;
  background: #f1f1f6;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #333;
  overflow: hidden;
}

.avatarImage {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.meta {
  display: grid;
  gap: 4px;
}

.name {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.sub {
  margin: 0;
  color: #888;
  font-size: 13px;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  justify-content: flex-end;
  flex-shrink: 0;
}

.stat {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f6f6fb;
  color: #333;
  font-size: 13px;
  white-space: nowrap;
}

.stat--button {
  border: 0;
  cursor: pointer;
}

.bio {
  margin: 14px 0 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 1100px) {
  .profile-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .right {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

@media (max-width: 520px) {
  .profile-top {
    gap: 14px;
    margin-top: 14px;
  }

  .left {
    width: 100%;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    width: 58px;
    height: 58px;
    flex-basis: 58px;
  }

  .meta {
    min-width: 0;
    gap: 6px;
  }

  .name {
    font-size: 20px;
    line-height: 1.05;
  }

  .sub {
    font-size: 12px;
    line-height: 1.45;
  }

  .right {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
  }

  .right > * {
    min-width: 0;
  }

  .right :deep(.baseButton),
  .right :deep(button.baseButton) {
    width: 100%;
  }

  .stat {
    justify-content: center;
    padding: 12px 10px;
    text-align: center;
    white-space: normal;
    line-height: 1.35;
  }

  .bio {
    margin-top: 16px;
    font-size: 15px;
    line-height: 1.6;
  }
}
</style>
