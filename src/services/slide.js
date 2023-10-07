import * as React from 'react';

export function useSlide() {
  const getPrevSlideIndex = React.useCallback((slideIndex) => {
    if (slideIndex === 0) return 2;
    return slideIndex - 1;
  }, [])

  const getNextSlideIndex = React.useCallback((slideIndex) => {
    if (slideIndex === 2) return 0;
    return slideIndex + 1;
  }, [])
  return { getPrevSlideIndex, getNextSlideIndex }
}