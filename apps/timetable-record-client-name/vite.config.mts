import { createConfig, defineBaseConfig } from '@yclients-configs/vite';
import { definePluginConfig } from '@yclients-configs/vite/presets';

export default createConfig(
  defineBaseConfig(),
  definePluginConfig({
    pluginName: 'timetable-record-client-name',
  }),
);
