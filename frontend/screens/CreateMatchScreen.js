import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
  StatusBar,
  ScrollView
} from "react-native";
import {
  useState,
  useEffect,
  useCallback
} from "react";
import {
  useSelector,
  useDispatch
} from "react-redux";
import {
  useFocusEffect
} from "@react-navigation/native";
import {
  setTotalOvers,
  setCity,
  setGround,
  setStartTime
} from "../redux/matchSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import {
  showToast
} from "../redux/toastSlice.js";
import {
  ellipsize
} from "../utils/textUtils.js";
import {
  normalize,
  normalizeVertical
} from "../utils/responsive.js";
import {
  useHideTabBar
} from "../utils/useHideTabBar.js";
const CreateMatchScreen = ({
  navigation, route
}) => {
  const [isLoading,
    setIsLoading] = useState(true);
  const [showSpinner,
    setShowSpinner] = useState(false);
  const [isScreenFocused,
    setIsScreenFocused] = useState(false);
  useHideTabBar(navigation, isScreenFocused)
  const dispatch = useDispatch();

  const {
    teamA,
    teamB,
    totalOvers,
    matchPlace,
    startTime
  } = useSelector(
    state => state.match
  );

  const {
    isLoggedin,
    user,
    accessToken
  } = useSelector(state => state.auth);

  useEffect(() => {
    setIsScreenFocused(true);
  }, []);


  const handleCreateMatch = async () => {
    try {
      setShowSpinner(true);
      Keyboard.dismiss();
      if (
        !teamA.id ||
        !teamB.id ||
        !teamA.name ||
        teamA.playing11.length !== 11 ||
        !teamA.captain ||
        !teamB.name ||
        teamB.playing11.length !== 11 ||
        !teamB.captain ||
        !totalOvers ||
        !matchPlace.city ||
        !matchPlace.ground
      ) {
        dispatch(
          showToast( {
            type: "error",
            message: "please fill all required field"
          })
        );
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/create-new-match`,

        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            teamA,
            teamB,
            totalOvers,
            matchPlace,
            startTime
          })
        }
      );

      const data = await response.json();

      if (response.status !== 200) {
        dispatch(showToast( {
          type: "error", message: data.message
        }));
      } else {
        navigation.navigate("toss-screen", {
          matchId: data.data._id
        });

        dispatch(setTotalOvers(null));
        dispatch(setCity(null));
        dispatch(setGround(null));
        dispatch(setStartTime(null));
      }
    } catch (error) {
      console.log(error);
      dispatch(
        showToast( {
          type: "error",
          message: "unexpected error occured,try again latter"
        })
      );
    } finally {
      setShowSpinner(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setTotalOvers(null));
      dispatch(setCity(null));
      dispatch(setGround(null));
      dispatch(setStartTime(null));
      setIsLoading(true);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back_btn}
          onPress={() => navigation.goBack()}
          >
          <Icon
            name="arrow-back"
            size={normalize(26)}
            color="white"
            />
        </TouchableOpacity>
        <Text style={styles.label}>start a match</Text>
      </View>
      <ScrollView style={styles.scroll_view_wrapper}
        showsVerticalScrollIndicator={false}
        >

        <View style={styles.selected_team_wrapper}>
          <View style={styles.selected_team}>
            <View style={styles.selected_team_icon_wrapper}>
              <Text style={styles.selected_team_icon_text}>
                {teamA?.name[0]}
              </Text>
            </View>
            <Text style={styles.selected_team_name}>
              {ellipsize(teamA?.name, 15)}
            </Text>
            <Text style={styles.selected_caption}>team a</Text>
          </View>
          <Text style={styles.versus_text}>Vs</Text>
          <View style={styles.selected_team}>
            <View style={styles.selected_team_icon_wrapper}>
              <Text style={styles.selected_team_icon_text}>
                {teamB?.name[0]}
              </Text>
            </View>
            <Text style={styles.selected_team_name}>
              {ellipsize(teamB?.name, 15)}
            </Text>
            <Text style={styles.selected_caption}>team b</Text>
          </View>
        </View>

        <View style={styles.other_details_wrapper}>
          <View style={styles.text_input_wrapper}>
            <Text style={styles.text_input_label}>No.of Overs*</Text>
            <TextInput
              style={styles.text_input}
              value={totalOvers}
              onChangeText={text => dispatch(setTotalOvers(text))}
              keyboardType="numeric"
              />
          </View>
          <View style={styles.text_input_wrapper}>
            <Text style={styles.text_input_label}>City/Town*</Text>
            <TextInput
              style={styles.text_input}
              value={matchPlace.city}
              onChangeText={text => dispatch(setCity(text))}
              />
          </View>
          <View style={styles.text_input_wrapper}>
            <Text style={styles.text_input_label}>Ground*</Text>
            <TextInput
              style={styles.text_input}
              value={matchPlace.ground}
              onChangeText={text => dispatch(setGround(text))}
              />
          </View>
          <View style={styles.text_input_wrapper}>
            <Text style={styles.text_input_label}>Starting Time ( optional )</Text>
            <TextInput
              style={styles.text_input}
              value={startTime}
              onChangeText={text => dispatch(setStartTime(text))}
              />
          </View>
        </View>
      </ScrollView>
      <View style={styles.confirm_btn_wrapper}>
        <TouchableOpacity
          style={styles.confirm_btn}
          onPress={handleCreateMatch}
          >
          {!showSpinner ? (
            <Text style={styles.confirm_btn_text}>NEXT (TOSS)</Text>
          ): (
            <Spinner
              isLoading={showSpinner}
              label="creating..."
              spinnerColor="white"
              labelColor="white"
              labelSize={19}
              spinnerSize={28}
              />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    width: "100%"
  },
  header: {
    paddingTop: normalizeVertical(38),
    paddingBottom: normalizeVertical(20),
    backgroundColor: "#E21F26",
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(20),
    paddingHorizontal: normalize(20)
  },
  label: {
    fontSize: normalize(20),
    color: "white",
    paddingHorizontal: normalize(13),
    fontFamily: "robotoBold",
    textTransform: "capitalize"
  },
  scroll_view_wrapper: {
    marginBottom: normalizeVertical(82)
  },
  selected_team_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: normalizeVertical(25)
  },
  selected_team: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: normalizeVertical(10)
  },
  versus_text: {
    fontSize: normalize(22),
    fontFamily: "robotoBold"
  },
  selected_team_icon_wrapper: {
    height: normalize(80),
    width: normalize(80),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E21F26",
    borderRadius: normalize(40)
  },
  selected_team_icon_text: {
    fontSize: normalize(28),
    color: "white",
    fontFamily: "robotoMedium",
    textTransform: "capitalize"
  },
  selected_team_name: {
    fontSize: normalize(18),
    fontFamily: "robotoMedium",
    color: "#333333",
    textTransform: "capitalize"
  },
  selected_caption: {
    backgroundColor: "#1A4DA1",
    color: "white",
    fontSize: normalize(16),
    width: normalize(90),
    paddingVertical: normalizeVertical(8),
    borderRadius: normalize(8),
    textTransform: "capitalize",
    fontFamily: "robotoMedium",
    textAlign: "center"
  },
  other_details_wrapper: {
    justifyContent: "center",
    gap: normalizeVertical(15),
    marginHorizontal: normalize(20),
  },
  text_input_wrapper: {
    justifyContent: "center"
  },
  text_input_label: {
    fontSize: normalize(16),
    fontFamily: "ubuntuRegular"
  },
  text_input: {
    paddingVertical: normalizeVertical(10),
    borderBottomWidth: 1,
    borderBottomColor: "#858080",
    fontSize: normalize(17),
    fontFamily: "ubuntuRegular"
  },
  confirm_btn_wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0
  },
  confirm_btn: {
    backgroundColor: "#14B391",
    height: normalizeVertical(60),
    justifyContent: "center",
    alignItems: "center"
  },
  confirm_btn_text: {
    fontSize: normalize(19),
    textAlign: "center",
    color: "white",
    textTransform: "capitalize",
    fontFamily: "robotoBold"
  }
});

export default CreateMatchScreen;