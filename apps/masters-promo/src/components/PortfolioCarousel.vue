<template>
  <div class="portfolio-carousel">
    <div class="carousel-container" ref="carouselContainer">
      <div 
        class="carousel-track" 
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div 
          v-for="(item, index) in items" 
          :key="item.mediaId"
          class="carousel-slide"
        >
          <img 
            :src="item.media_url" 
            :alt="`Портфолио ${index + 1}`"
            class="carousel-image"
            @load="onImageLoad"
            @error="onImageError"
          />
        </div>
      </div>
      
      <!-- Навигационные кнопки -->
      <button 
        v-if="items.length > 1"
        class="carousel-btn carousel-btn--prev" 
        @click="prevSlide"
        :disabled="currentIndex === 0"
      >
        ‹
      </button>
      <button 
        v-if="items.length > 1"
        class="carousel-btn carousel-btn--next" 
        @click="nextSlide"
        :disabled="currentIndex === items.length - 1"
      >
        ›
      </button>
    </div>
    
    <!-- Индикаторы -->
    <div v-if="items.length > 1" class="carousel-indicators">
      <button
        v-for="(_, index) in items"
        :key="index"
        class="carousel-indicator"
        :class="{ 'carousel-indicator--active': index === currentIndex }"
        @click="goToSlide(index)"
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
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false,
  autoplayDelay: 3000
});

const currentIndex = ref(0);
const carouselContainer = ref<HTMLElement>();
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

const goToSlide = (index: number) => {
  currentIndex.value = index;
};

const onImageLoad = () => {
  // Можно добавить логику для обработки успешной загрузки изображения
};

const onImageError = (event: Event) => {
  console.warn('Ошибка загрузки изображения:', (event.target as HTMLImageElement).src);
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
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: #f5f5f5;
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease-in-out;
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.carousel-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-btn--prev {
  left: 10px;
}

.carousel-btn--next {
  right: 10px;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.carousel-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: #ddd;
  cursor: pointer;
  transition: all 0.2s ease;
}

.carousel-indicator--active {
  background: #007bff;
  transform: scale(1.2);
}

.carousel-indicator:hover {
  background: #007bff;
}

/* Адаптивность */
@media (max-width: 768px) {
  .carousel-container {
    height: 300px;
  }
  
  .carousel-btn {
    width: 35px;
    height: 35px;
    font-size: 16px;
  }
  
  .carousel-btn--prev {
    left: 5px;
  }
  
  .carousel-btn--next {
    right: 5px;
  }
}
</style>
