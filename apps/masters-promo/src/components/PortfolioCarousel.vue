<template>
  <div class="portfolio-carousel">
    <div class="carousel-layout">
      <!-- Основное изображение -->
      <div class="main-image-container">
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
        
        <!-- Навигационные кнопки на основном изображении -->
        <button 
          v-if="items.length > 1 && currentIndex > 0"
          class="nav-arrow nav-arrow--left" 
          @click="prevSlide"
        >
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.18693 7.52021C3.99167 7.71547 3.67508 7.71547 3.47982 7.52021L0.146488 4.18688C-0.0487738 3.99161 -0.0487738 3.67503 0.146489 3.47977L3.47982 0.146437C3.67508 -0.0488257 3.99167 -0.0488257 4.18693 0.146437C4.38219 0.341698 4.38219 0.658281 4.18693 0.853543L1.70715 3.33332L9.83337 3.33332C10.1095 3.33332 10.3334 3.55718 10.3334 3.83332C10.3334 4.10947 10.1095 4.33332 9.83337 4.33332L1.70715 4.33332L4.18693 6.8131C4.38219 7.00836 4.38219 7.32495 4.18693 7.52021Z" fill="#262626"/>
          </svg>
        </button>
        <button 
          v-if="items.length > 1 && currentIndex < items.length - 1"
          class="nav-arrow nav-arrow--right" 
          @click="nextSlide"
        >
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.14645 0.146447C6.34171 -0.0488155 6.65829 -0.0488155 6.85355 0.146447L10.1869 3.47978C10.3821 3.67504 10.3821 3.99162 10.1869 4.18689L6.85355 7.52022C6.65829 7.71548 6.34171 7.71548 6.14645 7.52022C5.95118 7.32496 5.95118 7.00837 6.14645 6.81311L8.62623 4.33333H0.5C0.223858 4.33333 0 4.10948 0 3.83333C0 3.55719 0.223858 3.33333 0.5 3.33333H8.62623L6.14645 0.853553C5.95118 0.658291 5.95118 0.341709 6.14645 0.146447Z" fill="#262626"/>
          </svg>
        </button>
      </div>
      
      <!-- Миниатюры справа -->
      <div class="thumbnails-container" v-if="items.length > 1">
        <div class="thumbnails-scroll" ref="thumbnailsContainer">
          <div 
            v-for="(item, index) in items" 
            :key="item.mediaId"
            class="thumbnail"
            :class="{ 'thumbnail--active': index === currentIndex }"
            @click="goToSlide(index)"
            :ref="el => { if (el) thumbnailRefs[index] = el }"
          >
            <img 
              :src="item.media_url" 
              :alt="`Миниатюра ${index + 1}`"
              class="thumbnail-image"
              @contextmenu.prevent
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
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
const thumbnailsContainer = ref<HTMLElement | null>(null);
const thumbnailRefs = ref<any[]>([]);
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

const scrollToActiveThumbnail = async () => {
  await nextTick();
  
  if (thumbnailsContainer.value && thumbnailRefs.value[currentIndex.value]) {
    const container = thumbnailsContainer.value;
    const activeThumbnail = thumbnailRefs.value[currentIndex.value];
    
    if (!activeThumbnail) return;
    
    const containerRect = container.getBoundingClientRect();
    const thumbnailRect = activeThumbnail.getBoundingClientRect();
    
    // Проверяем, мобильная ли версия (горизонтальная прокрутка)
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Горизонтальная прокрутка для мобильных
      const scrollLeft = container.scrollLeft;
      const containerWidth = containerRect.width;
      const thumbnailWidth = thumbnailRect.width;
      
      const visibleThumbnails = Math.floor(containerWidth / (thumbnailWidth + 12)); // +12 для gap
      const currentPage = Math.floor(currentIndex.value / visibleThumbnails);
      const targetScrollLeft = currentPage * visibleThumbnails * (thumbnailWidth + 12);
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    } else {
      // Вертикальная прокрутка для десктопа
      const scrollTop = container.scrollTop;
      const containerHeight = containerRect.height;
      const thumbnailHeight = thumbnailRect.height;
      
      const visibleThumbnails = Math.floor(containerHeight / (thumbnailHeight + 10)); // +10 для gap
      const currentPage = Math.floor(currentIndex.value / visibleThumbnails);
      const targetScrollTop = currentPage * visibleThumbnails * (thumbnailHeight + 10);
      
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }
};

const goToSlide = (index: number) => {
  currentIndex.value = index;
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

// Watcher для автоматической прокрутки миниатюр
watch(currentIndex, () => {
  scrollToActiveThumbnail();
});

onMounted(() => {
  startAutoplay();
  document.addEventListener('keydown', handleKeydown);
  
  // Инициализация прокрутки после монтирования
  nextTick(() => {
    scrollToActiveThumbnail();
  });
});

onUnmounted(() => {
  stopAutoplay();
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.portfolio-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.carousel-layout {
  display: flex;
  width: 100%;
  height: 600px;
  min-height: 600px;
}

/* Основное изображение */
.main-image-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 5px;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
}

.image-placeholder {
  color: #666;
  font-size: 18px;
  padding: 40px;
}

/* Навигационные стрелки на основном изображении */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.nav-arrow svg {
  width: 14px;
  height: auto;
}

.nav-arrow svg path {
  transition: fill 0.2s ease;
}

.nav-arrow:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.nav-arrow--left {
  left: 20px;
}

.nav-arrow--right {
  right: 20px;
}

/* Контейнер миниатюр */
.thumbnails-container {
  width: 140px;
  min-width: 140px;
  height: 600px;
  background: #ffffff;
  border-left: 1px solid #e0e0e0;
  padding: 5px 5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.thumbnails-scroll {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d0d0d0 transparent;
  padding-right: 4px;
}

.thumbnails-scroll::-webkit-scrollbar {
  width: 4px;
}

.thumbnails-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.thumbnails-scroll::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 2px;
}

/* Миниатюры */
.thumbnail {
  flex: 0 0 auto;
  aspect-ratio: 3/4;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;
  border: 2px solid #ffffff;
  position: relative;
  background: #f5f5f5;
}

.thumbnail:hover {
  transform: scale(1.02);
  border-color: #e0e0e0;
}

.thumbnail--active {
  border-color: #FFB800 !important;
  border-width: 3px;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
}

/* Адаптивность */
@media (max-width: 768px) {
  .carousel-layout {
    flex-direction: column;
    min-height: 400px;
  }
  
  .main-image-container {
    flex: 1;
    min-height: 300px;
  }
  
  .main-image {
    border-radius: 4px 4px 4px 4px;
  }
  
  .thumbnails-container {
    width: 100%;
    height: 100px;
    border-left: none;
    border-top: 1px solid #e0e0e0;
    padding: 10px 0;
  }
  
  .thumbnails-scroll {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 10px;
    gap: 8px;
  }
  
  .thumbnail {
    flex: 0 0 80px;
    width: 80px;
  }
  
  .nav-arrow {
    width: 32px;
    height: 32px;
  }
  
  .nav-arrow svg {
    width: 14px;
  }
  
  .nav-arrow--left {
    left: 10px;
  }
  
  .nav-arrow--right {
    right: 10px;
  }
}
</style>
