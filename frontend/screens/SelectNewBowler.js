import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  FlatList
} from "react-native";
import {
  useState,
  useEffect,
  useCallback
} from "react";
import {
  useFocusEffect
} from "@react-navigation/native";
import {
  useDispatch,
  useSelector
} from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import LoadingSpinner from "../components/LoadingSpinner.js";
import ScrollingText from "../components/ScrollingText.js";
import Spinner from "../components/Spinner.js";
import {
  getCurrentInning
} from "../utils/matchUtils.js";
import {
  ellipsize
} from "../utils/textUtils.js";
import {
  normalize,
  normalizeVertical
} from "../utils/responsive.js";
const SelectNewBowler = ({
  navigation, route
}) => {
  const [bowlingTeam,
    setBowlingTeam] = useState(null);
  const [currentBowler,
    setCurrentBowler] = useState(null);
  const [selectedPlayer,
    setSelectedPlayer] = useState(null);
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
  useEffect(() => {
    setIsScreenFocused(true);
  }, []);

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
            const currentInning = getCurrentInning(data.data);

            setCurrentBowler(currentInning.currentBowler);
            setBowlingTeam(currentInning.bowlingTeam);
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

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus",
      () => {
        setIsLoading(true);
        setSelectedPlayer(null);
      });
    return unsubscribe;
  }, [navigation]);

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
    },
      [isScreenFocused])
  );

  const availablePlayers = () => {
    return bowlingTeam?.playing11.filter(player => {
      return player?._id !== currentBowler?._id;
    });
  };

  const handleChangeBowler = async () => {
    try {
      setShowSpinner(true);

      if (!selectedPlayer) {
        throw new Error("plz select a bowler");
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/change-bowler/${route.params?.matchId}`,

        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            newBowlerId: selectedPlayer._id
          })
        }
      );

      const data = await response.json();
      if (response.status === 200) {
        navigation.navigate("manage-scoreboard", {
          matchId: route.params?.matchId
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setShowSpinner(false);
    }
  };
  
  const bowlingTeamName = bowlingTeam?.name?.trim();

const headerText = bowlingTeamName
  ? `select new bowler ( ${bowlingTeamName} )`
  : "";

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
        <ScrollingText
          text={headerText}
          style={styles.label}
          fitWidth="85%"
          />
      </View>

      {!isLoading ? (
        <>
          <FlatList
            data={availablePlayers()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.player,

                  selectedPlayer?._id === item._id &&
                  styles.selected
                ]}
                onPress={() => setSelectedPlayer(item)}
                >
                <View style={styles.player_icon}>
                  <Text style={styles.player_icon_text}>
                    {item?.name[0]}
                  </Text>
                </View>

                <View style={styles.other_player_info_wrapper}>
                  <Text style={styles.player_name}>
                    {ellipsize(item?.name, 28)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.choose_player_wrapper}
            />
          {selectedPlayer && (
            <View style={styles.confirm_btn_wrapper}>
              <TouchableOpacity
                style={styles.confirm_btn}
                onPress={handleChangeBowler}
                >
                {!showSpinner ? (
                  <Text style={styles.confirm_btn_text}>
                    Continue
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
          )}
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
    backgroundColor: "#FFFFFF",
    width: "100%"
  },
  header: {
    paddingTop: normalizeVertical(38),
    paddingBottom: normalizeVertical(20),
    backgroundColor: "#E21F26",
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(15),
    paddingHorizontal: normalize(20)
  },
  label: {
    fontSize: normalize(20),
    color: "white",
    paddingHorizontal: normalize(13),
    textTransform: "capitalize",
    fontFamily: "robotoBold"
  },
  choose_player_wrapper: {
    gap: normalizeVertical(22),
    paddingTop: normalizeVertical(35),
    paddingBottom: normalizeVertical(82)
  },
  player: {
    width: "90%",
    flexDirection: "row",
    gap: normalize(18),
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: "auto",
    paddingHorizontal: normalize(10),
    paddingVertical: normalizeVertical(10),
    borderRadius: normalize(8),
    elevation: 2,
    borderWidth: 2,
    borderColor: "white"
  },
  player_icon: {
    backgroundColor: "#f75454",
    height: normalize(60),
    width: normalize(61),
    borderRadius: normalize(62/2),
    justifyContent: "center",
    alignItems: "center",
    elevation: 1
  },
  player_icon_text: {
    fontSize: normalize(28),
    color: "white",
    fontFamily: "robotoMedium",
    textTransform: "capitalize"
  },
  player_name: {
    fontSize: normalize(18),
    color: "#474646",
    textTransform: "capitalize",
    fontFamily: "ubuntuMedium"
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

export default SelectNewBowler;