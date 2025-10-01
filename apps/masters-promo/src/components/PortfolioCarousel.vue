<template>
  <div class="portfolio-carousel">
    <!-- Счетчик фото -->
    <div class="photo-counter">{{ currentIndex + 1 }} из {{ items.length }}</div>
    
    <!-- Навигационные кнопки -->
    <button 
      v-if="items.length > 1 && currentIndex > 0"
      class="nav-arrow nav-arrow--left" 
      @click="prevSlide"
    >
      ‹
    </button>
    <button 
      v-if="items.length > 1 && currentIndex < items.length - 1"
      class="nav-arrow nav-arrow--right" 
      @click="nextSlide"
    >
      ›
    </button>
    
    <!-- Основное изображение -->
    <div class="main-image-wrapper">
      <img 
        v-if="items[currentIndex]?.media_url"
        :src="items[currentIndex].media_url" 
        :alt="`Портфолио ${currentIndex + 1}`"
        class="main-image"
        @load="onImageLoad"
        @error="onImageError"
      />
    </div>
    
    <!-- Превью следующего изображения -->
    <div v-if="currentIndex < items.length - 1" class="next-preview">
      <img 
        :src="items[currentIndex + 1].media_url" 
        :alt="`Следующее ${currentIndex + 2}`"
        class="preview-image"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { MediaItem } from '../types/api';

interface Props {
  items: MediaItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  initialIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false,
  autoplayDelay: 3000,
  initialIndex: 0
});

const currentIndex = ref(props.initialIndex);
let autoplayTimer: number | null = null;

const nextSlide = () => {
  if (currentIndex.value < props.items.length - 1) {
    currentIndex.value++;
  }
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};


const onImageLoad = () => {
  // Изображение загружено успешно
};

const onImageError = (event: Event) => {
  console.error('Ошибка загрузки изображения:', (event.target as HTMLImageElement).src);
};

const startAutoplay = () => {
  if (props.autoplay && props.items.length > 1) {
    autoplayTimer = window.setInterval(() => {
      if (currentIndex.value < props.items.length - 1) {
        nextSlide();
      } else {
        currentIndex.value = 0;
      }
    }, props.autoplayDelay);
  }
};

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
};

// Обработка клавиатуры
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
      prevSlide();
      break;
    case 'ArrowRight':
      nextSlide();
      break;
    case 'Escape':
      // Можно добавить логику закрытия карусели
      break;
  }
};

onMounted(() => {
  startAutoplay();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  stopAutoplay();
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.portfolio-carousel {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

/* Счетчик фото */
.photo-counter {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 16px;
  font-weight: 500;
  z-index: 100;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Навигационные стрелки */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  color: #333;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  font-size: 28px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.nav-arrow:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.nav-arrow--left {
  left: calc(50% - 350px);
}

.nav-arrow--right {
  right: calc(50% - 350px);
}

/* Основное изображение */
.main-image-wrapper {
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  max-width: 90%;
  max-height: 90vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* Превью следующего изображения */
.next-preview {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  height: 60vh;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.next-preview:hover {
  opacity: 1;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .portfolio-carousel {
    height: 100vh;
  }
  
  .main-image-wrapper {
    max-width: 90vw;
  }
  
  .main-image {
    max-width: 80%;
  }
  
  .nav-arrow {
    width: 24px;
    height: 24px;
    font-size: 18px;
    border-radius: 5px;
  }
  
  .nav-arrow--left {
    left: 10px;
  }
  
  .nav-arrow--right {
    right: 10px;
  }
  
  .next-preview {
    display: none;
  }
}
</style>
