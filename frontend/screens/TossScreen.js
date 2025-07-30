import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  BackHandler
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
  setTossDecision,
  setTossWinner
} from "../redux/matchSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import batLogo from "../assets/cricket-bat.png";
import ballLogo from "../assets/cricket-ball.png";
import Spinner from "../components/Spinner.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
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
const TossScreen = ({
  navigation, route
}) => {
  const [matchDetails,
    setMatchDetails] = useState(null);
  const [isLoading,
    setIsLoading] = useState(true);
  const [showSpinner,
    setShowSpinner] = useState(false);
  const [isScreenFocused,
    setIsScreenFocused] = useState(false);
  const dispatch = useDispatch();
  const {
    accessToken
  } = useSelector(state => state.auth);
  const {
    tossWinner,
    tossDecision
  } = useSelector(state => state.match);

  useEffect(() => {
    setIsScreenFocused(true);
    return () => setIsScreenFocused(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          display: "none"
        }
      });

      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            display: "flex"
          }
        });
      };
    }, [isScreenFocused])
  );

  useFocusEffect(
    useCallback(() => {
      const getMatchDetails = async () => {
        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_BASE_URL}/get-match-details/${route.params?.matchId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
          const data = await response.json();

          if (response.status === 200) {
            setMatchDetails(data.data);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      };
      getMatchDetails();
    },
      [isScreenFocused])
  );

  const handleBackPress = useCallback(() => {
    if (matchDetails?.matchStatus === "no toss") {
      navigation.navigate("home-screen");
    }
    return true;
  },
    [navigation,
      matchDetails]);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );
      return () => backHandler.remove();
    }, [handleBackPress])
  );

  const handleToss = async () => {
    try {
      setShowSpinner(true);
      if (!tossWinner || !tossDecision) {
        dispatch(
          showToast( {
            type: "error",
            message: "please select all required field"
          })
        );
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/update-toss-details/${route.params?.matchId}`,

        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            tossWinner,
            tossDecision
          })
        }
      );

      const data = await response.json();
      if (response.status !== 200) {
        dispatch(showToast( {
          type: "error", message: data.message
        }));
      } else {
        navigation.navigate("initial-players-assign-screen", {
          matchId: route.params?.matchId
        });
        dispatch(setTossWinner(null));
        dispatch(setTossDecision(null));
      }
    } catch (error) {
      console.log(error);
      dispatch(
        showToast( {
          type: "error",
          message: "unexpected error occured, try again latter"
        })
      );
    } finally {
      setShowSpinner(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(setTossWinner(null));
      dispatch(setTossDecision(null));
      setIsLoading(true);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back_btn}
          onPress={handleBackPress}
          >
          <Icon
            name="arrow-back"
            size={normalize(26)}
            color="white"
            />
        </TouchableOpacity>
        <Text style={styles.label}>Toss</Text>
      </View>
      {!isLoading ? (
        <>
          <View style={styles.toss_winner_wrapper}>
            <Text style={styles.heading}>Who won the toss?</Text>

            <View style={styles.teams_wrapper}>
              <TouchableOpacity
                style={[
                  styles.team,
                  tossWinner === matchDetails?.teamA.name &&
                  styles.selected
                ]}
                onPress={() =>
                dispatch(
                  setTossWinner(matchDetails?.teamA.name)
                )
                }
                >
                <View style={styles.team_icon_wrapper}>
                  <Text style={styles.team_icon_text}>
                    {matchDetails?.teamA.name[0]}
                  </Text>
                </View>
                <Text style={styles.team_name}>
                  {ellipsize(matchDetails?.teamA.name, 26)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.team,
                  tossWinner === matchDetails?.teamB.name &&
                  styles.selected
                ]}
                onPress={() =>
                dispatch(
                  setTossWinner(matchDetails?.teamB.name)
                )
                }
                >
                <View style={styles.team_icon_wrapper}>
                  <Text style={styles.team_icon_text}>
                    {matchDetails?.teamB.name[0]}
                  </Text>
                </View>
                <Text style={styles.team_name}>
                  {ellipsize(matchDetails?.teamB.name, 26)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.toss_decision_wrapper}>
            <Text style={styles.heading}>
              Winner of the toss elected to?
            </Text>

            <View style={styles.decisions_wrapper}>
              <TouchableOpacity
                style={[
                  styles.decision,
                  tossDecision === "bat" && styles.selected
                ]}
                onPress={() => dispatch(setTossDecision("bat"))}
                >
                <View style={styles.decision_icon_wrapper}>
                  <Image
                    style={styles.decision_icon}
                    resizeMode="cover"
                    source={batLogo}
                    />
                </View>
                <Text style={styles.decision_text}>bat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.decision,
                  tossDecision === "ball" && styles.selected
                ]}
                onPress={() =>
                dispatch(setTossDecision("ball"))
                }
                >
                <View style={styles.decision_icon_wrapper}>
                  <Image
                    style={styles.decision_icon}
                    resizeMode="cover"
                    source={ballLogo}
                    />
                </View>
                <Text style={styles.decision_text}>ball</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.confirm_btn_wrapper}>
            <TouchableOpacity
              style={styles.confirm_btn}
              onPress={handleToss}
              >
              {!showSpinner ? (
                <Text style={styles.confirm_btn_text}>
                  Let’s Play
                </Text>
              ): (
                <Spinner
                  isLoading={showSpinner}
                  label="processing..."
                  spinnerColor="white"
                  labelColor="white"
                  labelSize={19}
                  spinnerSize={28}
                  />
              )}
            </TouchableOpacity>
          </View>
        </>
      ): (
        <LoadingSpinner />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F2F2F2",
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
    textTransform: "capitalize",
    fontFamily: "robotoBold"
  },
  heading: {
    fontSize: normalize(20),
    color: "black",
    fontFamily: "robotoMedium"
  },
  toss_winner_wrapper: {
    gap: normalizeVertical(20),
    marginHorizontal: normalize(22),
    marginVertical: normalizeVertical(30)
  },
  teams_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  team: {
    alignItems: "center",
    justifyContent: "center",
    gap: normalizeVertical(12),
    backgroundColor: "#FFFFFF",
    width: normalize(158),
    height: normalizeVertical(200),
    borderRadius: normalize(7),
    borderWidth: 2,
    borderColor: "white",
    elevation: 2
  },

  team_icon_wrapper: {
    height: normalize(90),
    width: normalize(90),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F54133",
    borderRadius: normalize(45)
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
  toss_decision_wrapper: {
    gap: normalizeVertical(20),
    marginHorizontal: normalize(22),
    marginVertical: normalizeVertical(50)
  },
  decisions_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  decision: {
    alignItems: "center",
    justifyContent: "center",
    gap: normalizeVertical(12),
    backgroundColor: "#FFFFFF",
    width: normalize(158),
    height: normalizeVertical(200),
    borderRadius: normalize(7),
    borderWidth: 2,
    borderColor: "white",
    elevation: 2
  },
  decision_icon_wrapper: {
    height: normalize(90),
    width: normalize(90),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F54133",
    borderRadius: normalize(45)
  },
  decision_icon: {
    height: normalize(58),
    width: normalize(58)
  },
  decision_text: {
    color: "black",
    fontSize: normalize(18),
    fontFamily: "robotoMedium",
    textTransform: "capitalize"
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
  },
  selected: {
    borderWidth: 2,
    borderColor: "#14B391"
  }
});

export default TossScreen;