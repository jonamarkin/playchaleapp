'use client';

import React from 'react';

type MotionStyle = {
  opacity?: number;
  width?: string | number;
  x?: string | number;
  y?: string | number;
  scale?: number;
};

type MotionProps<T extends HTMLElement> = React.HTMLAttributes<T> & {
  animate?: MotionStyle;
  exit?: MotionStyle;
  initial?: MotionStyle;
  transition?: unknown;
};

const toCssLength = (value?: string | number) => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

const motionStyle = (animate?: MotionStyle): React.CSSProperties => {
  if (!animate) return {};

  const x = toCssLength(animate.x) || '0';
  const y = toCssLength(animate.y) || '0';
  const hasTransform = animate.x !== undefined || animate.y !== undefined || animate.scale !== undefined;

  return {
    opacity: animate.opacity,
    width: animate.width,
    transform: hasTransform ? `translate3d(${x}, ${y}, 0) scale(${animate.scale ?? 1})` : undefined,
  };
};

const mergeClassName = (className?: string) => ['pc-motion-enter', className].filter(Boolean).join(' ');

export const AnimatePresence = ({ children }: { children: React.ReactNode; mode?: 'sync' | 'popLayout' | 'wait' }) => (
  <>{children}</>
);

const MotionDiv = React.forwardRef<HTMLDivElement, MotionProps<HTMLDivElement>>(
  ({ animate, className, exit: _exit, initial: _initial, style, transition: _transition, ...props }, ref) => (
    <div
      ref={ref}
      className={mergeClassName(className)}
      style={{ ...motionStyle(animate), ...style }}
      {...props}
    />
  )
);
MotionDiv.displayName = 'MotionDiv';

const MotionForm = React.forwardRef<HTMLFormElement, MotionProps<HTMLFormElement>>(
  ({ animate, className, exit: _exit, initial: _initial, style, transition: _transition, ...props }, ref) => (
    <form
      ref={ref}
      className={mergeClassName(className)}
      style={{ ...motionStyle(animate), ...style }}
      {...props}
    />
  )
);
MotionForm.displayName = 'MotionForm';

export const motion = {
  div: MotionDiv,
  form: MotionForm,
};
