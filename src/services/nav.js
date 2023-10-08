import * as React from 'react';
import { useGlobalData } from './globalData';

export function useNav() {
  const [globalData, setGlobalData] = useGlobalData();

  const isCalView = React.useCallback(() => {
    return ["weekly", "monthly"].includes(globalData.calView);
  }, [globalData.calView]);

  const ensureCalView = React.useCallback(() => {
    if (!isCalView()) setGlobalData((prev) => ({...prev, calView: "weekly"}));
  }, [isCalView, setGlobalData]);

  const isSettingsView = React.useCallback(() => {
    return globalData.calView === "settings";
  }, [globalData.calView])

  return { isCalView, ensureCalView, isSettingsView }
}
