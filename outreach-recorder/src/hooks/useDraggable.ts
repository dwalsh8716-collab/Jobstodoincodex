import { useCallback, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import {
  BUBBLE_SIZE_PERCENT,
  clamp,
  type BubblePosition,
  type BubbleSize,
} from "../utils/media";

type UseDraggableArgs = {
  containerRef: RefObject<HTMLElement | null>;
  position: BubblePosition;
  size: BubbleSize;
  onPositionChange: (position: BubblePosition) => void;
};

export function useDraggable({
  containerRef,
  size,
  onPositionChange,
}: UseDraggableArgs) {
  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const container = containerRef.current;
      if (!container) return;

      const target = event.currentTarget;
      const rect = container.getBoundingClientRect();
      const bubbleWidth = BUBBLE_SIZE_PERCENT[size];
      const bubbleHeight = bubbleWidth * (9 / 16);
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = parseFloat(target.style.left || "0") / 100;
      const startTop = parseFloat(target.style.top || "0") / 100;

      target.setPointerCapture(event.pointerId);

      const move = (moveEvent: globalThis.PointerEvent) => {
        const dx = (moveEvent.clientX - startX) / rect.width;
        const dy = (moveEvent.clientY - startY) / rect.height;
        onPositionChange({
          x: clamp(startLeft + dx, 0, 1 - bubbleWidth),
          y: clamp(startTop + dy, 0, 1 - bubbleHeight),
        });
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    },
    [containerRef, onPositionChange, size],
  );

  return { onPointerDown };
}
