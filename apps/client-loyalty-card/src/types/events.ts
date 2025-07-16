import type {
  THostToPluginEvent,
  TPluginToHostEvent,
} from '@yclients-plugins/utils';

export type THostReadyEvent = THostToPluginEvent<null>;

export type TPluginReadyEvent = TPluginToHostEvent<null>;
