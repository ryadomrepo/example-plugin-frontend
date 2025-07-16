import {
  runHttpRequestExamples,
  runApiClientExample,
} from './http-request-example';

/**
 * Запуск всех примеров HTTP клиента
 */
async function runAllExamples(): Promise<void> {
  console.log('🎯 HTTP Client API Examples');
  console.log('=============================\n');

  try {
    // Запускаем примеры с новой структурой retry
    await runHttpRequestExamples();

    // Запускаем пример специализированного API клиента
    await runApiClientExample();

    console.log('\n🎉 Все примеры успешно выполнены!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении примеров:', error);
  }
}

// Запускаем примеры
runAllExamples().catch(console.error);

export { runAllExamples };
