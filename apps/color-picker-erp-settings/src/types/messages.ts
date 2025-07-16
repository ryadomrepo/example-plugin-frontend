import { TColorTokensMap } from './tokens';

export type TWidgetColorMessage = {
  type: 'color_tokens_map';
  data: TColorTokensMap;
};
