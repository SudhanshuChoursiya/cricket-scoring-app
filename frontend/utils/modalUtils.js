import * as modalActions from "../redux/modalSlice";

export const closeOpenModals = (modalState, dispatch) => {
  // Find the first modal that is open
  const openModalKey = Object.keys(modalState).find(
    key => modalState[key]?.isShow
  );

  if (openModalKey) {
    // Dynamically get the setter from modalSlice exports
    const setterName =
      "set" + openModalKey.charAt(0).toUpperCase() + openModalKey.slice(1);

    const setter = modalActions[setterName];

    if (setter) {
      dispatch(setter({ isShow: false }));
      return true; // modal was open and closed
    }
  }

  return false; // no modal open
};