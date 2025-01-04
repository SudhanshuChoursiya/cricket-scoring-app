import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    StatusBar
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
    setExtrasModal,
    setOverCompleteModal,
    setInningCompleteModal,
    setMatchCompleteModal,
    setUndoModal,
    setChangeStrikeModal,
    setReplaceBowlerModal,
    setOutMethodModal,
    setCustomRunsModal
} from "../redux/modalSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import ExtraRunsModal from "../components/ExtraRunsModal.js";
import CustomRunsModal from "../components/CustomRunsModal.js";
import OverCompletionModal from "../components/OverCompletionModal.js";
import InningCompletionModal from "../components/InningCompletionModal.js";
import MatchCompletionModal from "../components/MatchCompletionModal.js";
import ReplaceBowlerModal from "../components/ReplaceBowlerModal.js";
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
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [isWicketFallen, setIsWicketFallen] = useState(false);

    const dispatch = useDispatch();

    const { extrasModal, customRunsModal } = useSelector(state => state.modal);

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

    useEffect(() => {
        const socket = io(`${process.env.EXPO_PUBLIC_BASE_URL}`);
        socket.on("scoreUpdated", match => {
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
        const unsubscribe = navigation.addListener("focus", () => {
            if (isWicketFallen) {
                navigation.navigate("select-new-batsman", {
                    matchId: route.params?.matchId
                });
                setIsWicketFallen(false);
            }
        });
        return unsubscribe;
    }, [isWicketFallen, navigation]);

    useFocusEffect(
        useCallback(() => {
            StatusBar.setBarStyle("light-content");
            return () => {
                StatusBar.setBarStyle("default");
            };
        }, [isScreenFocused])
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

    const handleOpenModal = (modalType, payload) => {
        if (modalType === "WIDE") {
            dispatch(
                setExtrasModal({
                    title: "Wide Ball",
                    inputLabel: "WIDE",
                    inputValue: 0,
                    payload: payload,
                    isShow: true
                })
            );
        } else if (modalType === "NB") {
            dispatch(
                setExtrasModal({
                    title: "No Ball",
                    inputLabel: "NB",
                    inputValue: 0,
                    payload: payload,
                    isShow: true
                })
            );
        } else if (modalType === "BY") {
            dispatch(
                setExtrasModal({
                    title: "Bye",
                    inputLabel: "BY",
                    inputValue: 0,
                    payload: payload,
                    isShow: true
                })
            );
        } else if (modalType === "LB") {
            dispatch(
                setExtrasModal({
                    title: "Leg Bye",
                    inputLabel: "LB",
                    inputValue: 0,
                    payload: payload,
                    isShow: true
                })
            );
        } else if (modalType === "5,7") {
            dispatch(
                setCustomRunsModal({
                    inputLabel: "5,7",
                    inputValue: 0,
                    payload: payload,
                    isShow: true
                })
            );
        } else if (modalType === "UNDO") {
            dispatch(setUndoModal({ isShow: true }));
        } else if (modalType === "OUT") {
            dispatch(setOutMethodModal({ isShow: true }));
        }
    };

    const handleCloseModal = () => {
        dispatch(
            setExtrasModal({
                inputValue: 0,
                isShow: false
            })
        );
    };

    const handleConfirmModal = () => {
        handleUpdateScore(extrasModal.inputLabel, extrasModal.payload).then(
            () => handleCloseModal()
        );
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
                isWicket: false
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
                isWicket: false
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
                isWicket: false
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
                isWicket: false
            }
        },
        {
            label: "4\nfour",
            payload: {
                runs: 4,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false
            }
        },
        {
            label: "6\nsix",
            payload: {
                runs: 6,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false
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
                isWicket: false
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
                isWicket: false
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
                isWicket: true
            }
        }
    ];

    const extrasScoreButtons = [
        {
            label: "WIDE",
            payload: {
                runs: 0,
                isWide: true,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false
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
                isWicket: false
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
                isWicket: false
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
                isWicket: false
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
                isWicket: false
            }
        }
    ];

    const handleUpdateScore = async (typeOfBall, payloadData) => {
        try {
            setShowSpinner(true);
            let payload = payloadData;

            if (
                typeOfBall === "WIDE" ||
                typeOfBall === "NB" ||
                typeOfBall === "BY" ||
                typeOfBall === "LB"
            ) {
                payload = { ...payload, runs: extrasModal.inputValue };
            }

            if (typeOfBall === "5,7") {
                payload = { ...payload, runs: customRunsModal.inputValue };
            }

            if (
                payload.runs === undefined ||
                payload.isWide === undefined ||
                payload.isNoball === undefined ||
                payload.isBye === undefined ||
                payload.isLegBye === undefined ||
                payload.isWicket === undefined
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
            }
        } catch (error) {
            console.log(error);
        } finally {
            setShowChangeStrikerModal(false);
            setShowSpinner(false);
        }
    };

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
                <Text style={styles.label}>
                    {currentInningDetails &&
                        currentInningDetails.battingTeam.name}
                </Text>
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
                            {matchDetails?.toss.tossWinner} won the toss and
                            elected to {matchDetails?.toss.tossDecision}
                        </Text>
                    </View>
                )}

                {matchDetails?.matchStatus !== "completed" &&
                    matchDetails?.currentInning === 2 &&
                    matchDetails?.isSecondInningStarted && (
                        <View style={styles.toss_details_wrapper}>
                            <Text style={styles.toss_details}>
                                {currentInningDetails?.battingTeam.name} needs{" "}
                                {matchDetails?.targetScore -
                                    matchDetails?.inning2.totalScore}{" "}
                                runs in{" "}
                                {matchDetails?.inning2.totalOvers * 6 -
                                    matchDetails.inning2.currentOvers * 6 -
                                    matchDetails.inning2.currentOverBalls}{" "}
                                balls
                            </Text>
                        </View>
                    )}
                {matchDetails?.matchStatus === "completed" &&
                    matchDetails?.currentInning === 2 && (
                        <View style={styles.toss_details_wrapper}>
                            <Text style={styles.toss_details}>
                                {matchDetails?.matchWinner?.teamName} won by{" "}
                                {matchDetails?.matchWinner?.wonBy}
                            </Text>
                        </View>
                    )}
                <View style={styles.current_batsman_wrapper}>
                    {currentInningDetails?.currentBatsmen.map(player => (
                        <Pressable
                            style={styles.current_batsman}
                            key={player._id}
                            onPress={() =>
                                dispatch(setChangeStrikeModal({ isShow: true }))
                            }
                        >
                            <View style={styles.batsman_score_wrapper}>
                                <Text style={styles.batsman_score}>
                                    {player.runs} ({player.balls})
                                </Text>
                            </View>
                            <View style={styles.batsman_name_wrapper}>
                                <Text
                                    style={[
                                        styles.batsman_name,
                                        player.onStrike && styles.on_strike,
                                        player.isOut && styles.out_player
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
                    ))}
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
                        dispatch(setReplaceBowlerModal({ isShow: true }))
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
                        {currentInningDetails?.currentBowler?.runsConceded} (
                        {formatOver(
                            currentInningDetails?.currentBowler?.ballsBowled
                        )}
                        )
                    </Text>
                </View>
            </View>

            <View style={styles.over_timeline_wrapper}>
                {Array.from({ length: 6 }).map((timeline, index) => (
                    <View style={styles.over_timeline} key={index}>
                        <Text style={styles.timeline_text}>0</Text>
                    </View>
                ))}
            </View>

            <View style={styles.score_button_wrapper}>
                <View style={styles.main_score_button_wrapper}>
                    <View style={styles.primary_main_score_button_wrapper}>
                        {primaryScoreButtons.map((button, index, arr) => (
                            <TouchableOpacity
                                style={[
                                    styles.primary_score_button,
                                    index === 0 && { borderLeftWidth: 0 },
                                    index === 3 && { borderLeftWidth: 0 }
                                ]}
                                onPress={() =>
                                    handleUpdateScore(
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
                    <View style={styles.secondry_main_score_button_wrapper}>
                        {secondryScoreButtons.map((button, index, arr) => (
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
                        ))}
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
                                handleOpenModal(button.label, button.payload)
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
            {/* Modal */}
            <ExtraRunsModal
                handleCloseModal={handleCloseModal}
                showSpinner={showSpinner}
                handleConfirmModal={handleConfirmModal}
            />
            <CustomRunsModal
                handleUpdateScore={handleUpdateScore}
                showSpinner={showSpinner}
            />

            <OverCompletionModal
                currentInningDetails={currentInningDetails}
                matchId={matchDetails?._id}
            />

            <InningCompletionModal matchDetails={matchDetails} />
            <MatchCompletionModal matchDetails={matchDetails} />
            <OutMethodModal
                matchDetails={matchDetails}
                handleUpdateScore={handleUpdateScore}
            />
            <ReplaceBowlerModal matchId={matchDetails?._id} />
            <UndoModal />
            <ChangeStrikerModal
                showSpinner={showSpinner}
                matchDetails={matchDetails}
                handleChangeStrike={handleChangeStrike}
            />
        </View>
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
    overs_wrapper: {},
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
        paddingVertical: normalizeVertical(10),
        paddingHorizontal: normalize(20),
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(10)
    },
    over_timeline: {
        height: normalize(38),
        width: normalize(38),
        borderRadius: normalize(50),
        backgroundColor: "#EEEEEE",
        justifyContent: "center",
        alignItems: "center"
    },
    timeline_text: {
        fontSize: normalize(18),
        color: "#474646",
        fontFamily: "robotoBold"
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
    out_text: {
        color: "#E21F26"
    },
    out_player: {
        color: "rgba(198,198,198,0.4)"
    }
});

export default ManageScoreBoardScreen;
