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
          ←
        </button>
        <button 
          v-if="items.length > 1 && currentIndex < items.length - 1"
          class="nav-arrow nav-arrow--right" 
          @click="nextSlide"
        >
          →
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
const thumbnailRefs = ref<HTMLElement[]>([]);
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
.portfolio-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 12px;
  overflow: hidden;
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
  padding: 20px;
  background: #000;
}

.main-image {
  max-width: calc(100% - 40px);
  max-height: 560px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.image-placeholder {
  color: white;
  font-size: 18px;
  padding: 40px;
}

/* Навигационные стрелки на основном изображении */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 200px;
  height: 600px;
  background: rgba(0, 0, 0, 0.8);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 10px;
  overflow: hidden;
}

.thumbnails-scroll {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 560px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.thumbnails-scroll::-webkit-scrollbar {
  width: 4px;
}

.thumbnails-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.thumbnails-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

/* Миниатюры */
.thumbnail {
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
}

.thumbnail:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.5);
}

.thumbnail--active {
  border-color: white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  
  .thumbnails-container {
    width: 100%;
    height: 100px;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 10px;
  }
  
  .thumbnails-scroll {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  .thumbnail {
    flex: 0 0 80px;
    width: 80px;
  }
  
  .nav-arrow {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .nav-arrow--left {
    left: 10px;
  }
  
  .nav-arrow--right {
    right: 10px;
  }
}
</style>
