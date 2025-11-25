<template>
  <div id="app">
    <div class="plugin-status">
      <h2>Masters Promo Plugin - Статус</h2>
      <p>Плагин работает в фоновом режиме и создает виджеты портфолио для мастеров.</p>
      
      <div class="status-info">
        <h3>Информация о плагине:</h3>
        <ul>
          <li>✅ Плагин инициализирован</li>
          <li>✅ Mock Widget API активен</li>
          <li>✅ Слоты портфолио созданы</li>
          <li>✅ Vue компоненты монтированы</li>
        </ul>
        
        <p><strong>Примечание:</strong> В реальной системе YCLIENTS виджеты будут отображаться на страницах мастеров.</p>
      </div>

      <div class="demo-section mini-widget-demo">
        <PortfolioMiniWidget 
          v-if="currentStaffId" 
          :key="`mini-${currentStaffId}`"
          :staff-id="currentStaffId" 
        />
      </div>

      <div class="demo-section">
        <h3>Демо полного виджета (страница мастера):</h3>
        <div class="demo-controls">
          <label for="staff-id-input">Staff ID:</label>
          <input 
            id="staff-id-input"
            v-model="staffId" 
            type="text" 
            placeholder="Введите staff_id (например: 811339)"
            @keyup.enter="loadPortfolio"
          />
          <button @click="loadPortfolio" :disabled="!staffId">Показать виджет</button>
        </div>
        
        <PortfolioWidget 
          v-if="currentStaffId" 
          :key="currentStaffId"
          :staff-id="currentStaffId" 
        />
        <div v-else class="no-staff-id">
          <p>Введите staff_id для демонстрации виджета</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PortfolioWidget from './components/PortfolioWidget.vue';
import PortfolioMiniWidget from './components/PortfolioMiniWidget.vue';

const staffId = ref<string>('');
const currentStaffId = ref<string>('');

const loadPortfolio = () => {
  if (staffId.value.trim()) {
    currentStaffId.value = staffId.value.trim();
  }
};

const setStaffId = (id: string) => {
  staffId.value = id;
  loadPortfolio();
};

// Инициализация - автоматически загружаем тестовый staff_id
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const paramStaffId = urlParams.get('staff_id');
  
  if (paramStaffId) {
    staffId.value = paramStaffId;
    currentStaffId.value = paramStaffId;
  } else {
    // Автоматически загружаем тестовый ID 811339
    setStaffId('811339');
  }
});
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.demo-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
}

.demo-header p {
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.demo-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.demo-controls label {
  font-weight: 500;
}

.demo-controls input {
  padding: 8px 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  min-width: 250px;
}

.demo-controls input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.demo-controls button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-controls button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.demo-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.demo-content {
  margin: 30px 0;
  min-height: 400px;
}

.no-staff-id {
  padding: 60px 20px;
  text-align: center;
  color: #666;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #ddd;
}

.demo-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-top: 30px;
}

.demo-info h3, .demo-info h4 {
  margin-top: 0;
  color: #333;
}

.demo-info ul {
  padding-left: 20px;
}

.demo-info li {
  margin-bottom: 8px;
}

.demo-info code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

.test-ids {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.test-btn {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: monospace;
  transition: background 0.2s;
}

.test-btn:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  #app {
    padding: 10px;
  }
  
  .demo-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .demo-controls input {
    min-width: auto;
  }
  
  .test-ids {
    justify-content: center;
  }
}

.debug-info {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-family: monospace;
  font-size: 14px;
}

.debug-info p {
  margin: 5px 0;
}

.plugin-status {
  margin-bottom: 40px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mini-widget-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
}

.demo-description {
  color: #666;
  margin-bottom: 20px;
}

.mini-widget-container {
  max-width: 600px;
  margin: 0 auto;
}

.staff-card-mock {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.staff-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.staff-avatar {
  width: 60px;
  height: 60px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.staff-info h4 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.staff-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.expand-btn {
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
}
</style>
