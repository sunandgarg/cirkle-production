import { useState, useRef, useCallback, useEffect } from "react";

interface ScrollBehaviorState {
  showHeader: boolean;
  showInput: boolean;
  showNavBar: boolean;
}

export const useScrollBehavior = (scrollRef: React.RefObject<HTMLDivElement | null>) => {
  const [state, setState] = useState<ScrollBehaviorState>({
    showHeader: true,
    showInput: true,
    showNavBar: true,
  });

  const lastScrollY = useRef(0);
  const accumulatedUp = useRef(0);
  const accumulatedDown = useRef(0);
  const lastDirection = useRef<"up" | "down" | null>(null);
  const ticking = useRef(false);

  const THRESHOLD = 80;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || ticking.current) return;

    ticking.current = true;
    requestAnimationFrame(() => {
      const currentY = el.scrollTop;
      const delta = currentY - lastScrollY.current;
      const atBottom = el.scrollHeight - currentY - el.clientHeight < 20;

      // At bottom — restore everything
      if (atBottom) {
        setState({ showHeader: true, showInput: true, showNavBar: true });
        accumulatedUp.current = 0;
        accumulatedDown.current = 0;
        lastScrollY.current = currentY;
        ticking.current = false;
        return;
      }

      if (delta > 0) {
        // Scrolling DOWN (towards newer)
        if (lastDirection.current !== "down") {
          accumulatedDown.current = 0;
        }
        accumulatedDown.current += delta;
        accumulatedUp.current = 0;
        lastDirection.current = "down";

        if (accumulatedDown.current > THRESHOLD) {
          setState(prev => ({ ...prev, showInput: true, showNavBar: true }));
        }
      } else if (delta < 0) {
        // Scrolling UP (towards older)
        if (lastDirection.current !== "up") {
          accumulatedUp.current = 0;
        }
        accumulatedUp.current += Math.abs(delta);
        accumulatedDown.current = 0;
        lastDirection.current = "up";

        if (accumulatedUp.current > THRESHOLD) {
          setState(prev => ({ ...prev, showInput: false, showNavBar: false }));
        }
      }

      lastScrollY.current = currentY;
      ticking.current = false;
    });
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll, scrollRef]);

  // Restore all on tap (for use as a callback)
  const restoreAll = useCallback(() => {
    setState({ showHeader: true, showInput: true, showNavBar: true });
    accumulatedUp.current = 0;
    accumulatedDown.current = 0;
  }, []);

  return { ...state, restoreAll };
};
