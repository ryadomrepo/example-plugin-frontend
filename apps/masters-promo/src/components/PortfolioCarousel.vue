<template>
  <div class="portfolio-carousel">
    <!-- Навигационная кнопка влево (десктоп) -->
    <button 
      v-show="items.length > 1"
      class="nav-arrow nav-arrow--left nav-arrow--desktop" 
      :style="{ visibility: currentIndex === 0 ? 'hidden' : 'visible' }"
      @click="prevSlide"
    >
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 0.292893C8.09763 0.683417 8.09763 1.31658 7.70711 1.70711L2.41421 7L7.70711 12.2929C8.09763 12.6834 8.09763 13.3166 7.70711 13.7071C7.31658 14.0976 6.68342 14.0976 6.29289 13.7071L0.292893 7.70711C-0.0976311 7.31658 -0.0976311 6.68342 0.292893 6.29289L6.29289 0.292893C6.68342 -0.0976311 7.31658 -0.0976311 7.70711 0.292893Z" fill="#262626"/>
      </svg>
    </button>
    
    <!-- Изображение -->
    <div 
      class="image-container"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <!-- Wrapper для изображения с элементами управления -->
      <div class="image-wrapper">
        <!-- Мобильная шапка - поверх изображения сверху -->
        <div class="mobile-header">
          <div class="mobile-counter" v-if="items.length > 1">
            {{ currentIndex + 1 }} из {{ items.length }}
          </div>
          <button 
            v-if="showCloseButton" 
            class="mobile-close-btn" 
            @click="emit('close')"
          >
            ×
          </button>
        </div>

        <img 
          v-if="items[currentIndex]?.media_url"
          :src="items[currentIndex].media_url" 
          :alt="`Портфолио ${currentIndex + 1}`"
          class="main-image"
          @load="onImageLoad"
          @error="onImageError"
          @contextmenu.prevent
          draggable="false"
        />
        <div v-else class="image-placeholder">
          Загрузка изображения...
        </div>
        
        <!-- Счётчик изображений (десктоп) -->
        <div class="image-counter image-counter--desktop" v-if="items.length > 1">
          {{ currentIndex + 1 }} из {{ items.length }}
        </div>
        
        <!-- Кнопка закрытия (десктоп) -->
        <button 
          v-if="showCloseButton" 
          class="close-btn close-btn--desktop" 
          @click="emit('close')"
        >
          ×
        </button>
      </div>
    </div>
    
    <!-- Навигационная кнопка вправо (десктоп) -->
    <button 
      v-show="items.length > 1"
      class="nav-arrow nav-arrow--right nav-arrow--desktop" 
      :style="{ visibility: currentIndex === items.length - 1 ? 'hidden' : 'visible' }"
      @click="nextSlide"
    >
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.292893 13.7071C-0.0976311 13.3166 -0.0976311 12.6834 0.292893 12.2929L5.58579 7L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7.70711 6.29289C8.09763 6.68342 8.09763 7.31658 7.70711 7.70711L1.70711 13.7071C1.31658 14.0976 0.683417 14.0976 0.292893 13.7071Z" fill="#262626"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { MediaItem } from '../types/api';

interface Props {
  items: MediaItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  showCloseButton?: boolean;
}

const emit = defineEmits<{
  close: [];
}>();

const props = withDefaults(defineProps<Props>(), {
  autoplay: false,
  autoplayDelay: 3000,
  showCloseButton: false,
});

const currentIndex = ref(0);
let autoplayTimer: number | null = null;

// Предзагрузка всех изображений при монтировании
const preloadAllImages = () => {
  props.items.forEach((item) => {
    if (item.media_url) {
      const img = new Image();
      img.src = item.media_url;
    }
  });
};

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
  }
};

// Обработка свайпа для мобильных устройств
let touchStartX = 0;
let touchEndX = 0;

const handleTouchStart = (event: TouchEvent) => {
  touchStartX = event.changedTouches[0].screenX;
};

const handleTouchEnd = (event: TouchEvent) => {
  touchEndX = event.changedTouches[0].screenX;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Свайп влево - следующий слайд
      nextSlide();
    } else {
      // Свайп вправо - предыдущий слайд
      prevSlide();
    }
  }
};

onMounted(() => {
  preloadAllImages();
  startAutoplay();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  stopAutoplay();
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.portfolio-carousel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  padding: 40px;
  box-sizing: border-box;
  background: transparent;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Контейнер изображения */
.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: calc(100% - 120px);
  max-height: 100%;
}

/* Wrapper для позиционирования элементов относительно изображения */
.image-wrapper {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.main-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 16px;
  border: none;
  box-sizing: border-box;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
}

.image-placeholder {
  color: #999;
  font-size: 18px;
  padding: 40px;
}

/* Навигационные стрелки */
.nav-arrow {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.nav-arrow svg {
  width: 8px;
  height: 14px;
}

.nav-arrow svg path {
  fill: #262626;
  transition: fill 0.2s ease;
}

.nav-arrow:hover {
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

.nav-arrow:active {
  opacity: 0.8;
}

/* Десктоп стрелки видны, мобильные скрыты по умолчанию */
.nav-arrow--mobile {
  display: none;
}

/* Счётчик изображений - сверху по центру */
.image-counter {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: transparent;
  color: white;
  padding: 0;
  border-radius: 0;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
}

/* Кнопка закрытия - в правом верхнем углу экрана */
.close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: none;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  background: transparent;
  opacity: 1;
}

/* Мобильная шапка - скрыта на десктопе */
.mobile-header {
  display: none;
}

/* Десктоп версия каунтера и крестика */
.image-counter--desktop,
.close-btn--desktop {
  display: flex;
}

/* Адаптивность - мобильная версия */
@media (max-width: 768px) {
  .portfolio-carousel {
    padding: 0;
    gap: 0;
    flex-direction: column;
    height: 100%;
    background: transparent;
    position: relative;
  }

  /* Мобильная шапка - над изображением */
  .mobile-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 16px;
    background: transparent;
    position: absolute;
    top: -40px;
    left: 0;
    right: 0;
    z-index: 20;
    box-sizing: border-box;
  }

  .mobile-counter {
    font-size: 14px;
    font-weight: 500;
    color: white;
  }

  .mobile-close-btn {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: white;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-container {
    max-width: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-wrapper {
    width: 100%;
    max-width: 100%;
    display: block;
    position: relative;
    overflow: visible;
  }

  .main-image {
    max-height: 100%;
    max-width: 100%;
    width: auto;
    height: auto;
    border-radius: 0;
    border: none;
    object-fit: contain;
  }

  /* Скрыть десктопные элементы */
  .nav-arrow--desktop {
    display: none;
  }

  .image-counter--desktop {
    display: none;
  }

  .close-btn--desktop {
    display: none;
  }
}
</style>
