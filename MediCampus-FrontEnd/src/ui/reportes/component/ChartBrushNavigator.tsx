import React, { useRef, useCallback, useState, useEffect } from 'react';

interface ChartBrushNavigatorProps {
  totalDays: number;
  visibleDays: number;
  scrollPosition: number;
  onScrollChange: (scrollLeft: number) => void;
}

const MINIMAP_HEIGHT = 50;
const HANDLE_WIDTH = 8;

export default function ChartBrushNavigator({
  totalDays,
  visibleDays,
  scrollPosition,
  onScrollChange,
}: ChartBrushNavigatorProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScroll, setDragStartScroll] = useState(0);

  const totalBars = totalDays;
  const containerWidth = containerRef.current?.clientWidth ?? 600;
  const barWidth = containerWidth / totalBars;
  const windowWidth = (visibleDays / totalDays) * containerWidth;
  const windowLeft = (scrollPosition / totalDays) * containerWidth;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStartX(e.clientX);
      setDragStartScroll(scrollPosition);
    },
    [scrollPosition],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const dx = e.clientX - dragStartX;
      const daysDelta = (dx / containerWidth) * totalDays;
      const newScroll = Math.max(0, Math.min(totalDays - visibleDays, dragStartScroll + daysDelta));
      onScrollChange(newScroll);
    },
    [isDragging, dragStartX, dragStartScroll, totalDays, visibleDays, containerWidth, onScrollChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleBarClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickDay = (clickX / containerWidth) * totalDays;
      const newScroll = Math.max(0, Math.min(totalDays - visibleDays, clickDay - visibleDays / 2));
      onScrollChange(newScroll);
    },
    [containerWidth, totalDays, visibleDays, onScrollChange],
  );

  return (
    <div className="mt-4 select-none">
      <div className="relative flex items-center">
        <button
          onClick={() => onScrollChange(Math.max(0, scrollPosition - 7))}
          disabled={scrollPosition <= 0}
          className="px-2 py-1 text-sm text-[#006766] disabled:text-gray-300 hover:text-[#00504e] transition-colors"
        >
          ◀
        </button>

        <div
          ref={containerRef}
          className="relative flex-1 h-[50px] bg-[#f0f4f3] rounded-md cursor-pointer overflow-hidden"
          onClick={handleBarClick}
        >
          <div className="absolute inset-0 flex items-end">
            {Array.from({ length: totalBars }, (_, i) => {
              const isVisible =
                i >= scrollPosition && i < scrollPosition + visibleDays;
              return (
                <div
                  key={i}
                  className="flex-1 mx-[1px] rounded-t"
                  style={{
                    height: '100%',
                    backgroundColor: isVisible ? '#006766' : '#bdc9c8',
                    opacity: isVisible ? 0.3 : 0.15,
                  }}
                />
              );
            })}
          </div>

          <div
            className="absolute top-0 h-full bg-[#006766] opacity-20 rounded-md cursor-grab active:cursor-grabbing"
            style={{
              left: `${windowLeft}px`,
              width: `${windowWidth}px`,
              minWidth: `${HANDLE_WIDTH * 3}px`,
            }}
            onMouseDown={handleMouseDown}
          >
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-[#006766] opacity-60"
              style={{ left: 0 }}
            />
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-[#006766] opacity-60"
              style={{ right: 0 }}
            />
          </div>
        </div>

        <button
          onClick={() => onScrollChange(Math.min(totalDays - visibleDays, scrollPosition + 7))}
          disabled={scrollPosition >= totalDays - visibleDays}
          className="px-2 py-1 text-sm text-[#006766] disabled:text-gray-300 hover:text-[#00504e] transition-colors"
        >
          ▶
        </button>
      </div>
      <div className="flex justify-between text-xs text-[#3e4948] mt-1 px-8">
        <span>Inicio</span>
        <span>Fin</span>
      </div>
    </div>
  );
}
