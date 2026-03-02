import { TextStyle } from 'react-native';

export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
  } as TextStyle,
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  } as TextStyle,
  title2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  } as TextStyle,
  title3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
  } as TextStyle,
  heading: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  } as TextStyle,
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,
  callout: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
  } as TextStyle,
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
  } as TextStyle,
  captionBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  } as TextStyle,
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,
  smallBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof typography;
