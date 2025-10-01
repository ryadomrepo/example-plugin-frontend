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
      </div>
      
      <!-- Сетка карточек с навигацией -->
      <div class="portfolio-grid-wrapper">
        <!-- Кнопка влево -->
        <button 
          v-if="currentPage > 0"
          class="nav-arrow nav-arrow-left" 
          @click.prevent="prevPage"
          type="button"
        >
          ←
        </button>
        
        <!-- Сетка карточек -->
        <div class="portfolio-grid">
          <div 
            v-for="(item, index) in visibleItems" 
            :key="item.mediaId"
            class="portfolio-card"
            @click="openCarousel(currentPage * 4 + index)"
          >
            <img 
              :src="item.media_url" 
              :alt="`Работа ${currentPage * 4 + index + 1}`"
              class="portfolio-image"
            />
          </div>
        </div>
        
        <!-- Кнопка вправо -->
        <button 
          v-if="currentPage < totalPages - 1"
          class="nav-arrow nav-arrow-right" 
          @click.prevent="nextPage"
          type="button"
        >
          →
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
      <button @click="closeModal" class="modal-close-btn">×</button>
      <PortfolioCarousel 
        v-if="carouselItems.length > 0"
        :items="carouselItems"
        :initial-index="initialCarouselIndex"
        :autoplay="false"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
const currentPage = ref(0);
const initialCarouselIndex = ref(0);

// Вычисляемые свойства
const allItems = computed(() => {
  // Объединяем все элементы из всех коллекций в один массив
  return collections.value.flatMap(col => col.items);
});

const totalPages = computed(() => {
  return Math.ceil(allItems.value.length / 4);
});

const visibleItems = computed(() => {
  const start = currentPage.value * 4;
  return allItems.value.slice(start, start + 4);
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
  selectedCollection.value = null;
  initialCarouselIndex.value = startIndex;
  showModal.value = true;
  LoggerUtil.info(`Открыта карусель с изображения ${startIndex + 1}`);
};

const closeModal = () => {
  showModal.value = false;
  selectedCollection.value = null;
};

// Методы для навигации по страницам
const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    LoggerUtil.info(`Переключение на страницу ${currentPage.value + 1}`);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    LoggerUtil.info(`Переключение на страницу ${currentPage.value + 1}`);
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
});
</script>

<style scoped>
.portfolio-widget {
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
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
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.collections-count {
  font-size: 14px;
  color: #666;
}

/* Основной контент */
.portfolio-content {
  position: relative;
}

/* Заголовок портфолио */
.portfolio-header {
  margin-bottom: 20px;
}

/* Обертка для сетки с кнопками */
.portfolio-grid-wrapper {
  position: relative;
  width: 100%;
}

/* Сетка карточек */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* Кнопки навигации поверх карточек */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}

.nav-arrow:hover {
  background: #f8f9fa;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-50%) scale(1.05);
}

.nav-arrow-left {
  left: 20px;
}

.nav-arrow-right {
  right: 20px;
}

/* Карточка портфолио */
.portfolio-card {
  width: 100%;
  aspect-ratio: 3/4;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.portfolio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.portfolio-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .portfolio-widget {
    padding: 12px;
  }
  
  .portfolio-grid {
    gap: 8px;
  }
  
  .portfolio-header {
    margin-bottom: 12px;
  }
  
  .portfolio-title {
    font-size: 16px;
  }
  
  .nav-arrow {
    width: 22px;
    height: 22px;
    font-size: 10px;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .nav-arrow-left {
    left: 6px;
  }
  
  .nav-arrow-right {
    right: 6px;
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
  background: rgba(60, 60, 60, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0;
}

.modal-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: white;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: opacity 0.2s;
}

.modal-close-btn:hover {
  opacity: 0.7;
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
  
  .modal-body {
    padding: 15px;
  }
}
</style>
