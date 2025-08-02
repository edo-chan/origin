import { style, styleVariants, globalStyle } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

// Container for the entire bubble + avatar + timestamp
export const bubbleContainer = style({
  display: 'flex',
  alignItems: 'flex-end',
  marginBottom: theme.space.sm,
  width: '100%',
});

// Base bubble styles
export const bubbleBase = style({
  position: 'relative',
  borderRadius: theme.radius.lg,
  padding: `${theme.space.sm} ${theme.space.md}`,
  minWidth: '120px',
  wordWrap: 'break-word',
  boxShadow: theme.shadow.sm,
  border: `${theme.border.thin} solid ${theme.color.border}`,
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.normal,
});

// Bubble tail/pointer
export const bubbleTail = style({
  position: 'absolute',
  width: '0',
  height: '0',
  bottom: '8px',
  borderTop: '8px solid transparent',
  borderBottom: '8px solid transparent',
});

// Size variants
export const sizeVariants = styleVariants({
  sm: {
    fontSize: theme.font.size.sm,
  },
  md: {
    fontSize: theme.font.size.base,
  },
  lg: {
    fontSize: theme.font.size.lg,
  },
});

// Size variant global styles
export const smSize = sizeVariants.sm;
export const mdSize = sizeVariants.md;
export const lgSize = sizeVariants.lg;

globalStyle(`${smSize} ${bubbleBase}`, {
  padding: `${theme.space.xs} ${theme.space.sm}`,
});

globalStyle(`${mdSize} ${bubbleBase}`, {
  padding: `${theme.space.sm} ${theme.space.md}`,
});

globalStyle(`${lgSize} ${bubbleBase}`, {
  padding: `${theme.space.md} ${theme.space.lg}`,
});

// Position styles
export const positionStyles = styleVariants({
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
});

// Position global styles
export const leftPosition = positionStyles.left;
export const rightPosition = positionStyles.right;

globalStyle(`${leftPosition} ${bubbleBase}`, {
  borderBottomLeftRadius: theme.radius.sm,
});

globalStyle(`${leftPosition} ${bubbleTail}`, {
  left: '-8px',
  borderRight: '8px solid',
});

globalStyle(`${rightPosition} ${bubbleBase}`, {
  borderBottomRightRadius: theme.radius.sm,
});

globalStyle(`${rightPosition} ${bubbleTail}`, {
  right: '-8px',
  borderLeft: '8px solid',
});

// Variant styles (colors)
export const variantStyles = styleVariants({
  primary: {},
  secondary: {},
  tertiary: {},
  neutral: {},
});

// Timestamp styles
export const timestampBase = style({
  fontSize: theme.font.size.xs,
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.normal,
  color: theme.color.textSecondary,
  marginTop: theme.space.xs,
});

export const timestampLeft = style({
  textAlign: 'left',
});

export const timestampRight = style({
  textAlign: 'right',
});

// Avatar styles
export const avatarLeft = style({
  marginRight: theme.space.sm,
  flexShrink: 0,
});

export const avatarRight = style({
  marginLeft: theme.space.sm,
  flexShrink: 0,
});

// Variant global styles
export const primaryVariant = variantStyles.primary;
export const secondaryVariant = variantStyles.secondary;
export const tertiaryVariant = variantStyles.tertiary;
export const neutralVariant = variantStyles.neutral;

// Primary variant
globalStyle(`${primaryVariant} ${bubbleBase}`, {
  backgroundColor: theme.color.primary,
  color: theme.color.background,
  borderColor: theme.color.primary,
});

globalStyle(`${primaryVariant} ${bubbleTail}`, {
  borderRightColor: theme.color.primary,
  borderLeftColor: theme.color.primary,
});

// Secondary variant
globalStyle(`${secondaryVariant} ${bubbleBase}`, {
  backgroundColor: theme.color.secondary,
  color: theme.color.background,
  borderColor: theme.color.secondary,
});

globalStyle(`${secondaryVariant} ${bubbleTail}`, {
  borderRightColor: theme.color.secondary,
  borderLeftColor: theme.color.secondary,
});

// Tertiary variant
globalStyle(`${tertiaryVariant} ${bubbleBase}`, {
  backgroundColor: theme.color.tertiary,
  color: theme.color.background,
  borderColor: theme.color.tertiary,
});

globalStyle(`${tertiaryVariant} ${bubbleTail}`, {
  borderRightColor: theme.color.tertiary,
  borderLeftColor: theme.color.tertiary,
});

// Neutral variant
globalStyle(`${neutralVariant} ${bubbleBase}`, {
  backgroundColor: theme.color.surface,
  color: theme.color.text,
  borderColor: theme.color.border,
});

globalStyle(`${neutralVariant} ${bubbleTail}`, {
  borderRightColor: theme.color.surface,
  borderLeftColor: theme.color.surface,
});