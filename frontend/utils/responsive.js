import {
  Dimensions,
  Platform,
  PixelRatio
} from "react-native";
import ExtraDimensions from "react-native-extra-dimensions-android";

export function normalize(size) {
  const SCREEN_WIDTH =
  Platform.OS === "ios"
  ? Dimensions.get("window").width: ExtraDimensions.get("REAL_WINDOW_WIDTH");
  const scale = SCREEN_WIDTH / 375;
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
  }
}

export function normalizeVertical(size) {
  const SCREEN_HEIGHT =
    Platform.OS === "ios"
    ? Dimensions.get("window").height: ExtraDimensions.get("REAL_WINDOW_HEIGHT");
    const scaleVertical = SCREEN_HEIGHT / 812;
  const newSize = size * scaleVertical;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
  }
}

export function isTab() {
  if (SCREEN_WIDTH > 550) {
    return true;
  } else {
    return false;
  }
}