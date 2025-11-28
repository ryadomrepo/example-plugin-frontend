<template>
  <div class="portfolio-widget">
    <!-- Состояние загрузки -->
    <div v-if="loadingState.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка портфолио...</p>
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
        <div class="portfolio-navigation">
          <button 
            class="nav-btn nav-prev" 
            @click.prevent="scrollLeft"
            :disabled="!canScrollLeft"
            type="button"
          >
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M4.18693 7.52021C3.99167 7.71547 3.67508 7.71547 3.47982 7.52021L0.146488 4.18688C-0.0487738 3.99161 -0.0487738 3.67503 0.146489 3.47977L3.47982 0.146437C3.67508 -0.0488257 3.99167 -0.0488257 4.18693 0.146437C4.38219 0.341698 4.38219 0.658281 4.18693 0.853543L1.70715 3.33332L9.83337 3.33332C10.1095 3.33332 10.3334 3.55718 10.3334 3.83332C10.3334 4.10947 10.1095 4.33332 9.83337 4.33332L1.70715 4.33332L4.18693 6.8131C4.38219 7.00836 4.38219 7.32495 4.18693 7.52021Z" fill="#262626"/>
            </svg>
          </button>
          <button 
            class="nav-btn nav-next" 
            @click.prevent="scrollRight"
            :disabled="!canScrollRight"
            type="button"
          >
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.14645 0.146447C6.34171 -0.0488155 6.65829 -0.0488155 6.85355 0.146447L10.1869 3.47978C10.3821 3.67504 10.3821 3.99162 10.1869 4.18689L6.85355 7.52022C6.65829 7.71548 6.34171 7.71548 6.14645 7.52022C5.95118 7.32496 5.95118 7.00837 6.14645 6.81311L8.62623 4.33333H0.5C0.223858 4.33333 0 4.10948 0 3.83333C0 3.55719 0.223858 3.33333 0.5 3.33333H8.62623L6.14645 0.853553C5.95118 0.658291 5.95118 0.341709 6.14645 0.146447Z" fill="#262626"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Горизонтальная прокрутка изображений -->
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
              @contextmenu.prevent
              draggable="false"
            />
          </div>
        </div>
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
        <button @click="closeModal" class="close-btn-float">×</button>
        <PortfolioCarousel 
          v-if="carouselItems.length > 0"
          :items="carouselItems"
          :autoplay="false"
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
const canScrollLeft = ref(true);
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
  setTimeout(() => {
    updateScrollButtons();
  }, 100);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.portfolio-widget {
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  margin-bottom: 16px;
}

.portfolio-navigation {
  display: flex;
  gap: 8px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
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
}

.nav-btn svg {
  width: 14px;
  height: auto;
}

.nav-btn svg path {
  transition: fill 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
  transform: translateY(-1px);
}

.nav-btn:active:not(:disabled) {
  transform: translateY(0);
  background: #e9ecef;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: #f8f9fa;
}

/* Горизонтальная прокрутка */
.portfolio-scroll-container {
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
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  border-radius: 4px;
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
    padding: 12px;
  }
  
  .collections-preview {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .modal-overlay {
    padding: 10px;
  }
  
  .close-btn-float {
    top: 12px;
    right: 12px;
    width: 30px;
    height: 30px;
    font-size: 18px;
  }
}
</style>
