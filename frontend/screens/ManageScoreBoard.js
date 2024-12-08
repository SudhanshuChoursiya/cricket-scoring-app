import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    StatusBar
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import Icon from "react-native-vector-icons/MaterialIcons";
import ExtraRunsModal from "../components/ExtraRunsModal.js";
import OverCompletionModal from "../components/OverCompletionModal.js";
import UndoModal from "../components/UndoModal.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ManageScoreBoardScreen = ({ navigation, route }) => {
    const [matchDetails, setMatchDetails] = useState(null);
    const [currentInningDetails, setCurrentInningDetails] = useState(null);

    const [strikeBatsman, setStrikeBatsman] = useState(null);
    const [nonStrikeBatsman, setNonStrikeBatsman] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [showOverCompletionModal, setShowOverCompletionModal] =
        useState(false);
    const [showUndoModal, setShowUndoModal] = useState(false);

    const [modalProps, setModalProps] = useState({
        title: "",
        inputLabel: "",
        inputValue: 0,
        payload: null,
        isShow: false
    });

    const getMatchDetails = async () => {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/get-match-details/${route.params?.matchId}`
            );
            const data = await response.json();

            if (response.status === 200) {
                setMatchDetails(data.data);

                setCurrentInningDetails(
                    data.data.currentInning === 1
                        ? data.data.inning1
                        : data.data.inning2
                );
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
    }, []);

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
            setModalProps(preVal => ({
                ...preVal,

                title: "Wide Ball",
                inputLabel: "WIDE",
                payload: payload,
                isShow: true
            }));
        } else if (modalType === "NB") {
            setModalProps(preVal => ({
                ...preVal,
                title: "No Ball",
                inputLabel: "NB",
                payload: payload,
                isShow: true
            }));
        } else if (modalType === "BY") {
            setModalProps(preVal => ({
                ...preVal,
                title: "Bye",
                inputLabel: "BY",
                payload: payload,
                isShow: true
            }));
        } else if (modalType === "LB") {
            setModalProps(preVal => ({
                ...preVal,
                title: "Leg Bye",
                inputLabel: "LB",
                payload: payload,
                isShow: true
            }));
        }
    };

    const handleCloseModal = () => {
        setModalProps(preVal => ({ ...preVal, inputValue: 0, isShow: false }));
    };

    const handleConfirmModal = () => {
        handleUpdateScore(modalProps.inputLabel, modalProps.payload).then(() =>
            handleCloseModal()
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
            label: "5",
            payload: {
                runs: 5,
                isWide: false,
                isNoball: false,
                isBye: false,
                isLegBye: false,
                isWicket: false
            }
        },
        {
            label: "7",
            payload: {
                runs: 7,
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
                payload = { ...payload, runs: modalProps.inputValue };
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
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();
            if (response.status === 200) {
                getMatchDetails();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
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
                    {matchDetails?.currentInning === 1
                        ? matchDetails?.inning1.battingTeam.name
                        : matchDetails?.inning2.battingTeam}
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
                <View style={styles.toss_details_wrapper}>
                    <Text style={styles.toss_details}>
                        {matchDetails?.toss.tossWinner} won the toss and elected
                        to {matchDetails?.toss.tossDecision}
                    </Text>
                </View>
                <View style={styles.current_batsman_wrapper}>
                    {currentInningDetails?.currentBatsmen.map(player => (
                        <View style={styles.current_batsman} key={player._id}>
                            <Text style={styles.batsman_score}>
                                {player.runs} ({player.balls})
                            </Text>
                            <Text
                                style={[
                                    styles.batsman_name,
                                    player.onStrike && styles.on_strike
                                ]}
                            >
                                {player.name}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.current_bowler_wrapper}>
                <View style={styles.current_bowler}>
                    <Icon
                        name="sports-baseball"
                        size={normalize(26)}
                        color="#474646"
                    />
                    <Text style={styles.bowler_name}>
                        {currentInningDetails?.currentBowler.name}
                    </Text>
                </View>
                <View style={styles.bowler_stats_wrapper}>
                    <Text style={styles.bowler_stats}>
                        {currentInningDetails?.currentBowler.wickets}-
                        {currentInningDetails?.currentBowler.runsConceded}(
                        {formatOver(
                            currentInningDetails?.currentBowler.ballsBowled
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

                                    index === arr.length - 1 && {
                                        borderRightWidth: 0
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
                                    button.label === "UNDO"
                                        ? setShowUndoModal(true)
                                        : handleUpdateScore()
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
                                button.label === "OTHER"
                                    ? setShowOverCompletionModal(true)
                                    : handleOpenModal(
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
            {/* Modal */}
            <ExtraRunsModal
                modalProps={modalProps}
                setModalProps={setModalProps}
                handleCloseModal={handleCloseModal}
                handleConfirmModal={handleConfirmModal}
            />

            {/* Over Completion modal*/}

            <OverCompletionModal
                s
                showModal={showOverCompletionModal}
                setShowModal={setShowOverCompletionModal}
                currentInningDetails={currentInningDetails}
            />
            <UndoModal
                showModal={showUndoModal}
                setShowModal={setShowUndoModal}
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
        paddingTop: normalizeVertical(50),
        paddingBottom: normalizeVertical(20),
        backgroundColor: "#E21F26",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: normalize(20)
    },
    label: {
        fontSize: normalize(20),
        color: "white",
        paddingHorizontal: normalize(13),
        textTransform: "capitalize",
        position: "absolute",
        left: 0,
        right: 0,
        top: normalizeVertical(50),
        textAlign: "center",
        fontFamily: "robotoMedium"
    },

    batting_team_score_wrapper: {
        width: "100%",
        height: normalizeVertical(280),
        paddingTop: normalizeVertical(60),
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
        borderWidth: 1,
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
    }
});

export default ManageScoreBoardScreen;
