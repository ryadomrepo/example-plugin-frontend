import { HttpResponseExamples } from './http-response-example';

/**
 * Запуск всех примеров использования HttpResponse
 */
async function runHttpResponseExamples(): Promise<void> {
  console.log('=== HttpResponse Examples ===\n');

  try {
    // JSON ответ с типизацией
    await HttpResponseExamples.jsonResponseTypedExample();
    console.log('\n' + '='.repeat(50) + '\n');

    // Автоматическое определение типа контента
    await HttpResponseExamples.autoDetectContentTypeExample();
    console.log('\n' + '='.repeat(50) + '\n');

    // Текстовый ответ
    await HttpResponseExamples.textResponseExample();
    console.log('\n' + '='.repeat(50) + '\n');

    // Бинарный ответ
    await HttpResponseExamples.binaryResponseExample();
    console.log('\n' + '='.repeat(50) + '\n');

    // Ошибка
    await HttpResponseExamples.errorResponseExample();
    console.log('\n' + '='.repeat(50) + '\n');

    // Множественные заголовки
    await HttpResponseExamples.multipleHeadersResponseExample();
    console.log('\n' + '='.repeat(50) + '\n');

    // Без Content-Type
    await HttpResponseExamples.noContentTypeResponseExample();
    console.log('\n' + '='.repeat(50) + '\n');

    // Ответы без тела (204, 304)
    await HttpResponseExamples.noBodyResponseExample();
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('Все примеры выполнены успешно!');
  } catch (error) {
    console.error('Ошибка при выполнении примеров:', error);
  }
}

export { runHttpResponseExamples };
