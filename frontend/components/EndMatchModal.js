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
import {
  useState
} from "react";
import Modal from "react-native-modal";
import ExtraDimensions from "react-native-extra-dimensions-android";
import {
  useDispatch,
  useSelector
} from "react-redux";
import {
  setEndMatchModal
} from "../redux/modalSlice.js";
import {
  showToast
} from "../redux/toastSlice.js";

import {
  useNavigation,
  useFocusEffect
} from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "./Spinner.js";
import CheckBox from "../components/CheckBox.js";
import {
  ellipsize
} from "../utils/textUtils.js";
import {
  normalize,
  normalizeVertical
} from "../utils/responsive.js";

const EndMatchModal = ({
  matchId,
  matchDetails,
  showSpinner,
  setShowSpinner
}) => {
  const [selectedTeam,
    setSelectedTeam] = useState(null);
  const [isMatchAbandoned,
    setIsMatchAbandoned] = useState(false);

  const endMatchModal = useSelector(state => state.modal.endMatchModal);
  const {
    accessToken
  } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const deviceWidth = Dimensions.get("window").width;

  const deviceHeight =
  Platform.OS === "ios"
  ? Dimensions.get("window").height: ExtraDimensions.get("REAL_WINDOW_HEIGHT");
  const handleCloseModal = () => {
    dispatch(setEndMatchModal({
      isShow: false
    }));
    setIsMatchAbandoned(false);
    setSelectedTeam(null);
  };

  const handleConfirmModal = async () => {
    try {
      setShowSpinner(true);
      let payload = {};
      if (!selectedTeam && !isMatchAbandoned) {
        dispatch(
          showToast( {
            type: "error",
            message:
            "please select wining team or check match Abandoned"
          })
        );
        return;
      }

      if (selectedTeam?.teamId) {
        payload.winningTeamId = selectedTeam.teamId;
      } else if (isMatchAbandoned) {
        payload.isMatchAbandoned = isMatchAbandoned;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/end-match/${matchId}`,

        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.status !== 200) {
        dispatch(showToast( {
          type: "error", message: data.message
        }));
      } else {
        navigation.navigate("home-screen");

        dispatch(setEndMatchModal({
          isShow: false
        }));
        setIsMatchAbandoned(false);
        setSelectedTeam(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setShowSpinner(false);
    }
  };
  return (
    <Modal
      isVisible={endMatchModal.isShow}
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
            Which Team won the match?
          </Text>
          <View style={styles.select_team_wrapper}>
            {[matchDetails?.teamA, matchDetails?.teamB].map(
              team => (
                <TouchableOpacity
                  style={[
                    styles.team,
                    selectedTeam?.teamId === team?.teamId &&
                    styles.selected
                  ]}
                  onPress={() => {
                    setSelectedTeam(team);
                    isMatchAbandoned &&
                    setIsMatchAbandoned(false);
                  }}
                  key={team?.teamId}
                  >
                  <View style={styles.team_icon_wrapper}>
                    <Text style={styles.team_icon_text}>
                      {team?.name[0]}
                    </Text>
                  </View>
                  <Text style={styles.team_name}>
                    {ellipsize(team?.name, 26)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
          <View style={styles.checkbox_wrapper}>
            <CheckBox
              options={ {
                label: "Match Abandoned",
                value: true
              }}
              checkedValue={isMatchAbandoned}
              onCheck={value => {
                setIsMatchAbandoned(value);
                if (value) {
                  setSelectedTeam(null);
                }
              }}
              />
          </View>
        </View>
        <View style={styles.modal_btn_wrapper}>
          <TouchableOpacity
            style={styles.cancel_button}
            onPress={handleCloseModal}
            >
            <Text style={styles.cancel_button_text}>cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ok_button}
            onPress={handleConfirmModal}
            >
            <Text style={styles.ok_button_text}>ok</Text>
            {showSpinner && (
              <Spinner
                isLoading={showSpinner}
                spinnerColor="white"
                spinnerSize={28}
                />
            )}
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
    paddingTop: normalizeVertical(20),
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
    paddingVertical: normalizeVertical(15),
    gap: normalizeVertical(30)
  },
  modal_desc: {
    fontSize: normalize(18),
    fontFamily: "ubuntuRegular",
    color: "#A8ACAF",
    textAlign: "center"
  },
  select_team_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: normalize(15)
  },
  team: {
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
  team_icon_wrapper: {
    height: normalize(80),
    width: normalize(81),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F54133",
    borderRadius: normalize(81/2),
    elevation:1
  },
  team_icon_text: {
    fontSize: normalize(28),
    color: "white",
    fontFamily: "robotoMedium",
    textTransform: "capitalize"
  },
  team_name: {
    color: "black",
    fontSize: normalize(18),
    fontFamily: "robotoMedium",
    textTransform: "capitalize",
    textAlign: "center",
  },
  checkbox_wrapper: {
    marginHorizontal: normalize(18)
  },
  modal_btn_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: normalizeVertical(22)
  },
  cancel_button: {
    width: "50%",
    height: normalizeVertical(60),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderBottomLeftRadius: normalize(10)
  },
  ok_button: {
    width: "50%",
    height: normalizeVertical(60),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: normalize(10),
    backgroundColor: "#14B492",
    borderBottomRightRadius: normalize(10)
  },
  cancel_button_text: {
    color: "black",
    fontSize: normalize(17),
    fontFamily: "robotoBold",
    textTransform: "uppercase",
    textAlign: "center"
  },
  ok_button_text: {
    color: "white",
    fontSize: normalize(17),
    fontFamily: "robotoBold",
    textTransform: "uppercase",
    textAlign: "center"
  },
  selected: {
    borderWidth: 2,
    borderColor: "#14B391"
  }
});
export default EndMatchModal;