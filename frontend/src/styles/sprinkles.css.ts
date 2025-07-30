import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles';
import { tokens } from './tokens.css';

// Define responsive and non-responsive properties
const spaceProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { '@media': 'screen and (min-width: 768px)' },
    desktop: { '@media': 'screen and (min-width: 1024px)' },
  },
  defaultCondition: 'mobile',
  properties: {
    // Spacing (margin, padding) - both standard and t-shirt sizes
    margin: { ...tokens.sizing, ...tokens.padding },
    marginTop: { ...tokens.sizing, ...tokens.padding },
    marginBottom: { ...tokens.sizing, ...tokens.padding },
    marginLeft: { ...tokens.sizing, ...tokens.padding },
    marginRight: { ...tokens.sizing, ...tokens.padding },
    padding: { ...tokens.sizing, ...tokens.padding },
    paddingTop: { ...tokens.sizing, ...tokens.padding },
    paddingBottom: { ...tokens.sizing, ...tokens.padding },
    paddingLeft: { ...tokens.sizing, ...tokens.padding },
    paddingRight: { ...tokens.sizing, ...tokens.padding },
    
    // Layout
    gap: { ...tokens.sizing, ...tokens.padding },
    width: { ...tokens.sizing, auto: 'auto', full: '100%' },
    height: { ...tokens.sizing, auto: 'auto', full: '100%' },
    
    // Typography
    fontSize: tokens.font.scale,
  },
  shorthands: {
    // Margin shorthands
    m: ['margin'],
    mt: ['marginTop'],
    mb: ['marginBottom'],
    ml: ['marginLeft'],
    mr: ['marginRight'],
    mx: ['marginLeft', 'marginRight'],
    my: ['marginTop', 'marginBottom'],
    
    // Padding shorthands
    p: ['padding'],
    pt: ['paddingTop'],
    pb: ['paddingBottom'],
    pl: ['paddingLeft'],
    pr: ['paddingRight'],
    px: ['paddingLeft', 'paddingRight'],
    py: ['paddingTop', 'paddingBottom'],
  },
});

const colorProperties = defineProperties({
  properties: {
    // Colors
    color: {
      // Primary colors
      primary50: tokens.color.primary['50'],
      primary100: tokens.color.primary['100'],
      primary200: tokens.color.primary['200'],
      primary300: tokens.color.primary['300'],
      primary400: tokens.color.primary['400'],
      primary500: tokens.color.primary['500'],
      primary600: tokens.color.primary['600'],
      primary700: tokens.color.primary['700'],
      primary800: tokens.color.primary['800'],
      primary900: tokens.color.primary['900'],
      
      // Secondary colors
      secondary50: tokens.color.secondary['50'],
      secondary100: tokens.color.secondary['100'],
      secondary200: tokens.color.secondary['200'],
      secondary300: tokens.color.secondary['300'],
      secondary400: tokens.color.secondary['400'],
      secondary500: tokens.color.secondary['500'],
      secondary600: tokens.color.secondary['600'],
      secondary700: tokens.color.secondary['700'],
      secondary800: tokens.color.secondary['800'],
      secondary900: tokens.color.secondary['900'],
      
      // Tertiary colors
      tertiary50: tokens.color.tertiary['50'],
      tertiary100: tokens.color.tertiary['100'],
      tertiary200: tokens.color.tertiary['200'],
      tertiary300: tokens.color.tertiary['300'],
      tertiary400: tokens.color.tertiary['400'],
      tertiary500: tokens.color.tertiary['500'],
      tertiary600: tokens.color.tertiary['600'],
      tertiary700: tokens.color.tertiary['700'],
      tertiary800: tokens.color.tertiary['800'],
      tertiary900: tokens.color.tertiary['900'],
      
      // Neutral colors
      neutral50: tokens.color.neutral['50'],
      neutral100: tokens.color.neutral['100'],
      neutral200: tokens.color.neutral['200'],
      neutral300: tokens.color.neutral['300'],
      neutral400: tokens.color.neutral['400'],
      neutral500: tokens.color.neutral['500'],
      neutral600: tokens.color.neutral['600'],
      neutral700: tokens.color.neutral['700'],
      neutral800: tokens.color.neutral['800'],
      neutral900: tokens.color.neutral['900'],
      
      // Semantic colors
      success50: tokens.color.success['50'],
      success100: tokens.color.success['100'],
      success200: tokens.color.success['200'],
      success300: tokens.color.success['300'],
      success400: tokens.color.success['400'],
      success500: tokens.color.success['500'],
      success600: tokens.color.success['600'],
      success700: tokens.color.success['700'],
      success800: tokens.color.success['800'],
      success900: tokens.color.success['900'],
      
      warning50: tokens.color.warning['50'],
      warning100: tokens.color.warning['100'],
      warning200: tokens.color.warning['200'],
      warning300: tokens.color.warning['300'],
      warning400: tokens.color.warning['400'],
      warning500: tokens.color.warning['500'],
      warning600: tokens.color.warning['600'],
      warning700: tokens.color.warning['700'],
      warning800: tokens.color.warning['800'],
      warning900: tokens.color.warning['900'],
      
      danger50: tokens.color.danger['50'],
      danger100: tokens.color.danger['100'],
      danger200: tokens.color.danger['200'],
      danger300: tokens.color.danger['300'],
      danger400: tokens.color.danger['400'],
      danger500: tokens.color.danger['500'],
      danger600: tokens.color.danger['600'],
      danger700: tokens.color.danger['700'],
      danger800: tokens.color.danger['800'],
      danger900: tokens.color.danger['900'],
    },
    
    backgroundColor: {
      // Primary backgrounds
      primary50: tokens.color.primary['50'],
      primary100: tokens.color.primary['100'],
      primary200: tokens.color.primary['200'],
      primary300: tokens.color.primary['300'],
      primary400: tokens.color.primary['400'],
      primary500: tokens.color.primary['500'],
      primary600: tokens.color.primary['600'],
      primary700: tokens.color.primary['700'],
      primary800: tokens.color.primary['800'],
      primary900: tokens.color.primary['900'],
      
      // Secondary backgrounds
      secondary50: tokens.color.secondary['50'],
      secondary100: tokens.color.secondary['100'],
      secondary200: tokens.color.secondary['200'],
      secondary300: tokens.color.secondary['300'],
      secondary400: tokens.color.secondary['400'],
      secondary500: tokens.color.secondary['500'],
      secondary600: tokens.color.secondary['600'],
      secondary700: tokens.color.secondary['700'],
      secondary800: tokens.color.secondary['800'],
      secondary900: tokens.color.secondary['900'],
      
      // Tertiary backgrounds
      tertiary50: tokens.color.tertiary['50'],
      tertiary100: tokens.color.tertiary['100'],
      tertiary200: tokens.color.tertiary['200'],
      tertiary300: tokens.color.tertiary['300'],
      tertiary400: tokens.color.tertiary['400'],
      tertiary500: tokens.color.tertiary['500'],
      tertiary600: tokens.color.tertiary['600'],
      tertiary700: tokens.color.tertiary['700'],
      tertiary800: tokens.color.tertiary['800'],
      tertiary900: tokens.color.tertiary['900'],
      
      // Neutral backgrounds
      neutral50: tokens.color.neutral['50'],
      neutral100: tokens.color.neutral['100'],
      neutral200: tokens.color.neutral['200'],
      neutral300: tokens.color.neutral['300'],
      neutral400: tokens.color.neutral['400'],
      neutral500: tokens.color.neutral['500'],
      neutral600: tokens.color.neutral['600'],
      neutral700: tokens.color.neutral['700'],
      neutral800: tokens.color.neutral['800'],
      neutral900: tokens.color.neutral['900'],
      
      // Semantic backgrounds
      success50: tokens.color.success['50'],
      success100: tokens.color.success['100'],
      success500: tokens.color.success['500'],
      warning50: tokens.color.warning['50'],
      warning100: tokens.color.warning['100'],
      warning500: tokens.color.warning['500'],
      danger50: tokens.color.danger['50'],
      danger100: tokens.color.danger['100'],
      danger500: tokens.color.danger['500'],
      
      // Transparent
      transparent: 'transparent',
    },
    
    borderColor: {
      primary500: tokens.color.primary['500'],
      secondary500: tokens.color.secondary['500'],
      tertiary500: tokens.color.tertiary['500'],
      neutral200: tokens.color.neutral['200'],
      neutral300: tokens.color.neutral['300'],
      neutral400: tokens.color.neutral['400'],
      success500: tokens.color.success['500'],
      warning500: tokens.color.warning['500'],
      danger500: tokens.color.danger['500'],
      transparent: 'transparent',
    },
  },
});

const layoutProperties = defineProperties({
  properties: {
    // Border radius
    borderRadius: tokens.radius,
    
    // Box shadow
    boxShadow: tokens.shadow,
    
    // Display
    display: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none'],
    
    // Flexbox
    flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'],
    alignItems: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
    justifyContent: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    flexWrap: ['nowrap', 'wrap', 'wrap-reverse'],
    
    // Typography
    fontFamily: [tokens.font.body, tokens.font.heading, tokens.font.mono],
    fontWeight: ['400', '500', '600', '700'],
    textAlign: ['left', 'center', 'right'],
    
    // Border
    borderWidth: ['0px', '1px', '2px', '4px'],
    borderStyle: ['solid', 'dashed', 'dotted', 'none'],
    
    // Position
    position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
    
    // Cursor
    cursor: ['pointer', 'default', 'not-allowed', 'text'],
    
    // Overflow
    overflow: ['visible', 'hidden', 'scroll', 'auto'],
    overflowX: ['visible', 'hidden', 'scroll', 'auto'],
    overflowY: ['visible', 'hidden', 'scroll', 'auto'],
  },
});

// Create the sprinkles function
export const sprinkles = createSprinkles(spaceProperties, colorProperties, layoutProperties);

// Export the type for TypeScript
export type Sprinkles = Parameters<typeof sprinkles>[0];