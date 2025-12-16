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
    <div class="image-container">
      <!-- Wrapper для изображения с элементами управления -->
      <div class="image-wrapper">
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
        
        <!-- Навигационная кнопка влево (мобильная) - внутри wrapper -->
        <button 
          v-show="items.length > 1"
          class="nav-arrow nav-arrow--left nav-arrow--mobile" 
          :style="{ visibility: currentIndex === 0 ? 'hidden' : 'visible' }"
          @click="prevSlide"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 0.292893C8.09763 0.683417 8.09763 1.31658 7.70711 1.70711L2.41421 7L7.70711 12.2929C8.09763 12.6834 8.09763 13.3166 7.70711 13.7071C7.31658 14.0976 6.68342 14.0976 6.29289 13.7071L0.292893 7.70711C-0.0976311 7.31658 -0.0976311 6.68342 0.292893 6.29289L6.29289 0.292893C6.68342 -0.0976311 7.31658 -0.0976311 7.70711 0.292893Z" fill="#262626"/>
          </svg>
        </button>
        
        <!-- Навигационная кнопка вправо (мобильная) -->
        <button 
          v-show="items.length > 1"
          class="nav-arrow nav-arrow--right nav-arrow--mobile" 
          :style="{ visibility: currentIndex === items.length - 1 ? 'hidden' : 'visible' }"
          @click="nextSlide"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.292893 13.7071C-0.0976311 13.3166 -0.0976311 12.6834 0.292893 12.2929L5.58579 7L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7.70711 6.29289C8.09763 6.68342 8.09763 7.31658 7.70711 7.70711L1.70711 13.7071C1.31658 14.0976 0.683417 14.0976 0.292893 13.7071Z" fill="#262626"/>
          </svg>
        </button>
        
        <!-- Счётчик изображений -->
        <div class="image-counter" v-if="items.length > 1">
          {{ currentIndex + 1 }} / {{ items.length }}
        </div>
        
        <!-- Кнопка закрытия -->
        <button 
          v-if="showCloseButton" 
          class="close-btn" 
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
  border-radius: 8px;
  border: 4px solid white;
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

/* Счётчик изображений */
.image-counter {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

/* Кнопка закрытия */
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  line-height: 1;
}

.close-btn:hover {
  background: #f5f5f5;
}

/* Адаптивность - мобильная версия */
@media (max-width: 768px) {
  .portfolio-carousel {
    padding: 0;
    gap: 0;
  }

  .image-container {
    max-width: 100%;
    width: 100%;
  }

  .image-wrapper {
    width: 100%;
  }

  .main-image {
    max-height: 70vh;
    width: 100%;
    border-radius: 8px;
    border: 4px solid white;
  }

  /* Скрыть десктопные стрелки, показать мобильные */
  .nav-arrow--desktop {
    display: none;
  }

  .nav-arrow--mobile {
    display: flex;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    z-index: 10;
  }

  .nav-arrow--mobile.nav-arrow--left {
    left: 12px;
  }

  .nav-arrow--mobile.nav-arrow--right {
    right: 12px;
  }

  .image-counter {
    bottom: 12px;
    font-size: 12px;
  }
}
</style>
