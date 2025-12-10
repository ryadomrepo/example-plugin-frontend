<template>
  <div class="portfolio-mini-widget">
    <!-- Кнопка открытия попапа -->
    <button 
      class="toggle-button" 
      @click="openGalleryModal"
    >
      <div class="button-content">
        <div class="preview-images">
          <img 
            v-for="(item, index) in previewItems" 
            :key="item.mediaId"
            :src="item.media_url" 
            :alt="`Работа ${index + 1}`"
            class="preview-image"
            @contextmenu.prevent
            draggable="false"
          />
        </div>
      </div>
    </button>

    <!-- Модальное окно с каруселью -->
    <transition name="modal-fade">
      <div v-if="isModalOpen" class="modal-overlay" @click="closeGalleryModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeGalleryModal">×</button>
          <PortfolioCarousel 
            v-if="allItems.length > 0"
            :items="allItems"
            :autoplay="false"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { CharmDirectApiService } from '../services/api';
import { LoggerUtil } from '../utils/logger';
import PortfolioCarousel from './PortfolioCarousel.vue';
import type { MediaItem } from '../types/api';

interface Props {
  staffId: string;
}

const props = defineProps<Props>();

const isModalOpen = ref(false);
const allItems = ref<MediaItem[]>([]);

// Первые 3 изображения для превью
const previewItems = computed(() => {
  return allItems.value.slice(0, 3);
});

const openGalleryModal = () => {
  isModalOpen.value = true;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleEscapeKey);
  LoggerUtil.info('Открыт попап портфолио');
};

const closeGalleryModal = () => {
  isModalOpen.value = false;
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleEscapeKey);
  LoggerUtil.info('Закрыт попап портфолио');
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeGalleryModal();
  }
};

// Загружаем данные для превью
const loadPreviewData = async () => {
  try {
    const data = await CharmDirectApiService.getStaffMedia({ 
      staff_id: props.staffId 
    });
    
    allItems.value = data.collections.flatMap(col => col.items);
    LoggerUtil.info(`Загружено ${allItems.value.length} работ для мини-виджета`);
  } catch (error) {
    LoggerUtil.error('Ошибка загрузки данных для мини-виджета:', error);
  }
};

onMounted(() => {
  loadPreviewData();
});

onBeforeUnmount(() => {
  // Очистка при размонтировании
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleEscapeKey);
});
</script>

<style scoped>
.portfolio-mini-widget {
  display: inline-flex;
  align-items: center;
}

.toggle-button {
  width: auto;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: opacity 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  min-height: 32px;
}

.toggle-button:hover {
  opacity: 0.8;
}

.button-content {
  display: flex;
  align-items: center;
}

.preview-images {
  display: flex;
}

.preview-image {
  width: 40px;
  height: 40px;
  border-radius: 20%;
  object-fit: cover;
  border: 2px solid #ffffff;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
  margin-left: -8px;
  flex-shrink: 0;
}

.preview-image:first-child {
  margin-left: 0;
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
  z-index: 10000;
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

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: none;
  font-size: 24px;
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
  line-height: 1;
}

.modal-close:hover {
  background: #f5f5f5;
  transform: scale(1.1);
}

/* Анимация модального окна */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.15s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .preview-image {
    width: 36px;
    height: 36px;
  }

  .modal-overlay {
    padding: 10px;
  }

  .modal-close {
    top: 12px;
    right: 12px;
    width: 30px;
    height: 30px;
    font-size: 18px;
  }
}
</style>
