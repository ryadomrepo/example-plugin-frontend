import { HttpRequestExamples } from './http-request-example';

/**
 * Запуск всех примеров использования HttpRequest
 */
function runHttpRequestExamples(): void {
  console.log('=== HttpRequest Examples ===\n');

  try {
    // JSON запрос
    HttpRequestExamples.jsonRequestExample();
    console.log('\n' + '='.repeat(50) + '\n');

    // FormData запрос
    HttpRequestExamples.formDataRequestExample();
    console.log('\n' + '='.repeat(50) + '\n');

    // URLSearchParams запрос
    HttpRequestExamples.urlSearchParamsRequestExample();
    console.log('\n' + '='.repeat(50) + '\n');

    // Строковый запрос
    HttpRequestExamples.stringRequestExample();
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('Все примеры выполнены успешно!');
  } catch (error) {
    console.error('Ошибка при выполнении примеров:', error);
  }
}

export { runHttpRequestExamples };
