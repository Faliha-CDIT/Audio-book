export const Fonts = {
  regular: 'Exo2-Regular',
  medium: 'Exo2-Medium', 
  bold: 'Exo2-Bold',
  light: 'Exo2-Light',
  thin: 'Exo2-Thin',
  extraLight: 'Exo2-ExtraLight',
  semiBold: 'Exo2-SemiBold',
  extraBold: 'Exo2-ExtraBold',
  black: 'Exo2-Black',
  italic: 'Exo2-Italic',
  mediumItalic: 'Exo2-MediumItalic',
  boldItalic: 'Exo2-BoldItalic',
  lightItalic: 'Exo2-LightItalic',
  thinItalic: 'Exo2-ThinItalic',
  extraLightItalic: 'Exo2-ExtraLightItalic',
  semiBoldItalic: 'Exo2-SemiBoldItalic',
  extraBoldItalic: 'Exo2-ExtraBoldItalic',
  blackItalic: 'Exo2-BlackItalic',
} as const

export type FontWeight = keyof typeof Fonts
