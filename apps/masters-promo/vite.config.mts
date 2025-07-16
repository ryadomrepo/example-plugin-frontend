import {
  createConfig,
  defineBaseConfig,
  defineVueConfig,
} from '@yclients-configs/vite';
import { definePluginConfig } from '@yclients-configs/vite/presets';

export default createConfig(
  defineBaseConfig(),
  defineVueConfig(),
  definePluginConfig({
    pluginName: 'widget-masters-promo',
  }),
);
