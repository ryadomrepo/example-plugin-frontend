<template>
  <div class="portfolio-widget">
    <!-- Состояние загрузки - skeleton -->
    <div v-if="loadingState.isLoading" class="portfolio-content">
      <div class="portfolio-header">
        <h3 class="portfolio-title">Портфолио</h3>
      </div>
      <div class="portfolio-gallery">
        <div class="portfolio-scroll-container">
          <div class="portfolio-scroll">
            <div v-for="i in 4" :key="i" class="portfolio-card skeleton-card">
              <div class="skeleton-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Состояние ошибки -->
    <div v-else-if="loadingState.error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Ошибка загрузки</h3>
      <p v-if="loadingState.error.includes('404') || loadingState.error.includes('не найден')">
        Мастер с ID <strong>{{ props.staffId }}</strong> не найден в системе.
        <br>Проверьте правильность ID или попробуйте другой.
      </p>
      <p v-else>{{ loadingState.error }}</p>
      <button @click="retryLoad" class="retry-btn">Попробовать снова</button>
    </div>
    
    <!-- Основной контент -->
    <div v-else-if="allItems.length > 0" class="portfolio-content">
      <div class="portfolio-header">
        <h3 class="portfolio-title">Портфолио</h3>
      </div>
      
      <!-- Горизонтальная прокрутка изображений с навигацией -->
      <div class="portfolio-gallery">
        <!-- Кнопка влево -->
        <button 
          v-if="canScrollLeft"
          class="nav-btn nav-prev" 
          @click.prevent="scrollLeft"
          type="button"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.70711 0.292893C8.09763 0.683417 8.09763 1.31658 7.70711 1.70711L2.41421 7L7.70711 12.2929C8.09763 12.6834 8.09763 13.3166 7.70711 13.7071C7.31658 14.0976 6.68342 14.0976 6.29289 13.7071L0.292893 7.70711C-0.0976311 7.31658 -0.0976311 6.68342 0.292893 6.29289L6.29289 0.292893C6.68342 -0.0976311 7.31658 -0.0976311 7.70711 0.292893Z" fill="#262626"/>
          </svg>
        </button>
        
        <div class="portfolio-scroll-container" ref="scrollContainer">
          <div class="portfolio-scroll">
            <div 
              v-for="(item, index) in allItems" 
              :key="item.mediaId"
              class="portfolio-card"
              @click="openCarousel(index)"
            >
              <img 
                :src="item.media_url" 
                :alt="`Работа ${index + 1}`"
                class="portfolio-image"
                style="width: 100%; height: 100%; object-fit: cover;"
                @load="(e: Event) => (e.target as HTMLImageElement)?.classList.add('loaded')"
                @contextmenu.prevent
                draggable="false"
              />
            </div>
          </div>
        </div>
        
        <!-- Кнопка вправо -->
        <button 
          v-if="canScrollRight"
          class="nav-btn nav-next" 
          @click.prevent="scrollRight"
          type="button"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.292893 13.7071C-0.0976311 13.3166 -0.0976311 12.6834 0.292893 12.2929L5.58579 7L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7.70711 6.29289C8.09763 6.68342 8.09763 7.31658 7.70711 7.70711L1.70711 13.7071C1.31658 14.0976 0.683417 14.0976 0.292893 13.7071Z" fill="#262626"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Пустое состояние -->
    <div v-else class="empty-state">
      <div class="empty-icon">📷</div>
      <p>Портфолио пока пусто</p>
    </div>
    
    <!-- Модальное окно с каруселью -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <PortfolioCarousel 
          v-if="carouselItems.length > 0"
          :items="carouselItems"
          :autoplay="false"
          :showCloseButton="true"
          @close="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { Collection, LoadingState } from '../types/api';
import { CharmDirectApiService } from '../services/api';
import { LoggerUtil } from '../utils/logger';
import PortfolioCarousel from './PortfolioCarousel.vue';

interface Props {
  staffId: string;
}

const props = defineProps<Props>();

// Реактивные данные
const collections = ref<Collection[]>([]);
const loadingState = ref<LoadingState>({
  isLoading: false,
  error: null
});
const showModal = ref(false);
const selectedCollection = ref<Collection | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(true);

// Переменные для drag-to-scroll
const isDragging = ref(false);
const startX = ref(0);
const scrollLeftStart = ref(0);
const wasDragging = ref(false);

// Вычисляемые свойства
const totalItemsCount = computed(() => 
  collections.value.reduce((sum, col) => sum + col.items.length, 0)
);

const allItems = computed(() => {
  // Объединяем все элементы из всех коллекций в один массив
  return collections.value.flatMap(col => col.items);
});

const carouselItems = computed(() => {
  return allItems.value;
});

// Методы
const loadPortfolioData = async () => {
  loadingState.value = { isLoading: true, error: null };
  
  try {
    LoggerUtil.info(`Загрузка портфолио для мастера ${props.staffId}`);
    
    const data = await CharmDirectApiService.getStaffMedia({ 
      staff_id: props.staffId 
    });
    
    collections.value = data.collections;
    loadingState.value = { isLoading: false, error: null };
    
    LoggerUtil.info(`Портфолио загружено: ${data.collections.length} коллекций`);
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Неизвестная ошибка при загрузке портфолио';
    
    loadingState.value = { 
      isLoading: false, 
      error: errorMessage 
    };
    
    LoggerUtil.error('Ошибка загрузки портфолио:', error);
  }
};

const retryLoad = () => {
  loadPortfolioData();
};

const openCarousel = (startIndex: number = 0) => {
  // Предотвращаем открытие, если было перетаскивание
  if (wasDragging.value) {
    LoggerUtil.info('Открытие карусели отменено - произошло перетаскивание');
    return;
  }
  
  selectedCollection.value = null;
  showModal.value = true;
  LoggerUtil.info(`Открыта карусель с изображения ${startIndex + 1}`);
  
  // Устанавливаем начальный индекс для карусели
  setTimeout(() => {
    const carousel = document.querySelector('.portfolio-carousel');
    if (carousel) {
      // Можно добавить логику для установки начального индекса
    }
  }, 100);
};

const closeModal = () => {
  showModal.value = false;
  selectedCollection.value = null;
};

// Методы для прокрутки
const scrollLeft = () => {
  LoggerUtil.info('Прокрутка влево');
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -300, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 100);
  }
};

const scrollRight = () => {
  LoggerUtil.info('Прокрутка вправо');
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 300, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 100);
  }
};

const updateScrollButtons = () => {
  if (scrollContainer.value) {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
    canScrollLeft.value = scrollLeft > 0;
    canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1;
  }
};

// Drag-to-scroll методы
const handleMouseDown = (e: MouseEvent) => {
  if (!scrollContainer.value) return;
  
  // Разрешаем drag только для ЛКМ (button === 0) или средней кнопки (button === 1)
  if (e.button !== 0 && e.button !== 1) return;
  
  isDragging.value = true;
  wasDragging.value = false;
  startX.value = e.pageX - scrollContainer.value.offsetLeft;
  scrollLeftStart.value = scrollContainer.value.scrollLeft;
  scrollContainer.value.style.cursor = 'grabbing';
  scrollContainer.value.style.userSelect = 'none';
  
  e.preventDefault();
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !scrollContainer.value) return;
  
  e.preventDefault();
  const x = e.pageX - scrollContainer.value.offsetLeft;
  const walk = (x - startX.value) * 1.5; // Множитель для скорости прокрутки
  
  // Если переместили больше чем на 5px, считаем это перетаскиванием
  if (Math.abs(walk) > 5) {
    wasDragging.value = true;
  }
  
  scrollContainer.value.scrollLeft = scrollLeftStart.value - walk;
};

const handleMouseUp = () => {
  if (!scrollContainer.value) return;
  
  isDragging.value = false;
  scrollContainer.value.style.cursor = 'grab';
  scrollContainer.value.style.userSelect = '';
  
  // Сбрасываем флаг через небольшую задержку
  setTimeout(() => {
    wasDragging.value = false;
  }, 50);
};

const handleMouseLeave = () => {
  if (isDragging.value && scrollContainer.value) {
    isDragging.value = false;
    scrollContainer.value.style.cursor = 'grab';
    scrollContainer.value.style.userSelect = '';
    
    setTimeout(() => {
      wasDragging.value = false;
    }, 50);
  }
};

// Обработка клавиши Escape для закрытия модального окна
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showModal.value) {
    closeModal();
  }
};

onMounted(() => {
  LoggerUtil.info(`PortfolioWidget монтирован для staff_id: ${props.staffId}`);
  loadPortfolioData();
  document.addEventListener('keydown', handleKeydown);
  
  // Добавляем обработчики прокрутки и drag-to-scroll
  setTimeout(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('scroll', updateScrollButtons);
      scrollContainer.value.addEventListener('mousedown', handleMouseDown);
      scrollContainer.value.addEventListener('mousemove', handleMouseMove);
      scrollContainer.value.addEventListener('mouseup', handleMouseUp);
      scrollContainer.value.addEventListener('mouseleave', handleMouseLeave);
      scrollContainer.value.style.cursor = 'grab';
      updateScrollButtons();
    }
  }, 500);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', updateScrollButtons);
    scrollContainer.value.removeEventListener('mousedown', handleMouseDown);
    scrollContainer.value.removeEventListener('mousemove', handleMouseMove);
    scrollContainer.value.removeEventListener('mouseup', handleMouseUp);
    scrollContainer.value.removeEventListener('mouseleave', handleMouseLeave);
  }
});

// Следим за изменениями в allItems и обновляем кнопки
watch(allItems, () => {
  // Несколько вызовов для надежности после рендеринга
  setTimeout(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('scroll', updateScrollButtons);
      scrollContainer.value.style.cursor = 'grab';
    }
    updateScrollButtons();
  }, 50);
  setTimeout(() => updateScrollButtons(), 200);
  setTimeout(() => updateScrollButtons(), 500);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.portfolio-widget {
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Состояния загрузки и ошибок */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

/* Skeleton загрузка */
.skeleton-card {
  background: #e9ecef;
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.error-icon, .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #0056b3;
}

/* Основной контент */
.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.portfolio-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  font-family: 'Inter', sans-serif;
}

.collections-count {
  font-size: 14px;
  color: #666;
}

/* Заголовок портфолио */
.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* Галерея с навигацией */
.portfolio-gallery {
  position: relative;
  display: flex;
  align-items: center;
}

.nav-btn {
  position: absolute;
  z-index: 10;
  width: 40px;
  height: 40px;
  border: none;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  outline: none;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.nav-btn.nav-prev {
  left: 8px;
}

.nav-btn.nav-next {
  right: 8px;
}

.nav-btn svg {
  width: 8px;
  height: 14px;
}

.nav-btn svg path {
  transition: fill 0.2s ease;
}

.nav-btn:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.nav-btn:active {
  transform: scale(0.95);
  background: #e9ecef;
}

/* Горизонтальная прокрутка */
.portfolio-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
  user-select: none;
}

.portfolio-scroll-container:active {
  cursor: grabbing;
}

.portfolio-scroll-container::-webkit-scrollbar {
  display: none;
}

.portfolio-scroll {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
}

.portfolio-card {
  flex: 0 0 auto;
  width: 200px;
  height: 250px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: #f8f9fa;
  position: relative;
}

.portfolio-card .portfolio-image {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.portfolio-card .portfolio-image.loaded {
  opacity: 1;
}

.portfolio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.portfolio-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .portfolio-card {
    width: 160px;
    height: 200px;
  }
  
  .portfolio-scroll {
    gap: 8px;
  }
  
  .nav-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
    border-radius: 6px;
  }
}

/* Кнопка "Смотреть все" */
.view-all-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.view-all-btn:hover {
  background: #0056b3;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
}

.modal-content {
  background: transparent;
  width: 80vw;
  height: 80vh;
  max-width: 1200px;
  max-height: 800px;
  overflow: visible;
  position: relative;
  border-radius: 8px;
  border: none;
  display: flex;
  flex-direction: column;
}

.close-btn-float {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #333;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.close-btn-float:hover {
  background: #f5f5f5;
  transform: scale(1.1);
}

/* Адаптивность */
@media (max-width: 768px) {
  .portfolio-widget {
    padding: 0;
  }
  
  .collections-preview {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .modal-overlay {
    padding: 0;
    background: rgba(0, 0, 0, 0.8);
  }
  
  .modal-content {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  .close-btn-float {
    display: none;
  }
}
</style>
