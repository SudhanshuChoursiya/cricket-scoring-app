// utils/useHideTabBar.js
import {
  useFocusEffect
} from '@react-navigation/native';
import {
  useCallback
} from 'react';
import {
  normalize,
  normalizeVertical
} from "../utils/responsive.js";
export const useHideNestedTabBar = (navigation, isScreenFocused) => {
  useFocusEffect(
    useCallback(() => {
      // Hide the tab bar without layout shift
      navigation.getParent()?.getParent()?.setOptions({
        tabBarStyle: {
          position: 'absolute',
          height: 0,
        },
      });

      // Reset tab bar when screen is unfocused
      return () =>
      navigation.getParent()?.getParent()?.setOptions({
        tabBarStyle: {
          position: 'absolute',
          height: normalizeVertical(60), // match your default
        },
      });
    }, [isScreenFocused,navigation])
  );
};