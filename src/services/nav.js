import * as React from 'react';
import { useGlobalData } from './globalData';

export function useNav() {
  const [globalData, setGlobalData] = useGlobalData();

  const ensureCalView = React.useCallback(() => {
    if (!["weekly", "monthly"].includes(globalData.calView)) setGlobalData((prev) => ({...prev, calView: "weekly"}));
  }, [globalData.calView, setGlobalData]);

  return { ensureCalView }
}
