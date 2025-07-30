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
    // Spacing (margin, padding)
    margin: tokens.sizing,
    marginTop: tokens.sizing,
    marginBottom: tokens.sizing,
    marginLeft: tokens.sizing,
    marginRight: tokens.sizing,
    padding: tokens.sizing,
    paddingTop: tokens.sizing,
    paddingBottom: tokens.sizing,
    paddingLeft: tokens.sizing,
    paddingRight: tokens.sizing,
    
    // Layout
    gap: tokens.sizing,
    width: tokens.sizing,
    height: tokens.sizing,
    
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
      success500: tokens.color.success['500'],
      warning500: tokens.color.warning['500'],
      danger500: tokens.color.danger['500'],
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
      success500: tokens.color.success['500'],
      warning50: tokens.color.warning['50'],
      warning500: tokens.color.warning['500'],
      danger50: tokens.color.danger['50'],
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
    display: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'],
    
    // Flexbox
    flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'],
    alignItems: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
    justifyContent: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    
    // Typography
    fontFamily: tokens.font,
    fontWeight: ['400', '500', '600', '700'],
    textAlign: ['left', 'center', 'right'],
    
    // Border
    borderWidth: ['0px', '1px', '2px', '4px'],
    borderStyle: ['solid', 'dashed', 'dotted', 'none'],
    
    // Position
    position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
    
    // Cursor
    cursor: ['pointer', 'default', 'not-allowed', 'text'],
  },
});

// Create the sprinkles function
export const sprinkles = createSprinkles(spaceProperties, colorProperties, layoutProperties);

// Export the type for TypeScript
export type Sprinkles = Parameters<typeof sprinkles>[0];