import * as React from 'react';

export function useTouch() {

  const defaultTouchRef = React.useCallback(() => {
    return {x: 0, y: 0, timeStamp: 0};
  }, []);

  const registerTouch = React.useCallback((event, ref) => {
    ref.current = {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY,
        timeStamp: event.timeStamp
    }
  }, [])

  const handleTouch = React.useCallback((event, ref, callback) => {
    let thresholdPx = 20;
    let thresholdMs = 500;
    if (Math.abs(event.changedTouches[0].clientX-ref.current.x) <= thresholdPx && Math.abs(event.changedTouches[0].clientY-ref.current.y) <= thresholdPx && event.timeStamp-ref.current.timeStamp <= thresholdMs) {
      callback();
      event.preventDefault();
    }
    ref.current = defaultTouchRef();
  }, [defaultTouchRef])

  return { registerTouch, handleTouch, defaultTouchRef }
}
