import type { RefObject } from "react";
import { useDraggable } from "../hooks/useDraggable";
import {
  BUBBLE_SIZE_PERCENT,
  type BubblePosition,
  type BubbleSize,
} from "../utils/media";

type WebcamBubbleProps = {
  containerRef: RefObject<HTMLElement | null>;
  position: BubblePosition;
  size: BubbleSize;
  visible: boolean;
  onPositionChange: (position: BubblePosition) => void;
};

export function WebcamBubble({
  containerRef,
  position,
  size,
  visible,
  onPositionChange,
}: WebcamBubbleProps) {
  const drag = useDraggable({
    containerRef,
    position,
    size,
    onPositionChange,
  });

  if (!visible) return null;

  const width = BUBBLE_SIZE_PERCENT[size] * 100;

  return (
    <button
      type="button"
      className="bubble-handle"
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        width: `${width}%`,
      }}
      aria-label="Move webcam bubble"
      title="Move webcam bubble"
      onPointerDown={drag.onPointerDown}
    />
  );
}
