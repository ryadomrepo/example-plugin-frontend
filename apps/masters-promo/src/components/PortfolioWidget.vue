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
        <div class="collections-count">{{ allItems.length }} работ</div>
      </div>
      
      <!-- Сетка изображений -->
      <div class="portfolio-grid">
        <div 
          v-for="(item, index) in allItems" 
          :key="item.mediaId"
          class="portfolio-item"
          @click="openCarousel(index)"
        >
          <img 
            :src="item.media_url" 
            :alt="`Работа ${index + 1}`"
            class="portfolio-image"
          />
          <div class="portfolio-overlay">
            <span class="portfolio-index">{{ index + 1 }}</span>
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
        <div class="modal-header">
          <h3>{{ selectedCollection?.name || 'Портфолио' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <PortfolioCarousel 
            v-if="carouselItems.length > 0"
            :items="carouselItems"
            :autoplay="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.collections-count {
  font-size: 14px;
  color: #666;
}

/* Превью коллекций */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.portfolio-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  aspect-ratio: 1;
}

.portfolio-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.portfolio-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.portfolio-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.portfolio-index {
  line-height: 1;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .portfolio-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .portfolio-overlay {
    top: 4px;
    right: 4px;
    padding: 2px 6px;
    font-size: 11px;
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
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
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
