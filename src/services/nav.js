import * as React from 'react';
import { useGlobalData } from './globalData';
import { isMobile } from 'react-device-detect';

export function useNav() {
  const [globalData, setGlobalData] = useGlobalData();

  const isCalView = React.useCallback(() => {
    return ["weekly", "monthly"].includes(globalData.calView);
  }, [globalData.calView]);
  
  const switchToCalView = React.useCallback(() => {
    if (isMobile) {
      setGlobalData((prev) => ({ ...prev, calView: "weekly"}))
    } else {
      setGlobalData((prev) => ({ ...prev, calView: "monthly"}))
    }
  }, [setGlobalData])

  const ensureCalView = React.useCallback(() => {
    if (!isCalView()) {
      switchToCalView();
    }
  }, [isCalView, switchToCalView]);

  const isSettingsView = React.useCallback(() => {
    return globalData.calView === "settings";
  }, [globalData.calView])

  return { isCalView, switchToCalView, ensureCalView, isSettingsView }
}
