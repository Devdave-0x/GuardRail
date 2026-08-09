'use client';

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type UIEvent,
} from 'react';
import { motion, useInView } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// === Types

export interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  selected: boolean;
  reduced: boolean;
  onSelect: (index: number) => void;
  onActivate: (index: number) => void;
}

export interface AnimatedListProps {
  items?: string[];
  onItemSelect?: (item: string, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  ariaLabel?: string;
  backgroundColor?: string;
  panelColor?: string;
  hoverColor?: string;
  borderColor?: string;
  textColor?: string;
}

// === Item

const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  delay = 0,
  index,
  selected,
  reduced,
  onSelect,
  onActivate,
}) => {
  const ref = useRef<HTMLLIElement | null>(null);
  const inView: boolean = useInView(ref, { amount: 0.5, once: false });

  // Reduced motion resolves to the resting state rather than a scaled-in frame.
  const resting = { scale: 1, opacity: 1 };
  const hidden = { scale: 0.7, opacity: 0 };

  return (
    <motion.li
      ref={ref}
      data-index={index}
      initial={reduced ? resting : hidden}
      animate={reduced || inView ? resting : hidden}
      transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : delay }}
      className="mb-4"
    >
      <button
        type="button"
        aria-current={selected || undefined}
        onMouseEnter={() => onSelect(index)}
        onFocus={() => onSelect(index)}
        onClick={() => onActivate(index)}
        className="block w-full cursor-pointer text-left"
      >
        {children}
      </button>
    </motion.li>
  );
};

// === Component

export const AnimatedList: React.FC<AnimatedListProps> = ({
  items = [],
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  ariaLabel = 'List',
  backgroundColor = '#0a0a0a',
  panelColor = '#0f0f0f',
  hoverColor = '#1e1e1e',
  borderColor = '#1e1e1e',
  textColor = '#e8e8e8',
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);
  const reduced: boolean = usePrefersReducedMotion();

  const handleItemSelect = useCallback((index: number): void => {
    setSelectedIndex(index);
  }, []);

  const handleItemActivate = useCallback(
    (index: number): void => {
      setSelectedIndex(index);
      onItemSelect?.(items[index], index);
    },
    [items, onItemSelect],
  );

  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  useEffect(() => {
    if (!enableArrowNavigation) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          event.preventDefault();
          onItemSelect?.(items[selectedIndex], selectedIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;

    const container = listRef.current;
    const selectedItem = container.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';

      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({ top: itemBottom - containerHeight + extraMargin, behavior });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav, reduced]);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className={`max-h-[400px] overflow-y-auto p-4 ${
          displayScrollbar
            ? '[&::-webkit-scrollbar-thumb]:rounded-[4px] [&::-webkit-scrollbar]:w-[8px]'
            : 'scrollbar-hide'
        }`}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          scrollbarColor: `${borderColor} ${backgroundColor}`,
        }}
      >
        <ul aria-label={ariaLabel} className="m-0 list-none p-0">
          {items.map((item, index) => (
            <AnimatedItem
              key={item + index}
              delay={0.1}
              index={index}
              selected={selectedIndex === index}
              reduced={reduced}
              onSelect={handleItemSelect}
              onActivate={handleItemActivate}
            >
              <div
                className={`rounded-lg border p-4 ${itemClassName}`}
                style={{
                  backgroundColor: selectedIndex === index ? hoverColor : panelColor,
                  borderColor,
                }}
              >
                <p className="m-0" style={{ color: textColor }}>
                  {item}
                </p>
              </div>
            </AnimatedItem>
          ))}
        </ul>
      </div>

      {showGradients && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-0 h-[50px] transition-opacity duration-300"
            style={{
              opacity: topGradientOpacity,
              backgroundImage: `linear-gradient(to bottom, ${backgroundColor}, transparent)`,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-[100px] transition-opacity duration-300"
            style={{
              opacity: bottomGradientOpacity,
              backgroundImage: `linear-gradient(to top, ${backgroundColor}, transparent)`,
            }}
          />
        </>
      )}
    </div>
  );
};

export default AnimatedList;
