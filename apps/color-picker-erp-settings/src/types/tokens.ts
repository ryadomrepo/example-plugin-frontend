export type TColorTokenKey =
  | 'color_bg'
  | 'color_text_black'
  | 'color_primary'
  | 'color_white'
  | 'color_stroke_primary';

export type TColorTokensMap = {
  [K in TColorTokenKey]: string;
};
