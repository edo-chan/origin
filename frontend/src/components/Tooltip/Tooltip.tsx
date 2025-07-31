import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { tooltipContent, tooltipArrow } from './Tooltip.css';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Children that trigger the tooltip */
  children: React.ReactNode;
  /** Position of the tooltip */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Alignment of the tooltip */
  align?: 'start' | 'center' | 'end';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether tooltip is controlled externally */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Delay before showing (ms) */
  delayDuration?: number;
  /** Whether to skip delay */
  skipDelayDuration?: number;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

export const CustomTooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  variant = 'neutral',
  size = 'md',
  open,
  defaultOpen,
  onOpenChange,
  delayDuration = 700,
  skipDelayDuration = 300,
  className = '',
  style,
}) => {
  const contentClasses = [
    tooltipContent,
    className
  ].filter(Boolean).join(' ');

  return (
    <Tooltip.Provider skipDelayDuration={skipDelayDuration}>
      <Tooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        delayDuration={delayDuration}
      >
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className={contentClasses}
            side={side}
            align={align}
            style={style}
            data-variant={variant}
            data-size={size}
            sideOffset={4}
          >
            {content}
            <Tooltip.Arrow className={tooltipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

// Keep backward compatibility
export { CustomTooltip as Tooltip };