import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  Platform
} from "react-native";

import Modal from "react-native-modal";
import ExtraDimensions from "react-native-extra-dimensions-android";
import {
  useDispatch,
  useSelector
} from "react-redux";
import {
  setReplaceBatsmanModal
} from "../redux/modalSlice.js";
import {
  useNavigation
} from "@react-navigation/native";
import {
  ellipsize
} from "../utils/textUtils.js";
import {
  normalize,
  normalizeVertical
} from "../utils/responsive.js";

const ReplaceBatsmanModal = ({
  matchId, currentInningDetails
}) => {
  const replaceBatsmanModal = useSelector(
    state => state.modal.replaceBatsmanModal
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const deviceWidth = Dimensions.get("window").width;

  const deviceHeight =
  Platform.OS === "ios"
  ? Dimensions.get("window").height: ExtraDimensions.get("REAL_WINDOW_HEIGHT");
  const handleCloseModal = () => {
    dispatch(setReplaceBatsmanModal({
      isShow: false
    }));
  };
  const handleNavigate = replacedBatsmanId => {
    navigation.push("select-new-batsman", {
      matchId,
      replacedBatsmanId
    });
    dispatch(setReplaceBatsmanModal({
      isShow: false
    }));
  };
  return (
    <Modal
      isVisible={replaceBatsmanModal.isShow}
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
        <View style={styles.modal_content}>
          <Text style={styles.modal_title}>
            Whom do you want to replace?
          </Text>
          <View style={styles.select_batsman_wrapper}>
            {currentInningDetails?.currentBatsmen.map(batsman => (
              <TouchableOpacity
                style={styles.batsman}
                onPress={() => handleNavigate(batsman._id)}
                key={batsman._id}
                >
                <View style={styles.batsman_icon_wrapper}>
                  <Text style={styles.batsman_icon_text}>
                    {batsman?.name[0]}
                  </Text>
                </View>
                <Text style={styles.batsman_name}
                  numberOfLines={1} ellipsizeMode="tail">
                  {batsman?.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.close_btn}
            onPress={handleCloseModal}
            >
            <Text style={styles.close_btn_text}>cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal_wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    margin: 0,
    paddingTop: StatusBar.currentHeight
  },
  modal_container: {
    width: normalize(320),
    backgroundColor: "white",
    borderRadius: normalize(10),
    gap: normalizeVertical(20),
    paddingVertical: normalizeVertical(20),
    elevation: 1
  },
  modal_title: {
    fontSize: normalize(21),
    fontFamily: "ubuntuBold",
    color: "#39444B",
    textAlign: "center"
  },
  modal_content: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: normalize(15),
    paddingVertical: normalizeVertical(15),
    gap: normalizeVertical(22)
  },
  modal_desc: {
    fontSize: normalize(18),
    fontFamily: "ubuntuRegular",
    color: "#A8ACAF",
    textAlign: "center"
  },
  select_batsman_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: normalize(15)
  },
  batsman: {
    alignItems: "center",
    justifyContent: "center",
    gap: normalizeVertical(18),
    backgroundColor: "#FFFFFF",
    width: normalize(135),
    height: normalizeVertical(185),
    borderRadius: normalize(7),
    borderWidth: 2,
    borderColor: "white",
    elevation: 2
  },
  batsman_icon_wrapper: {
    height: normalize(80),
    width: normalize(81),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F54133",
    borderRadius: normalize(82/2),
    elevation: 1
  },
  batsman_icon_text: {
    fontSize: normalize(28),
    color: "white",
    fontFamily: "robotoMedium",
    textTransform: "capitalize"
  },
  batsman_name: {
    width: "100%",
    paddingHorizontal: normalize(5),
    color: "black",
    fontSize: normalize(18),
    fontFamily: "robotoMedium",
    textTransform: "capitalize",
    textAlign: "center"
  },
  close_btn: {
    backgroundColor: "#f5f5f5",
    paddingVertical: normalizeVertical(10),
    paddingHorizontal: normalize(30),
    borderRadius: normalize(8),
    elevation: 1
  },
  close_btn_text: {
    color: "#AF2B1C",
    fontSize: normalize(16),
    fontFamily: "robotoMedium",
    textTransform: "uppercase",
    textAlign: "center"
  }
});
export default ReplaceBatsmanModal;