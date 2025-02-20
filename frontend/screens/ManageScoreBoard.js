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
import { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
    setExtraRunsModal,
    setOverCompleteModal,
    setInningCompleteModal,
    setMatchCompleteModal,
    setUndoModal,
    setChangeStrikeModal,
    setReplaceBowlerModal,
    setOutMethodModal,
    setCustomRunsModal
} from "../redux/modalSlice.js";
import { setFielder, setUndoStack, popUndoStack } from "../redux/matchSlice.js";

import { showToast } from "../redux/toastSlice.js";
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
import { io } from "socket.io-client";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ManageScoreBoardScreen = ({ navigation, route }) => {
    const [matchDetails, setMatchDetails] = useState(null);
    const [currentInningDetails, setCurrentInningDetails] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [isWicketFallen, setIsWicketFallen] = useState(false);
    const overTimeLineScrollRef = useRef(null);
    const dispatch = useDispatch();

    const { extraRunsModal, customRunsModal } = useSelector(
        state => state.modal
    );
    const { undoStack } = useSelector(state => state.match);

    const { accessToken } = useSelector(state => state.auth);

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
                if (
                    data.data.currentInning === 2 &&
                    !data.data.isSecondInningStarted
                ) {
                    setCurrentInningDetails(data.data.inning1);
                } else {
                    setCurrentInningDetails(
                        data.data.currentInning === 1
                            ? data.data.inning1
                            : data.data.inning2
                    );
                }
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
            matchDetails?.matchStatus === "in progress" &&
            !matchDetails?.isOverChangePending
        ) {
            navigation.navigate("home-screen");
        }
        return true;
    }, [navigation, matchDetails]);

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
        socket.on("scoreUpdated", ({ match }) => {
            setMatchDetails(match);
            if (match.currentInning === 2 && !match.isSecondInningStarted) {
                setCurrentInningDetails(match.inning1);
            } else {
                setCurrentInningDetails(
                    match.currentInning === 1 ? match.inning1 : match.inning2
                );
            }
        });

        socket.on("wicketFallen", () => {
            setIsWicketFallen(true);
        });

        socket.on("overCompleted", () => {
            dispatch(setOverCompleteModal({ isShow: true }));
        });

        socket.on("inningCompleted", () => {
            dispatch(setInningCompleteModal({ isShow: true }));
        });

        socket.on("matchCompleted", () => {
            dispatch(setMatchCompleteModal({ isShow: true }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (currentInningDetails?.currentOverTimeline.length > 0) {
            overTimeLineScrollRef.current?.scrollToEnd({ animated: true });

            dispatch(setUndoStack(currentInningDetails?.currentOverTimeline));
        }
    }, [currentInningDetails?.currentOverTimeline]);

    useFocusEffect(
        useCallback(() => {
            if (isWicketFallen) {
                navigation.navigate("select-new-batsman", {
                    matchId: route.params?.matchId
                });
                setIsWicketFallen(false);
            }
        }, [isWicketFallen])
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            dispatch(setFielder({ _id: null, name: null }));
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
        }, [isScreenFocused, isLoading])
    );

    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: "none" }
            });

            return () => {
                navigation.getParent()?.setOptions({
                    tabBarStyle: { display: "flex" }
                });
            };
        }, [isScreenFocused])
    );

    function formatOver(ballsBowled) {
        const overs = Math.floor(ballsBowled / 6);
        const remainingBalls = ballsBowled % 6;
        return `${overs}.${remainingBalls}`;
    }

    const formatOverTimeline = timeLine => {
        if (timeLine.isWicket) {
            if (timeLine.outMethod === "retired hurt") {
                return "REH";
            }
            return "W";
        } else if (timeLine.isFour) {
            return "4";
        } else if (timeLine.isSix) {
            return "6";
        } else if (timeLine.isWide) {
            return "WD" + (timeLine.runs > 0 ? timeLine.runs : "");
        } else if (timeLine.isNoball) {
            return "NB" + (timeLine.runs > 0 ? timeLine.runs : "");
        } else if (timeLine.isLegBye) {
            return "LB" + (timeLine.runs > 0 ? timeLine.runs : "");
        } else if (timeLine.isBye) {
            return "BY" + (timeLine.runs > 0 ? timeLine.runs : "");
        } else {
            return timeLine.runs;
        }
    };

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
                dispatch(showToast("no more undo operation"));
                return;
            }

            dispatch(setUndoModal({ isShow: true }));
        } else if (modalType === "OUT") {
            dispatch(setOutMethodModal({ isShow: true }));
        }
    };

    const primaryScoreButtons = [
        {
            label: "0",
            payload: {
                runs: 0,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "1",
            payload: {
                runs: 1,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "2",
            payload: {
                runs: 2,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "3",
            payload: {
                runs: 3,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "4\nfour",
            payload: {
                runs: 4,
                isFour: true,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "6\nsix",
            payload: {
                runs: 6,
                isSix: true,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        }
    ];

    const secondryScoreButtons = [
        {
            label: "UNDO",
            payload: {
                runs: 0,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "5,7",
            payload: {
                runs: 0,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "OUT",
            payload: {
                runs: 0,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: true,
                isDeadBall: false
            }
        }
    ];

    const extrasScoreButtons = [
        {
            label: "WD",
            payload: {
                runs: 0,
                isWide: true,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "NB",
            payload: {
                runs: 0,
                isWide: false,
                isNoball: true,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "BY",
            payload: {
                runs: 0,
                isWide: false,
                isNoball: false,
                isBye: true,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "LB",
            payload: {
                runs: 0,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: true,
                isWicket: false,
                isDeadBall: false
            }
        },
        {
            label: "OTHER",
            payload: {
                runs: 0,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false,
                isDeadBall: false
            }
        }
    ];

    const handleUpdateScore = async (typeOfBall, payloadData) => {
        try {
            setShowSpinner(true);
            let payload = payloadData;

            if (
                typeOfBall === "WD" ||
                typeOfBall === "NB" ||
                typeOfBall === "BY" ||
                typeOfBall === "LB"
            ) {
                payload = { ...payload, runs: extraRunsModal.runsInput?.value };
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
                throw new Error("plz provide all the required field");
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
                throw new Error(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setShowSpinner(false);
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
                throw new Error(data.message);
            } else {
                dispatch(setChangeStrikeModal({ isShow: false }));
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
                    body: JSON.stringify({ lastAction, previousOverTimeline })
                }
            );

            const data = await response.json();
            if (response.status !== 200) {
                throw new Error(data.message);
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
                            {currentInningDetails &&
                                currentInningDetails.battingTeam.name}
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

                    <View style={styles.batting_team_score_wrapper}>
                        <View style={styles.score_and_overs_wrapper}>
                            <View style={styles.score_wrapper}>
                                <Text style={styles.team_score_text}>
                                    {currentInningDetails?.totalScore}/
                                    {currentInningDetails?.wicketsFallen}
                                </Text>
                            </View>
                            <View style={styles.overs_wrapper}>
                                <Text style={styles.overs_text}>
                                    ({currentInningDetails?.currentOvers}.
                                    {currentInningDetails?.currentOverBalls}/
                                    {currentInningDetails?.totalOvers})
                                </Text>
                            </View>
                        </View>

                        {!matchDetails?.isSecondInningStarted && (
                            <View style={styles.toss_details_wrapper}>
                                <Text style={styles.toss_details}>
                                    {matchDetails?.toss.tossWinner} won the toss
                                    and elected to{" "}
                                    {matchDetails?.toss.tossDecision}
                                </Text>
                            </View>
                        )}

                        {matchDetails?.matchStatus !== "completed" &&
                            matchDetails?.currentInning === 2 &&
                            matchDetails?.isSecondInningStarted && (
                                <View style={styles.toss_details_wrapper}>
                                    <Text style={styles.toss_details}>
                                        {currentInningDetails?.battingTeam.name}{" "}
                                        needs{" "}
                                        {matchDetails?.targetScore -
                                            matchDetails?.inning2
                                                .totalScore}{" "}
                                        runs in{" "}
                                        {matchDetails?.inning2.totalOvers * 6 -
                                            matchDetails.inning2.currentOvers *
                                                6 -
                                            matchDetails.inning2
                                                .currentOverBalls}{" "}
                                        balls
                                    </Text>
                                </View>
                            )}
                        {matchDetails?.matchStatus === "completed" &&
                            matchDetails?.currentInning === 2 && (
                                <View style={styles.toss_details_wrapper}>
                                    <Text style={styles.toss_details}>
                                        {matchDetails?.matchWinner?.teamName}{" "}
                                        won by{" "}
                                        {matchDetails?.matchWinner?.wonBy}
                                    </Text>
                                </View>
                            )}
                        <View style={styles.current_batsman_wrapper}>
                            {currentInningDetails?.currentBatsmen.map(
                                player => (
                                    <Pressable
                                        style={styles.current_batsman}
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
                                                {player.name}
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
                    </View>
                    <View style={styles.bowling_team_name_wrapper}>
                        <Text style={styles.vs_text}>Vs</Text>
                        <Text style={styles.bowling_team_name}>
                            {matchDetails?.currentInning === 1
                                ? matchDetails?.inning1.bowlingTeam.name
                                : matchDetails?.inning2.bowlingTeam.name}
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
                                {currentInningDetails?.currentBowler?.name}
                            </Text>
                        </Pressable>
                        <View style={styles.bowler_stats_wrapper}>
                            <Text style={styles.bowler_stats}>
                                {currentInningDetails?.currentBowler?.wickets}-
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
                                                }
                                            ]}
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
                                    styles.secondry_main_score_button_wrapper
                                }
                            >
                                {secondryScoreButtons.map(
                                    (button, index, arr) => (
                                        <TouchableOpacity
                                            style={styles.secondry_score_button}
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
                                        }
                                    ]}
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
                        currentInning={matchDetails?.currentInning}
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

                    <UndoModal handleUndoScore={handleUndoScore} />
                    <ChangeStrikerModal
                        showSpinner={showSpinner}
                        matchDetails={matchDetails}
                        handleChangeStrike={handleChangeStrike}
                    />
                </View>
            ) : (
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
        paddingTop: normalizeVertical(40),
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
        top: normalizeVertical(42)
    },
    settings_btn: {
        position: "absolute",
        right: normalize(20),
        top: normalizeVertical(42)
    },
    label: {
        fontSize: normalize(20),
        color: "white",
        paddingHorizontal: normalize(13),
        textTransform: "capitalize",
        textAlign: "center",
        fontFamily: "robotoMedium"
    },

    batting_team_score_wrapper: {
        width: "100%",
        height: normalizeVertical(240),
        paddingTop: normalizeVertical(40),
        alignItems: "center",
        gap: normalizeVertical(5),
        backgroundColor: "#E73336",
        position: "relative"
    },
    score_and_overs_wrapper: {
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

    toss_details: {
        fontSize: normalize(18),
        color: "white",
        fontFamily: "robotoMedium"
    },
    current_batsman_wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#EE5860",
        paddingVertical: normalizeVertical(20),
        paddingHorizontal: normalize(20),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    current_batsman: {
        alignItems: "center",
        gap: normalizeVertical(5)
    },
    batsman_name_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(4)
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
        paddingVertical: normalizeVertical(10),
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
        minHeight: normalizeVertical(60),
        paddingHorizontal: normalize(20),
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(17)
    },
    over_timeline: {
        height: normalize(45),
        width: normalize(45),
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
    secondry_main_score_button_wrapper: {
        width: "20%"
    },
    primary_score_button: {
        justifyContent: "center",
        alignItems: "center",
        width: normalize(101),

        height: normalizeVertical(126),
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: "#b7b6b6"
    },
    secondry_score_button: {
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

        height: normalizeVertical(85),
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
