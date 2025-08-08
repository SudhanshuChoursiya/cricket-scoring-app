import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform
} from "react-native";
import {
  useState,
  useEffect,
  useCallback
} from "react";
import Modal from "react-native-modal";
import ExtraDimensions from "react-native-extra-dimensions-android";
import {
  useDispatch,
  useSelector
} from "react-redux";
import {
  setOutMethodModal
} from "../redux/modalSlice.js";
import {
  outMethodList
} from "../constants/outMethodList.js";
import {
  useNavigation
} from "@react-navigation/native";
import {
  normalize,
  normalizeVertical
} from "../utils/responsive.js";

const OutMethodModal = ({
  matchDetails, handleUpdateScore
}) => {
  const outMethodModal = useSelector(state => state.modal.outMethodModal);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const deviceWidth = Dimensions.get("window").width;

  const deviceHeight =
  Platform.OS === "ios"
  ? Dimensions.get("window").height: ExtraDimensions.get("REAL_WINDOW_HEIGHT");

  const handleCloseModal = () => {
    dispatch(setOutMethodModal({
      isShow: false
    }));
  };

  const handlePress = outMethod => {
    if (
      outMethod.name === "bowled" ||
      outMethod.name === "lbw" ||
      outMethod.name === "caught & bowled"
    ) {
      handleUpdateScore("OUT", outMethod.payload);
      dispatch(setOutMethodModal({
        isShow: false
      }));
    } else if (
      outMethod.name === "caught" ||
      outMethod.name === "caught behind" ||
      outMethod.name === "stumped"
    ) {
      navigation.navigate("caught-out-fielder-assign", {
        matchId: matchDetails?._id,
        payload: outMethod.payload
      });

      dispatch(setOutMethodModal({
        isShow: false
      }));
    } else if (outMethod.name === "run out") {
      navigation.navigate("run-out-fielder-assign", {
        matchId: matchDetails?._id,
        payload: outMethod.payload
      });

      dispatch(setOutMethodModal({
        isShow: false
      }));
    } else if (outMethod.name === "retired hurt") {
      navigation.navigate("retired-hurt-assign", {
        matchId: matchDetails?._id,
        payload: outMethod.payload
      });

      dispatch(setOutMethodModal({
        isShow: false
      }));
    } else if (outMethod.name === "retired out") {
      navigation.navigate("retired-out-assign", {
        matchId: matchDetails?._id,
        payload: outMethod.payload
      });

      dispatch(setOutMethodModal({
        isShow: false
      }));
    } else if (outMethod.name === "hit wicket") {
      navigation.navigate("hit-wicket-out-assign", {
        matchId: matchDetails?._id,
        payload: outMethod.payload
      });

      dispatch(setOutMethodModal({
        isShow: false
      }));
    }
  };

  return (
    <Modal
      isVisible={outMethodModal.isShow}
      deviceWidth={deviceWidth}
      deviceHeight={deviceHeight}
      backdropOpacity={0.6}
      animationInTiming={200}
      animationOutTiming={200}
      onBackdropPress={handleCloseModal}
      onBackButtonPress={handleCloseModal}
      backdropTransitionOutTiming={0}
      coverScreen={false}
      style={styles.modal_wrapper}
      >
      <View style={styles.modal_container}>
        <Text style={styles.modal_title}>select out type</Text>

        <View style={styles.modal_content}>
          {outMethodList?.map((outMethod, index) => (
            <TouchableOpacity
              style={styles.out_method}
              key={index}
              onPress={() => handlePress(outMethod)}
              >
              <View style={styles.out_method_img_wrapper}>
                <Image
                  style={styles.out_method_img}
                  resizeMode="cover"
                  source={outMethod.img}
                  />
              </View>
              <Text style={styles.out_method_text}>
                {outMethod.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modal_btn_wrapper}>
          <TouchableOpacity
            style={styles.cancel_button}
            onPress={handleCloseModal}
            >
            <Text style={styles.cancel_button_text}>cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal_wrapper: {
    flex: 1,
    position: "relative",
    margin: 0,
    paddingTop: StatusBar.currentHeight
  },
  modal_container: {
    width: "100%",
    height: normalizeVertical(600),
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderTopLeftRadius: normalize(25),
    borderTopRightRadius: normalize(25),
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 1
  },
  modal_title: {
    marginTop: normalizeVertical(25),
    marginBottom: normalizeVertical(20),
    fontSize: normalize(21),
    fontFamily: "robotoMedium",
    textTransform: "capitalize"
  },
  modal_content: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  out_method: {
    width: normalize(92),
    alignItems: "center",
    gap: normalizeVertical(8),
    marginVertical: normalizeVertical(15)
  },
  out_method_img_wrapper: {
    backgroundColor: "#F1F1F1",
    height: normalize(77),
    width: normalize(78),
    borderRadius: normalize(79/2),
    justifyContent: "center",
    alignItems: "center",
    elevation:1
  },
  out_method_img: {
    height: normalize(60),
    width: normalize(60)
  },
  out_method_text: {
    fontSize: normalize(16),
    fontFamily: "robotoMedium",
    width: "85%",
    textAlign: "center",
    textTransform: "capitalize",
    color: "#565656"
  },
  modal_btn_wrapper: {
    flexDirection: "row",
    alignContent: "center"
  },
  cancel_button: {
    marginTop: normalizeVertical(20),
    marginBottom: normalizeVertical(25)
  },

  cancel_button_text: {
    color: "black",
    fontSize: normalize(18),
    fontFamily: "robotoMedium",
    textTransform: "uppercase"
  }
});
export default OutMethodModal;