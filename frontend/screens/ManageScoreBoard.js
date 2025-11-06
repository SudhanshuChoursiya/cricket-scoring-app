import { useState, useEffect, useCallback, useRef } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { openModal, closeModal } from "../redux/modalSlice.js";
import {
    setFielder,
    setUndoStack,
    popUndoStack,
    clearUndoStack
} from "../redux/matchSlice.js";
import { showToast } from "../redux/toastSlice.js";
import { useFocusEffect } from "@react-navigation/native";
import { io } from "socket.io-client";
import socket from "../services/socket.js";
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
    getCurrentInning,
    checkAndNavigateToPendingAction
} from "../utils/matchUtils.js";
import {
    ellipsize,
    formatOver,
    formatOverTimelineText,
    getOverTimelineExtrasLabel
} from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useHideTabBar } from "../utils/useHideTabBar.js";
import {
    useGetMatchDetailsQuery,
    useUpdateScoreMutation,
    useUndoScoreMutation,
    useChangeStrikeMutation
} from "../services/matchApi.js";
import {
    primaryScoreButtons,
    secondaryScoreButtons,
    extrasScoreButtons
} from "../constants/scoreButtons";

const ManageScoreBoardScreen = ({ navigation, route }) => {
    const [matchDetails, setMatchDetails] = useState(null);
    const [currentInningDetails, setCurrentInningDetails] = useState(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [isWicketFallen, setIsWicketFallen] = useState(false);
    const { activeModal, payload: modalPayload } = useSelector(
        state => state.modal
    );

    const { undoStack } = useSelector(state => state.match);

    const { accessToken } = useSelector(state => state.auth);

    const dispatch = useDispatch();
    const overTimeLineScrollRef = useRef(null);
    useHideTabBar(navigation, isScreenFocused);

    const { data, isLoading } = useGetMatchDetailsQuery(route.params?.matchId);

    const [updateScore, { isLoading: isUpdatingScore }] =
        useUpdateScoreMutation();

    const [undoScore, { isLoading: isUndoingScore }] = useUndoScoreMutation();

    const [changeStrike, { isLoading: isStrikeChanging }] =
        useChangeStrikeMutation();

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    useEffect(() => {
        if (data?.data) {
            setMatchDetails(data.data);
            const {
                isSuperOver,
                isSecondInningStarted,
                currentInning,
                inning1,
                superOver
            } = data.data;

            let currentInningDetails;
            if (!isSuperOver) {
                // Normal match
                currentInningDetails =
                    !isSecondInningStarted && currentInning === 2
                        ? inning1
                        : getCurrentInning(data.data);
            } else {
                // Super over
                currentInningDetails =
                    !isSecondInningStarted && superOver.currentInning === 2
                        ? superOver.inning1
                        : getCurrentInning(data.data);
            }

            setCurrentInningDetails(currentInningDetails);
        }
    }, [data, dispatch]);

    const handleBackPress = useCallback(() => {
        const protectedModals = new Set([
            "overCompletion",
            "inningCompletion",
            "matchCompletion"
        ]);

        if (activeModal && protectedModals.has(activeModal)) {
            return true;
        }

        if (activeModal) {
            dispatch(closeModal());
            return true;
        }

        navigation.goBack();
        return true;
    }, [activeModal, dispatch, navigation]);

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
        if (!matchDetails?._id) return;

        if (!socket.connected) socket.connect();

        // --- Join Room ---
        const joinRoom = () => {
            socket.emit("joinMatch", matchDetails._id);
        };

        // --- Score Update Handler ---
        const handleScoreUpdated = ({ match }) => {
            setMatchDetails(match);

            const {
                isSuperOver,
                isSecondInningStarted,
                currentInning,
                inning1,
                superOver
            } = match;

            let currentInningDetails;
            if (!isSuperOver) {
                // Normal match
                currentInningDetails =
                    !isSecondInningStarted && currentInning === 2
                        ? inning1
                        : getCurrentInning(match);
            } else {
                // Super over
                currentInningDetails =
                    !isSecondInningStarted && superOver.currentInning === 2
                        ? superOver.inning1
                        : getCurrentInning(match);
            }

            setCurrentInningDetails(currentInningDetails);
        };

        // --- Modal Events ---
        const handleWicketFallen = () => {
            setIsWicketFallen(true);
        };
        const handleOverCompleted = () =>
            dispatch(
                openModal({
                    type: "overCompletion"
                })
            );

        const handleInningCompleted = () =>
            dispatch(
                openModal({
                    type: "inningCompletion"
                })
            );

        const handleMatchTied = () =>
            dispatch(
                openModal({
                    type: "superOver"
                })
            );

        const handleSuperOverTied = () =>
            dispatch(
                openModal({
                    type: "superOver"
                })
            );

        const handleMatchCompleted = () =>
            dispatch(
                openModal({
                    type: "matchCompletion"
                })
            );

        // --- Register Listeners ---
        socket.on("connect", joinRoom);
        socket.on("reconnect", joinRoom);
        socket.on("scoreUpdated", handleScoreUpdated);
        socket.on("wicketFallen", handleWicketFallen);
        socket.on("overCompleted", handleOverCompleted);
        socket.on("inningCompleted", handleInningCompleted);
        socket.on("matchTied", handleMatchTied);
        socket.on("superOverTied", handleSuperOverTied);
        socket.on("matchCompleted", handleMatchCompleted);

        // --- Cleanup ---
        return () => {
            if (matchDetails?._id) {
                socket.emit("leaveMatch", matchDetails._id);
            }

            socket.off("connect", joinRoom);
            socket.off("reconnect", joinRoom);
            socket.off("scoreUpdated", handleScoreUpdated);
            socket.off("wicketFallen", handleWicketFallen);
            socket.off("overCompleted", handleOverCompleted);
            socket.off("inningCompleted", handleInningCompleted);
            socket.off("matchTied", handleMatchTied);
            socket.off("superOverTied", handleSuperOverTied);
            socket.off("matchCompleted", handleMatchCompleted);

            socket.disconnect();
        };
    }, [matchDetails?._id, dispatch]);

    useEffect(() => {
        if (matchDetails?._id) {
            dispatch(clearUndoStack());
        }
    }, [matchDetails?._id]);

    useEffect(() => {
        if (currentInningDetails?.currentOverTimeline.length > 0) {
            overTimeLineScrollRef.current?.scrollToEnd({
                animated: true
            });

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
            dispatch(
                setFielder({
                    _id: null,
                    name: null
                })
            );
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

    const handleOpenModal = (modalType, payload = {}) => {
        try {
            if (
                checkAndNavigateToPendingAction(
                    matchDetails,
                    navigation,
                    route.params?.matchId
                )
            ) {
                return;
            }

            if (modalType === "UNDO") {
                if (undoStack.length === 0) {
                    dispatch(
                        showToast({
                            type: "error",
                            message: "No more undo operation"
                        })
                    );
                    return;
                }
                dispatch(openModal({ type: "undo", payload }));
                return;
            }

            // All other modals
            switch (modalType) {
                case "WD":
                    dispatch(
                        openModal({
                            type: "extraRuns",
                            payload: {
                                title: "Wide Ball",
                                runsInput: {
                                    isShow: true,
                                    label: "WD",
                                    value: 0
                                },
                                ...payload
                            }
                        })
                    );
                    break;

                case "NB":
                    dispatch(
                        openModal({
                            type: "extraRuns",
                            payload: {
                                title: "No Ball",
                                runsInput: {
                                    isShow: true,

                                    label: "NB",
                                    value: 0
                                },
                                ...payload
                            }
                        })
                    );
                    break;

                case "BY":
                    dispatch(
                        openModal({
                            type: "extraRuns",
                            payload: {
                                title: "Bye",
                                runsInput: {
                                    isShow: false,

                                    label: "BY",
                                    value: 0
                                },
                                ...payload
                            }
                        })
                    );
                    break;

                case "LB":
                    dispatch(
                        openModal({
                            type: "extraRuns",
                            payload: {
                                title: "Leg Bye",
                                runsInput: {
                                    isShow: false,

                                    label: "LB",
                                    value: 0
                                },
                                ...payload
                            }
                        })
                    );
                    break;

                case "5,7":
                    dispatch(
                        openModal({
                            type: "customRuns",
                            payload: {
                                title: "Runs Scored by running",
                                runsInput: {
                                    isShow: true,

                                    label: "5,7",
                                    value: 0
                                },
                                ...payload
                            }
                        })
                    );
                    break;

                case "OUT":
                    dispatch(openModal({ type: "outMethod", payload }));
                    break;

                case "CHANGE_STRIKER":
                    dispatch(openModal({ type: "changeStriker", payload }));
                    break;

                case "REPLACE_BOWLER":
                    dispatch(openModal({ type: "replaceBowler", payload }));
                    break;

                default:
                    console.warn("Unknown modal type:", modalType);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdateScore = async (typeOfBall, payloadData) => {
        try {
            if (
                checkAndNavigateToPendingAction(
                    matchDetails,
                    navigation,
                    route.params?.matchId
                )
            ) {
                return;
            }

            let payload = payloadData;
            if (
                typeOfBall === "WD" ||
                typeOfBall === "NB" ||
                typeOfBall === "BY" ||
                typeOfBall === "LB"
            ) {
                payload = {
                    ...payload,
                    runs: modalPayload.runsInput?.value
                };
            }

            if (typeOfBall === "5,7") {
                payload = {
                    ...payload,
                    runs: modalPayload.runsInput?.value
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
                    showToast({
                        type: "error",
                        message: "please provide all required field"
                    })
                );
                return;
            }

            const data = await updateScore({
                matchId: route.params?.matchId,
                payload
            }).unwrap();
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message: error?.data?.message || "Failed to update score"
                })
            );
        }
    };

    const handleUndoScore = async () => {
        try {
            let previousOverTimeline;
            const lastAction = undoStack[undoStack.length - 1];
            if (currentInningDetails?.currentOverBalls === 0) {
                const lastOverNumber = lastAction?.overNumber;
                // get all balls from that over
                previousOverTimeline = undoStack.filter(
                    b => b.overNumber === lastOverNumber
                );
            }

            dispatch(popUndoStack());

            const response = await undoScore({
                matchId: route.params?.matchId,
                lastAction,
                previousOverTimeline
            }).unwrap();
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message:
                        error?.data?.message ||
                        "Something went wrong while undoing score"
                })
            );
        }
    };

    const handleChangeStrike = async () => {
        try {
            if (
                checkAndNavigateToPendingAction(
                    matchDetails,
                    navigation,
                    route.params?.matchId
                )
            ) {
                return;
            }

            const response = await changeStrike(route.params?.matchId).unwrap();

            dispatch(closeModal());
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message:
                        error?.data?.message ||
                        "Something went wrong while changing strike"
                })
            );
        }
    };

    return (
        <>
            {!isLoading && matchDetails && currentInningDetails ? (
                <View style={styles.wrapper}>
                    <View style={styles.scoreboard_wrapper}>
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
                                    24
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
                                                matchDetails?.toss?.tossWinner,
                                                24
                                            )}{" "}
                                            won the toss and elected to{" "}
                                            {matchDetails?.toss?.tossDecision}
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
                                                24
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

                                                24
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
                                                      24
                                                  )} won by ${
                                                      matchDetails.matchResult
                                                          .winningMargin
                                                  }`
                                                : matchDetails.matchResult
                                                      .status === "Tie"
                                                ? "Match Tied"
                                                : matchDetails.matchResult
                                                      .status === "Super Over"
                                                ? `${ellipsize(
                                                      matchDetails.matchResult
                                                          .winningTeam,

                                                      24
                                                  )} won the super over`
                                                : matchDetails.matchResult
                                                      .status ===
                                                  "Super Over Tie"
                                                ? "Super Over Tied"
                                                : ""}
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
                                                        ? "flex-start"
                                                        : "flex-end"
                                            }
                                        ]}
                                        key={player._id}
                                        onPress={() =>
                                            handleOpenModal("CHANGE_STRIKER")
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

                                    24
                                )}
                            </Text>
                        </View>

                        <View style={styles.current_bowler_wrapper}>
                            <Pressable
                                style={styles.current_bowler}
                                onPress={() =>
                                    handleOpenModal("REPLACE_BOWLER")
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

                        <View style={styles.over_timeline_wrapper}>
                            <ScrollView
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                ref={overTimeLineScrollRef}
                            >
                                <View
                                    style={styles.over_timeline_inner_wrapper}
                                >
                                    {currentInningDetails?.currentOverTimeline.map(
                                        timeLine => (
                                            <View
                                                style={styles.over_timeline}
                                                key={timeLine._id}
                                            >
                                                <View style={styles.timeline}>
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
                                                        {formatOverTimelineText(
                                                            timeLine
                                                        )}
                                                    </Text>
                                                </View>
                                                <Text
                                                    style={
                                                        styles.timeLine_extras_label
                                                    }
                                                >
                                                    {getOverTimelineExtrasLabel(
                                                        timeLine
                                                    )}
                                                </Text>
                                            </View>
                                        )
                                    )}
                                </View>
                            </ScrollView>
                        </View>

                        <View style={styles.score_button_wrapper}>
                            <View style={styles.main_score_button_wrapper}>
                                {/* Primary Score Buttons */}
                                <View
                                    style={
                                        styles.primary_main_score_button_wrapper
                                    }
                                >
                                    {primaryScoreButtons.map(
                                        (button, index) => (
                                            <Pressable
                                                key={index}
                                                onPress={() =>
                                                    handleUpdateScore(
                                                        button.label,
                                                        button.payload
                                                    )
                                                }
                                                android_ripple={{
                                                    color: "rgba(0,0,0,0.08)",
                                                    radius: 150,
                                                    borderless: false
                                                }}
                                                style={({ pressed }) => [
                                                    styles.primary_score_button,
                                                    index === 0 && {
                                                        borderLeftWidth: 0
                                                    },
                                                    index === 3 && {
                                                        borderLeftWidth: 0
                                                    },
                                                    pressed && { opacity: 0.5 }
                                                ]}
                                                disabled={
                                                    activeModal !== null ||
                                                    isUpdatingScore ||
                                                    isUndoingScore ||
                                                    isStrikeChanging
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.score_button_text
                                                    }
                                                >
                                                    {button.label}
                                                </Text>
                                            </Pressable>
                                        )
                                    )}
                                </View>

                                {/* Secondary Score Buttons */}
                                <View
                                    style={
                                        styles.secondary_main_score_button_wrapper
                                    }
                                >
                                    {secondaryScoreButtons.map(
                                        (button, index) => (
                                            <Pressable
                                                key={index}
                                                onPress={() =>
                                                    handleOpenModal(
                                                        button.label,
                                                        button.payload
                                                    )
                                                }
                                                android_ripple={{
                                                    color: "rgba(0,0,0,0.08)",
                                                    radius: 150,
                                                    borderless: false
                                                }}
                                                style={({ pressed }) => [
                                                    styles.secondary_score_button,
                                                    pressed && {
                                                        backgroundColor:
                                                            "#EDEDED",
                                                        opacity: 0.5
                                                    }
                                                ]}
                                                disabled={
                                                    activeModal !== null ||
                                                    isUpdatingScore ||
                                                    isUndoingScore ||
                                                    isStrikeChanging
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.score_button_text,
                                                        button.label ===
                                                            "OUT" &&
                                                            styles.out_text
                                                    ]}
                                                >
                                                    {button.label}
                                                </Text>
                                            </Pressable>
                                        )
                                    )}
                                </View>
                            </View>

                            {/* Extras Score Buttons */}
                            <View style={styles.extras_score_button_wrapper}>
                                {extrasScoreButtons.map(
                                    (button, index, arr) => (
                                        <Pressable
                                            key={index}
                                            onPress={() =>
                                                handleOpenModal(
                                                    button.label,
                                                    button.payload
                                                )
                                            }
                                            android_ripple={{
                                                color: "rgba(0,0,0,0.08)",
                                                radius: 150,
                                                borderless: false
                                            }}
                                            style={({ pressed }) => [
                                                styles.extra_score_button,
                                                index === 0 && {
                                                    borderLeftWidth: 0
                                                },
                                                index === arr.length - 1 && {
                                                    borderRightWidth: 0
                                                },
                                                pressed && {
                                                    backgroundColor: "#EDEDED",
                                                    opacity: 0.5
                                                }
                                            ]}
                                            disabled={
                                                activeModal !== null ||
                                                isUpdatingScore ||
                                                isUndoingScore ||
                                                isStrikeChanging
                                            }
                                        >
                                            <Text
                                                style={styles.score_button_text}
                                            >
                                                {button.label}
                                            </Text>
                                        </Pressable>
                                    )
                                )}
                            </View>
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
        height: normalizeVertical(75),
        paddingTop: normalizeVertical(25),
        backgroundColor: "#E21F",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: normalize(20)
    },
    label: {
        fontSize: normalize(20),
        color: "white",
        paddingHorizontal: normalize(13),
        textTransform: "capitalize",
        textAlign: "center",
        fontFamily: "robotoMedium"
    },
    scoreboard_wrapper: {
        flex: 1
    },
    scores_and_match_status_wrapper: {
        minHeight: normalizeVertical(192),
        width: "100%",
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
        height: normalizeVertical(60),
        backgroundColor: "#EE5860",
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
        height: normalizeVertical(55),
        backgroundColor: "#E21F",
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
        height: normalizeVertical(35),
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
        height: normalizeVertical(85)
    },
    over_timeline_inner_wrapper: {
        paddingHorizontal: normalize(20),
        flexDirection: "row",
        gap: normalize(15),
        alignItems: "center"
    },
    over_timeline: {
        gap: normalizeVertical(5),
        alignItems: "center"
    },
    timeline: {
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
    timeLine_extras_label: {
        fontSize: normalize(16),
        color: "#2c3e50",
        fontFamily: "robotoMedium"
    },
    score_button_wrapper: {
        flex: 1,
        justifyContent: "flex-end"
    },
    main_score_button_wrapper: {
        flexDirection: "row",
        height: "75%"
    },
    extras_score_button_wrapper: {
        flexDirection: "row",
        height: "25%"
    },
    primary_main_score_button_wrapper: {
        width: "75%",
        height: "100%",
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap"
    },
    secondary_main_score_button_wrapper: {
        width: "25%",
        height: "100%"
    },
    primary_score_button: {
        justifyContent: "center",
        alignItems: "center",
        width: "33.33%",
        height: "50%",
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: "#b7b6b6"
    },
    secondary_score_button: {
        height: "33.33%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EEEEEE",
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: "#b7b6b6"
    },
    extra_score_button: {
        justifyContent: "center",
        alignItems: "center",
        height: "33.33",
        width: "25%",
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
        color: "#E21F"
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
