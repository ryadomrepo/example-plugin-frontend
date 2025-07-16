import type { Plugin, ResolvedConfig } from 'vite';
import type { OutputChunk, OutputAsset, OutputBundle } from 'rollup';
import { resolve } from 'node:path';
import fs from 'node:fs';

/**
 * Плагин для генерации manifest.json
 * @description Создает манифест с информацией о CSS и JavaScript файлах для каждого entry point в сборке.
 * Манифест содержит список всех стилей и скриптов, необходимых для работы плагина.
 * @returns {Plugin} Vite плагин для генерации манифеста
 */

type ManifestEntry = { name: string; type: string };
type Manifest = Record<string, ManifestEntry[]>;

const manifestPlugin = (): Plugin => {
  const plugin: Plugin = {
    name: 'create-manifest',
    configResolved(config: ResolvedConfig) {
      const writeBundle = (_: unknown, bundle: OutputBundle) => {
        const isCssAsset = (
          entry: [string, OutputAsset | OutputChunk],
        ): entry is [string, OutputAsset] =>
          entry[1].type === 'asset' && entry[0].endsWith('.css');

        const isEntryChunk = (
          entry: [string, OutputAsset | OutputChunk],
        ): entry is [string, OutputChunk] =>
          entry[1].type === 'chunk' && entry[1].isEntry;

        const cssFiles: ManifestEntry[] = Object.entries(bundle)
          .filter(isCssAsset)
          .map(([fileName]) => ({ name: fileName, type: 'stylesheet' }));

        const manifest: Manifest = Object.entries(bundle)
          .filter(isEntryChunk)
          .reduce(
            (acc, [fileName, chunk]) => ({
              ...acc,
              [chunk.name]: [{ name: fileName, type: 'script' }, ...cssFiles],
            }),
            {},
          );

        const manifestPath = resolve(
          config.root,
          config.build.outDir,
          'manifest.json',
        );
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      };

      plugin.writeBundle = writeBundle;
    },
  };

  return plugin;
};

export default manifestPlugin;
