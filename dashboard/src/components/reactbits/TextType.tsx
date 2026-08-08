'use client';

import React, {
  type ElementType,
  useEffect,
  useRef,
  useState,
  createElement,
  useMemo,
  useCallback,
} from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(useGSAP);

// === Types

export interface TextTypeProps extends React.HTMLAttributes<HTMLElement> {
  text: string | string[];
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string | React.ReactNode;
  cursorBlinkDuration?: number;
  cursorClassName?: string;
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
}

// === Component

export const TextType: React.FC<TextTypeProps> = ({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) => {
  const reduced: boolean = usePrefersReducedMotion();

  const textArray = useMemo<string[]>(() => (Array.isArray(text) ? text : [text]), [text]);

  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(!startOnVisible);
  const [pageVisible, setPageVisible] = useState<boolean>(true);

  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const currentSentence: string = textArray[currentTextIndex] ?? '';

  const getRandomSpeed = useCallback((): number => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const currentColor: string =
    textColors.length === 0 ? 'inherit' : textColors[currentTextIndex % textColors.length];

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    const onVisibility = (): void => setPageVisible(!document.hidden);
    setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useGSAP(
    () => {
      // Reduced motion leaves the cursor solid rather than blinking.
      if (!showCursor || !cursorRef.current) return;
      gsap.set(cursorRef.current, { opacity: 1 });
      if (reduced) return;

      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });
    },
    { dependencies: [showCursor, cursorBlinkDuration, reduced], revertOnUpdate: true },
  );

  useEffect(() => {
    // Reduced motion renders the resolved sentence instead of typing it out.
    if (reduced) {
      setDisplayedText(
        reverseMode ? currentSentence.split('').reverse().join('') : currentSentence,
      );
      setCurrentCharIndex(currentSentence.length);
      return;
    }

    if (!isVisible || !pageVisible) return;

    let timeout: ReturnType<typeof setTimeout>;
    const processedText = reverseMode
      ? currentSentence.split('').reverse().join('')
      : currentSentence;

    const executeTypingAnimation = (): void => {
      if (isDeleting) {
        if (displayedText === '') {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) return;

          onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);
          setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
          setCurrentCharIndex(0);
        } else {
          timeout = setTimeout(() => setDisplayedText((prev) => prev.slice(0, -1)), deletingSpeed);
        }
        return;
      }

      if (currentCharIndex < processedText.length) {
        timeout = setTimeout(
          () => {
            setDisplayedText((prev) => prev + processedText[currentCharIndex]);
            setCurrentCharIndex((prev) => prev + 1);
          },
          variableSpeed ? getRandomSpeed() : typingSpeed,
        );
      } else if (textArray.length >= 1) {
        if (!loop && currentTextIndex === textArray.length - 1) return;
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === '') {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => clearTimeout(timeout);
  }, [
    reduced,
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    currentSentence,
    loop,
    initialDelay,
    isVisible,
    pageVisible,
    reverseMode,
    variableSpeed,
    getRandomSpeed,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping && (currentCharIndex < currentSentence.length || isDeleting);

  /* The typed span mutates one character at a time, so the settled sentence
     is exposed to assistive tech in a visually hidden sibling instead. */
  return createElement(
    Component,
    {
      ref: containerRef,
      className: `inline-block whitespace-pre-wrap tracking-tight ${className}`,
      ...props,
    },
    <span key="sr" className="sr-only">
      {currentSentence}
    </span>,
    <span
      key="visual"
      aria-hidden="true"
      className="inline"
      style={{ color: currentColor || 'inherit' }}
    >
      {displayedText}
    </span>,
    showCursor && (
      <span
        key="cursor"
        ref={cursorRef}
        aria-hidden="true"
        className={`ml-1 inline-block opacity-100 ${shouldHideCursor ? 'hidden' : ''} ${cursorClassName}`}
      >
        {cursorCharacter}
      </span>
    ),
  );
};

export default TextType;
