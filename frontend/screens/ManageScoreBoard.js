import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StatusBar,
  BackHandler
} from "react-native";
import {
  useState,
  useEffect,
  useCallback,
  useRef
} from "react";
import {
  useFocusEffect
} from "@react-navigation/native";
import {
  useDispatch,
  useSelector
} from "react-redux";
import {
  throttle
} from "lodash";
import {
  setExtraRunsModal,
  setOverCompleteModal,
  setInningCompleteModal,
  setMatchCompleteModal,
  setSuperOverModal,
  setUndoModal,
  setChangeStrikeModal,
  setReplaceBowlerModal,
  setOutMethodModal,
  setCustomRunsModal
} from "../redux/modalSlice.js";
import {
  setFielder,
  setUndoStack,
  popUndoStack
} from "../redux/matchSlice.js";
import {
  primaryScoreButtons,
  secondaryScoreButtons,
  extrasScoreButtons
} from "../constants/scoreButtons";
import {
  showToast
} from "../redux/toastSlice.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import Sidebar from "../components/Sidebar.js";
import Spinner from "../components/Spinner.js";
import Icon from "react-native-vector-icons/MaterialIcons";

import ExtraRunsModal from "../components/ExtraRunsModal.js";
import CustomRunsModal from "../components/CustomRunsModal.js";
import OverCompletionModal from "../components/OverCompletionModal.js";
import InningCompletionModal from "../components/InningCompletionModal.js";
import MatchCompletionModal from "../components/MatchCompletionModal.js";
import ReplaceBowlerModal from "../components/ReplaceBowlerModal.js";
import ReplaceBatsmanModal from "../components/ReplaceBatsmanModal.js";
import ChangeSquadModal from "../components/ChangeSquadModal.js";
import EndInningModal from "../components/EndInningModal.js";
import EndMatchModal from "../components/EndMatchModal.js";
import UndoModal from "../components/UndoModal.js";
import ChangeStrikerModal from "../components/ChangeStrikerModal.js";
import OutMethodModal from "../components/OutMethodModal.js";
import SuperOverModal from "../components/SuperOverModal.js";
import {
  io
} from "socket.io-client";
import {
  getCurrentInning
} from "../utils/matchUtils.js";
import {
  ellipsize,
  formatOver,
  formatOverTimeline
} from "../utils/textUtils.js";
import {
  normalize,
  normalizeVertical
} from "../utils/responsive.js";

const ManageScoreBoardScreen = ({
  navigation, route
}) => {
  const [matchDetails,
    setMatchDetails] = useState(null);
  const [currentInningDetails,
    setCurrentInningDetails] = useState(null);

  const [isLoading,
    setIsLoading] = useState(true);

  const [showSpinner,
    setShowSpinner] = useState(false);
  const [showSidebar,
    setShowSidebar] = useState(false);
  const [isScreenFocused,
    setIsScreenFocused] = useState(false);
  const [isWicketFallen,
    setIsWicketFallen] = useState(false);
  const overTimeLineScrollRef = useRef(null);
  const dispatch = useDispatch();

  const {
    extraRunsModal,
    customRunsModal
  } = useSelector(
    state => state.modal
  );

  const {
    undoStack
  } = useSelector(state => state.match);

  const {
    accessToken
  } = useSelector(state => state.auth);

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

        let currentInning = getCurrentInning(data.data);
        if (!data.data.isSuperOver) {
          if (
            !data.data.isSecondInningStarted &&
            data.data.currentInning === 2
          ) {
            currentInning = data.data.inning1;
          }
        } else {
          if (
            !data.data.isSecondInningStarted &&
            data.data.superOver.currentInning === 2
          ) {
            currentInning = data.data.superOver.inning1;
          }
        }
        setCurrentInningDetails(currentInning);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getMatchDetails();
    }, [])
  );

  useEffect(() => {
    setIsScreenFocused(true);
    return () => setIsScreenFocused(false);
  }, []);

  const handleBackPress = useCallback(() => {
    if (
      (matchDetails?.matchStatus === "in progress" ||
        matchDetails?.matchStatus === "super over") &&
      !matchDetails?.isOverChangePending
    ) {
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

  useEffect(() => {
    const socket = io(`${process.env.EXPO_PUBLIC_BASE_URL}`);
    socket.on("scoreUpdated", ({
      match
    }) => {
      setMatchDetails(match);

      let currentInning = getCurrentInning(match);
      if (!match.isSuperOver) {
        if (!match.isSecondInningStarted && match.currentInning === 2) {
          currentInning = match.inning1;
        }
      } else {
        if (
          !match.isSecondInningStarted &&
          match.superOver.currentInning === 2
        ) {
          currentInning = match.superOver.inning1;
        }
      }
      setCurrentInningDetails(currentInning);
    });

    socket.on("wicketFallen",
      () => {
        setIsWicketFallen(true);
      });

    socket.on("overCompleted",
      () => {
        dispatch(setOverCompleteModal({
          isShow: true
        }));
      });

    socket.on("inningCompleted",
      () => {
        dispatch(setInningCompleteModal({
          isShow: true
        }));
      });

    socket.on("matchTied",
      () => {
        dispatch(setSuperOverModal({
          isShow: true
        }));
      });
    socket.on("superOverTied",
      () => {
        dispatch(setSuperOverModal({
          isShow: true
        }));
      });
    socket.on("matchCompleted",
      () => {
        dispatch(setMatchCompleteModal({
          isShow: true
        }));
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentInningDetails?.currentOverTimeline.length > 0) {
      overTimeLineScrollRef.current?.scrollToEnd({
        animated: true
      });

      dispatch(setUndoStack(currentInningDetails?.currentOverTimeline));
    }
  },
    [currentInningDetails?.currentOverTimeline]);

  useFocusEffect(
    useCallback(() => {
      if (isWicketFallen) {
        navigation.navigate("select-new-batsman", {
          matchId: route.params?.matchId
        });
        setIsWicketFallen(false);
      }
    },
      [isWicketFallen])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus",
      () => {
        dispatch(setFielder({
          _id: null, name: null
        }));
      });
    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        StatusBar.setBarStyle("light-content");
      } else {
        StatusBar.setBarStyle("dark-content");
      }
      return () => {
        StatusBar.setBarStyle("default");
      };
    },
      [isScreenFocused,
        isLoading])
  );

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



  const handleOpenModal = (modalType, payload) => {
    if (modalType === "WD") {
      dispatch(
        setExtraRunsModal({
          title: "Wide Ball",
          runsInput: {
            isShow: true,
            value: 0,
            label: "WD"
          },
          payload: payload,
          isShow: true
        })
      );
    } else if (modalType === "NB") {
      dispatch(
        setExtraRunsModal({
          title: "No Ball",
          runsInput: {
            isShow: true,
            value: 0,
            label: "NB"
          },
          payload: payload,
          isShow: true
        })
      );
    } else if (modalType === "BY") {
      dispatch(
        setExtraRunsModal({
          title: "Bye",
          runsInput: {
            isShow: false,
            value: 0,
            label: "BY"
          },
          payload: payload,
          isShow: true
        })
      );
    } else if (modalType === "LB") {
      dispatch(
        setExtraRunsModal({
          title: "Leg Bye",
          runsInput: {
            isShow: false,
            value: 0,
            label: "LB"
          },
          payload: payload,
          isShow: true
        })
      );
    } else if (modalType === "5,7") {
      dispatch(
        setCustomRunsModal({
          runsInput: {
            isShow: true,
            value: 0,
            label: "5,7"
          },
          payload: payload,
          isShow: true
        })
      );
    } else if (modalType === "UNDO") {
      if (undoStack.length === 0) {
        dispatch(
          showToast( {
            type: "error",
            message: "no more undo operation"
          })
        );
        return;
      }

      dispatch(setUndoModal({
        isShow: true
      }));
    } else if (modalType === "OUT") {
      dispatch(setOutMethodModal({
        isShow: true
      }));
    }
  };

  const handleUpdateScore = async (typeOfBall, payloadData) => {
    try {
      let payload = payloadData;

      if (
        typeOfBall === "WD" ||
        typeOfBall === "NB" ||
        typeOfBall === "BY" ||
        typeOfBall === "LB"
      ) {
        payload = {
          ...payload,
          runs: extraRunsModal.runsInput?.value
        };
      }

      if (typeOfBall === "5,7") {
        payload = {
          ...payload,
          runs: customRunsModal.runsInput?.value
        };
      }

      if (
        payload.runs === undefined ||
        payload.isWide === undefined ||
        payload.isNoball === undefined ||
        payload.isBye === undefined ||
        payload.isLegBye === undefined ||
        payload.isWicket === undefined ||
        payload.isDeadBall === undefined
      ) {
        dispatch(
          showToast( {
            type: "error",
            message: "please provide all required field"
          })
        );
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/update-score/${route.params?.matchId}`,

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
        console.log(data.message);
      }

      if (response.status === 429) {
        dispatch(showToast( {
          type: "warning", message: data.message
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeStrike = async () => {
    try {
      setShowSpinner(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/change-strike/${route.params?.matchId}`,

        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (response.status !== 200) {
        dispatch(showToast( {
          type: "error", message: data.message
        }));
      } else {
        dispatch(setChangeStrikeModal({
          isShow: false
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setShowSpinner(false);
    }
  };

  const handleUndoScore = async () => {
    try {
      setShowSpinner(true);
      let previousOverTimeline;
      if (currentInningDetails?.currentOverBalls === 0) {
        previousOverTimeline = undoStack.slice(-6);
      }
      const lastAction = undoStack[undoStack.length - 1];
      dispatch(popUndoStack());

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/undo-score/${route.params?.matchId}`,

        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            lastAction, previousOverTimeline
          })
        }
      );

      const data = await response.json();
      if (response.status !== 200) {
        dispatch(showToast( {
          type: "error", message: data.message
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setShowSpinner(false);
    }
  };

  return (
    <>
      {!isLoading ? (
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
            <Text style={styles.label}>
              {ellipsize(
                currentInningDetails?.battingTeam.name,
                26
              )}
            </Text>
            <TouchableOpacity
              style={styles.settings_btn}
              onPress={() => setShowSidebar(!showSidebar)}
              >
              <Icon
                name="settings"
                size={normalize(26)}
                color="white"
                />
            </TouchableOpacity>
          </View>

          <View style={styles.scoreboard_wrapper}>
            <View style={styles.scores_and_match_status_wrapper}>
              <View style={styles.score_and_over_wrapper}>
                <View style={styles.score_wrapper}>
                  <Text style={styles.team_score_text}>
                    {currentInningDetails?.totalScore}/
                    {currentInningDetails?.wicketsFallen}
                  </Text>
                </View>
                <View style={styles.overs_wrapper}>
                  <Text style={styles.overs_text}>
                    ({currentInningDetails?.currentOvers}.
                    {currentInningDetails?.currentOverBalls}
                    /{currentInningDetails?.totalOvers})
                  </Text>
                </View>
              </View>

              {!matchDetails?.isSecondInningStarted &&
              !matchDetails?.isSuperOver && (
                <View style={styles.match_status_wrapper}>
                  <Text style={styles.match_status}>
                    {ellipsize(
                      matchDetails?.toss.tossWinner,
                      26
                    )}{" "}
                    won the toss and elected to{" "}
                    {matchDetails?.toss.tossDecision}
                  </Text>
                </View>
              )}
              {matchDetails?.isSuperOver && (
                <View style={styles.match_status_wrapper}>
                  <Text style={styles.match_status}>
                    Super Over In Progress
                  </Text>
                </View>
              )}

              {matchDetails?.matchStatus === "in progress" &&
              matchDetails?.isSecondInningStarted &&
              !matchDetails?.isSuperOver && (
                <View style={styles.match_status_wrapper}>
                  <Text style={styles.match_status}>
                    {ellipsize(
                      currentInningDetails
                      ?.battingTeam.name,
                      26
                    )}{" "}
                    needs{" "}
                    {matchDetails?.targetScore -
                    matchDetails?.inning2
                    .totalScore}{" "}
                    runs in{" "}
                    {matchDetails?.inning2.totalOvers *
                    6 -
                    matchDetails.inning2
                    .currentOvers *
                    6 -
                    matchDetails.inning2
                    .currentOverBalls}{" "}
                    balls
                  </Text>
                </View>
              )}
              {matchDetails?.matchStatus === "super over" &&
              matchDetails?.isSecondInningStarted &&
              matchDetails?.isSuperOver && (
                <View style={styles.match_status_wrapper}>
                  <Text style={styles.match_status}>
                    {ellipsize(
                      currentInningDetails
                      ?.battingTeam.name,
                      26
                    )}{" "}
                    needs{" "}
                    {matchDetails?.superOver
                    ?.targetScore -
                    matchDetails?.superOver?.inning2
                    .totalScore}{" "}
                    runs in{" "}
                    {matchDetails?.superOver?.inning2
                    .totalOvers *
                    6 -
                    matchDetails?.superOver?.inning2
                    .currentOvers *
                    6 -
                    matchDetails?.superOver?.inning2
                    .currentOverBalls}{" "}
                    balls
                  </Text>
                </View>
              )}

              {matchDetails?.matchStatus === "completed" &&
              matchDetails?.matchResult && (
                <View style={styles.match_status_wrapper}>
                  <Text style={styles.match_status}>
                    {matchDetails.matchResult.status ===
                    "Win"
                    ? `${ellipsize(
                      matchDetails.matchResult
                      .winningTeam,
                      26
                    )} won by ${
                    matchDetails.matchResult
                    .winningMargin
                    }`: matchDetails.matchResult
                    .status === "Tie"
                    ? "Match Tied": matchDetails.matchResult
                    .status === "Super Over"
                    ? `${ellipsize(
                      matchDetails.matchResult
                      .winningTeam,
                      26
                    )} won the super over`: matchDetails.matchResult
                    .status ===
                    "Super Over Tie"
                    ? "Super Over Tied": ""}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.current_batsman_wrapper}>
              {currentInningDetails?.currentBatsmen.map(
                (player, index) => (
                  <Pressable
                    style={[
                      styles.current_batsman,
                      {
                        alignItems:
                        index === 0
                        ? "flex-start": "flex-end"
                      }]}
                    key={player._id}
                    onPress={() =>
                    dispatch(
                      setChangeStrikeModal({
                        isShow: true
                      })
                    )
                    }
                    >
                    <View
                      style={styles.batsman_score_wrapper}
                      >
                      <Text style={styles.batsman_score}>
                        {player.runs} ({player.balls})
                      </Text>
                    </View>
                    <View
                      style={styles.batsman_name_wrapper}
                      >
                      <Text
                        style={[
                          styles.batsman_name,
                          player.onStrike &&
                          styles.on_strike,
                          player.isOut &&
                          styles.out_player
                        ]}
                        >
                        {ellipsize(player.name, 17)}
                      </Text>
                      {player.onStrike && (
                        <Icon
                          name="sports-cricket"
                          size={20}
                          color="#f6d67c"
                          />
                      )}
                    </View>
                  </Pressable>
                )
              )}
            </View>

            <View style={styles.bowling_team_name_wrapper}>
              <Text style={styles.vs_text}>Vs</Text>
              <Text style={styles.bowling_team_name}>
                {ellipsize(
                  currentInningDetails?.bowlingTeam.name,
                  26
                )}
              </Text>
            </View>

            <View style={styles.current_bowler_wrapper}>
              <Pressable
                style={styles.current_bowler}
                onPress={() =>
                dispatch(
                  setReplaceBowlerModal({ isShow: true })
                )
                }
                >
                <Icon
                  name="sports-baseball"
                  size={normalize(26)}
                  color="#474646"
                  />
                <Text style={styles.bowler_name}>
                  {ellipsize(
                    currentInningDetails?.currentBowler
                    ?.name,
                    20
                  )}
                </Text>
              </Pressable>
              <View style={styles.bowler_stats_wrapper}>
                <Text style={styles.bowler_stats}>
                  {
                  currentInningDetails?.currentBowler
                  ?.wickets
                  }
                  -
                  {
                  currentInningDetails?.currentBowler
                  ?.runsConceded
                  }{" "}
                  (
                  {formatOver(
                    currentInningDetails?.currentBowler
                    ?.ballsBowled
                  )}
                  )
                </Text>
              </View>
            </View>
          </View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            ref={overTimeLineScrollRef}
            >
            <View style={styles.over_timeline_wrapper}>
              {currentInningDetails?.currentOverTimeline.map(
                timeLine => (
                  <View
                    style={styles.over_timeline}
                    key={timeLine._id}
                    >
                    <Text
                      style={[
                        styles.timeline_text,
                        timeLine.isWicket &&
                        styles.out_text,
                        timeLine.isFour &&
                        styles.four_text,
                        timeLine.isSix &&
                        styles.six_text
                      ]}
                      >
                      {formatOverTimeline(timeLine)}
                    </Text>
                  </View>
                )
              )}
            </View>
          </ScrollView>
          <View style={styles.score_button_wrapper}>
            <View style={styles.main_score_button_wrapper}>
              <View
                style={styles.primary_main_score_button_wrapper}
                >
                {primaryScoreButtons.map(
                  (button, index, arr) => (
                    <TouchableOpacity
                      style={[
                        styles.primary_score_button,
                        index === 0 && {
                          borderLeftWidth: 0
                        },
                        index === 3 && {
                          borderLeftWidth: 0
                        }]}
                      onPress={() =>
                      handleUpdateScore(
                        button.label,
                        button.payload
                      )
                      }
                      key={index}
                      >
                      <Text
                        style={styles.score_button_text}
                        >
                        {button.label}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              <View
                style={
                styles.secondary_main_score_button_wrapper
                }
                >
                {secondaryScoreButtons.map(
                  (button, index, arr) => (
                    <TouchableOpacity
                      style={styles.secondary_score_button}
                      onPress={() =>
                      handleOpenModal(
                        button.label,
                        button.payload
                      )
                      }
                      key={index}
                      >
                      <Text
                        style={[
                          styles.score_button_text,
                          button.label === "OUT" &&
                          styles.out_text
                        ]}
                        >
                        {button.label}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
            <View style={styles.extras_score_button_wrapper}>
              {extrasScoreButtons.map((button, index, arr) => (
                <TouchableOpacity
                  style={[
                    styles.extra_score_button,
                    index === 0 && { borderLeftWidth: 0 },
                    index === arr.length - 1 && {
                      borderRightWidth: 0
                    }]}
                  onPress={() =>
                  handleOpenModal(
                    button.label,
                    button.payload
                  )
                  }
                  key={index}
                  >
                  <Text style={styles.score_button_text}>
                    {button.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/*Sidebar */}
          <Sidebar
            matchDetails={matchDetails}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            />
          {/* Modal */}
          <ExtraRunsModal
            showSpinner={showSpinner}
            handleUpdateScore={handleUpdateScore}
            />
          <CustomRunsModal
            handleUpdateScore={handleUpdateScore}
            showSpinner={showSpinner}
            />
          <OverCompletionModal
            currentInningDetails={currentInningDetails}
            matchId={matchDetails?._id}
            handleUndoScore={handleUndoScore}
            />
          <InningCompletionModal
            matchDetails={matchDetails}
            handleUndoScore={handleUndoScore}
            />
          <MatchCompletionModal
            matchDetails={matchDetails}
            handleUndoScore={handleUndoScore}
            />
          <OutMethodModal
            matchDetails={matchDetails}
            handleUpdateScore={handleUpdateScore}
            />
          <ReplaceBowlerModal matchId={matchDetails?._id} />
          <ReplaceBatsmanModal
            matchId={matchDetails?._id}
            currentInningDetails={currentInningDetails}
            />
          <ChangeSquadModal
            matchId={matchDetails?._id}
            matchDetails={matchDetails}
            />

          <EndInningModal
            matchId={matchDetails?._id}
            showSpinner={showSpinner}
            setShowSpinner={setShowSpinner}
            />
          <EndMatchModal
            matchId={matchDetails?._id}
            matchDetails={matchDetails}
            showSpinner={showSpinner}
            setShowSpinner={setShowSpinner}
            />
          <SuperOverModal
            matchId={matchDetails?._id}
            showSpinner={showSpinner}
            setShowSpinner={setShowSpinner}
            />

          <UndoModal handleUndoScore={handleUndoScore} />
          <ChangeStrikerModal
            showSpinner={showSpinner}
            matchDetails={matchDetails}
            handleChangeStrike={handleChangeStrike}
            />
        </View>
      ): (
        <View style={styles.loading_spinner_wrapper}>
          <LoadingSpinner />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  header: {
    paddingTop: normalizeVertical(38),
    paddingBottom: normalizeVertical(20),
    backgroundColor: "#E21F26",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: normalize(20),
    position: "relative"
  },
  back_btn: {
    position: "absolute",
    left: normalize(20),
    top: normalizeVertical(40)
  },
  settings_btn: {
    position: "absolute",
    right: normalize(20),
    top: normalizeVertical(40)
  },
  label: {
    fontSize: normalize(20),
    color: "white",
    paddingHorizontal: normalize(13),
    textTransform: "capitalize",
    textAlign: "center",
    fontFamily: "robotoMedium"
  },
  scores_and_match_status_wrapper: {
    width: "100%",
    height: normalizeVertical(135),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E73336",
    gap: normalizeVertical(5)
  },
  score_and_over_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8)
  },
  team_score_text: {
    fontSize: normalize(32),
    color: "white",
    fontFamily: "robotoBold"
  },
  overs_text: {
    fontSize: normalize(20),
    color: "white",
    fontFamily: "robotoBold"
  },
  match_status_wrapper: {
    width: "90%"
  },
  match_status: {
    fontSize: normalize(18),
    color: "white",
    fontFamily: "robotoMedium",
    textAlign: "center"
  },
  current_batsman_wrapper: {
    backgroundColor: "#EE5860",
    paddingVertical: normalizeVertical(14),
    paddingHorizontal: normalize(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  current_batsman: {
    gap: normalizeVertical(5)
  },
  batsman_name_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(2)
  },
  batsman_name: {
    fontSize: normalize(18),
    color: "white",
    textTransform: "capitalize",
    fontFamily: "latoBold"
  },
  batsman_score: {
    fontSize: normalize(17),
    color: "white",
    fontFamily: "latoBold"
  },
  bowling_team_name_wrapper: {
    backgroundColor: "#E21F26",
    paddingVertical: normalizeVertical(5),
    paddingHorizontal: normalize(20),
    gap: normalizeVertical(5),
    alignItems: "center",
    justifyContent: "center"
  },
  vs_text: {
    fontSize: normalize(17),
    color: "white",
    textTransform: "capitalize",
    fontFamily: "latoBold"
  },
  bowling_team_name: {
    fontSize: normalize(18),
    color: "white",
    textTransform: "capitalize",
    fontFamily: "latoBold"
  },
  current_bowler_wrapper: {
    paddingVertical: normalizeVertical(10),
    paddingHorizontal: normalize(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  current_bowler: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalizeVertical(7)
  },
  bowler_name: {
    fontSize: normalize(18),
    color: "#474646",
    textTransform: "capitalize",
    fontFamily: "latoBold"
  },
  bowler_stats: {
    fontSize: normalize(18),
    color: "#474646",
    fontFamily: "latoBold"
  },
  on_strike: {
    color: "#f6d67c"
  },
  over_timeline_wrapper: {
    minHeight: normalizeVertical(70),
    paddingHorizontal: normalize(20),
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(17)
  },
  over_timeline: {
    height: normalize(40),
    width: normalize(40),
    borderRadius: normalize(50),
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1
  },
  timeline_text: {
    fontSize: normalize(17),
    color: "#2c3e50",
    fontFamily: "robotoMedium"
  },
  score_button_wrapper: {
    marginTop: normalizeVertical(15),
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  main_score_button_wrapper: {
    flexDirection: "row"
  },
  extras_score_button_wrapper: {
    flexDirection: "row"
  },
  primary_main_score_button_wrapper: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap"
  },
  secondary_main_score_button_wrapper: {
    width: "20%"
  },
  primary_score_button: {
    justifyContent: "center",
    alignItems: "center",
    width: "33.333%",
    height: normalizeVertical(120),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#b7b6b6"
  },
  secondary_score_button: {
    height: normalizeVertical(80),
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#EEEEEE",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#b7b6b6"
  },
  extra_score_button: {
    justifyContent: "center",
    alignItems: "center",
    height: normalizeVertical(80),
    flex: 1,
    backgroundColor: "#EEEEEE",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#b7b6b6"
  },
  score_button_text: {
    fontSize: normalize(18),
    color: "#474646",
    textAlign: "center",
    fontFamily: "robotoMedium"
  },
  out_player: {
    color: "rgba(198,198,198,0.4)"
  },
  out_text: {
    color: "#E21F26"
  },
  four_text: {
    color: "#f39c12"
  },
  six_text: {
    color: "#27ae60"
  },
  loading_spinner_wrapper: {
    flex: 1,
    paddingTop: StatusBar.currentHeight
  }
});

export default ManageScoreBoardScreen;