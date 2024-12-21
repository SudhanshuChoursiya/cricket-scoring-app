import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import {
    setStrikeBatsman,
    setNonStrikeBatsman,
    setCurrentBowler
} from "../redux/matchSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";

import Spinner from "../components/Spinner.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import { showAlert } from "../redux/alertSlice.js";
import AlertToast from "../components/AlertToast.js";

import { normalize, normalizeVertical } from "../utils/responsive.js";
const InitialPlayersAssignScreen = ({ navigation, route }) => {
    const [matchDetails, setMatchDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();
    const { accessToken } = useSelector(state => state.auth);

    const { strikeBatsman, nonStrikeBatsman, currentBowler } = useSelector(
        state => state.match
    );

    useEffect(() => {
        setIsScreenFocused(true);
    }, []);

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
        }, [isScreenFocused])
    );

    const handleUpdateInitialPlayers = async () => {
        try {
            setShowSpinner(true);
            if (
                !strikeBatsman.playerId ||
                !nonStrikeBatsman.playerId ||
                !currentBowler.playerId
            ) {
                dispatch(
                    showAlert({
                        value: true,
                        severity: "error",
                        type: "normal_alert",
                        msg: "plz select all required field"
                    })
                );
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/update-initial-players/${route.params?.matchId}`,

                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        strikeBatsmanId: strikeBatsman.playerId,
                        nonStrikeBatsmanId: nonStrikeBatsman.playerId,
                        currentBowlerId: currentBowler.playerId
                    })
                }
            );

            const data = await response.json();
            if (response.status !== 200) {
                dispatch(
                    showAlert({
                        value: true,
                        severity: "error",
                        type: "normal_alert",
                        msg: data.message
                    })
                );
            } else {
                dispatch(
                    showAlert({
                        value: true,
                        severity: "success",
                        type: "normal_alert",
                        msg: data.message
                    })
                );

                dispatch(setStrikeBatsman({ _id: null, name: null }));
                dispatch(setNonStrikeBatsman({ _id: null, name: null }));
                dispatch(setCurrentBowler({ _id: null, name: null }));

                navigation.navigate("manage-scoreboard", {
                    matchId: route.params?.matchId
                });
            }
        } catch (error) {
            console.log(error);
            dispatch(
                showAlert({
                    value: true,
                    severity: "error",
                    type: "normal_alert",
                    msg: "unexpected error occured,please try again latter"
                })
            );
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
                    Start {matchDetails?.currentInning === 1 ? "1st" : "2nd"}{" "}
                    Innings
                </Text>
            </View>

            {!isLoading ? (
                <>
                    <View style={styles.select_striker_and_nonstriker_wrapper}>
                        <Text style={styles.heading}>
                            batting -{" "}
                            {matchDetails?.currentInning === 1
                                ? matchDetails?.inning1.battingTeam.name
                                : matchDetails?.inning2.battingTeam.name}
                        </Text>

                        <View style={styles.select_batsman_wrapper}>
                            {!strikeBatsman.playerId ? (
                                <TouchableOpacity
                                    style={styles.batsman}
                                    onPress={() =>
                                        navigation.navigate(
                                            "select-initial-player-screen",
                                            {
                                                matchId: route.params?.matchId,
                                                selectFor: "strike batsman"
                                            }
                                        )
                                    }
                                >
                                    <View
                                        style={[
                                            styles.batsman_icon_wrapper,
                                            !strikeBatsman.playerId &&
                                                styles.bg_flash_white
                                        ]}
                                    >
                                        <Icon
                                            name="add"
                                            size={normalize(34)}
                                            color="black"
                                        />
                                    </View>
                                    <Text style={styles.batsman_name}>
                                        striker
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.batsman}
                                    onPress={() =>
                                        navigation.navigate(
                                            "select-initial-player-screen",
                                            {
                                                matchId: route.params?.matchId,
                                                selectFor: "strike batsman"
                                            }
                                        )
                                    }
                                >
                                    <View style={styles.batsman_icon_wrapper}>
                                        <Text style={styles.batsman_icon_text}>
                                            {strikeBatsman.name &&
                                                strikeBatsman.name[0]}
                                        </Text>
                                    </View>
                                    <Text style={styles.batsman_name}>
                                        {strikeBatsman.name &&
                                            strikeBatsman.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {!nonStrikeBatsman.playerId ? (
                                <TouchableOpacity
                                    style={styles.batsman}
                                    onPress={() =>
                                        navigation.navigate(
                                            "select-initial-player-screen",
                                            {
                                                matchId: route.params?.matchId,
                                                selectFor: "non strike batsman"
                                            }
                                        )
                                    }
                                >
                                    <View
                                        style={[
                                            styles.batsman_icon_wrapper,
                                            !nonStrikeBatsman.playerId &&
                                                styles.bg_flash_white
                                        ]}
                                    >
                                        <Icon
                                            name="add"
                                            size={normalize(34)}
                                            color="black"
                                        />
                                    </View>
                                    <Text style={styles.batsman_name}>
                                        non-striker
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.batsman}
                                    onPress={() =>
                                        navigation.navigate(
                                            "select-initial-player-screen",
                                            {
                                                matchId: route.params?.matchId,
                                                selectFor: "non strike batsman"
                                            }
                                        )
                                    }
                                >
                                    <View style={styles.batsman_icon_wrapper}>
                                        <Text style={styles.batsman_icon_text}>
                                            {nonStrikeBatsman.name &&
                                                nonStrikeBatsman.name[0]}
                                        </Text>
                                    </View>
                                    <Text style={styles.batsman_name}>
                                        {nonStrikeBatsman.name &&
                                            nonStrikeBatsman.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.select_current_bowler_wrapper}>
                        <Text style={styles.heading}>
                            Bowling -{" "}
                            {matchDetails?.currentInning === 1
                                ? matchDetails?.inning1.bowlingTeam.name
                                : matchDetails?.inning2.bowlingTeam.name}
                        </Text>

                        <View style={styles.select_bowler_wrapper}>
                            {!currentBowler.playerId ? (
                                <TouchableOpacity
                                    style={styles.bowler}
                                    onPress={() =>
                                        navigation.navigate(
                                            "select-initial-player-screen",
                                            {
                                                matchId: route.params?.matchId,
                                                selectFor: "current bowler"
                                            }
                                        )
                                    }
                                >
                                    <View
                                        style={[
                                            styles.bowler_icon_wrapper,
                                            !currentBowler.playerId &&
                                                styles.bg_flash_white
                                        ]}
                                    >
                                        <Icon
                                            name="add"
                                            size={normalize(34)}
                                            color="black"
                                        />
                                    </View>
                                    <Text style={styles.bowler_name}>
                                        bowler
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.bowler}
                                    onPress={() =>
                                        navigation.navigate(
                                            "select-initial-player-screen",
                                            {
                                                matchId: route.params?.matchId,
                                                selectFor: "current bowler"
                                            }
                                        )
                                    }
                                >
                                    <View style={styles.bowler_icon_wrapper}>
                                        <Text style={styles.bowler_icon_text}>
                                            {currentBowler.name &&
                                                currentBowler.name[0]}
                                        </Text>
                                    </View>
                                    <Text style={styles.bowler_name}>
                                        {currentBowler.name &&
                                            currentBowler.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {strikeBatsman.playerId &&
                        nonStrikeBatsman.playerId &&
                        currentBowler.playerId && (
                            <View style={styles.confirm_btn_wrapper}>
                                <TouchableOpacity
                                    style={styles.confirm_btn}
                                    onPress={handleUpdateInitialPlayers}
                                >
                                    {!showSpinner ? (
                                        <Text style={styles.confirm_btn_text}>
                                            Let’s Play
                                        </Text>
                                    ) : (
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
                    <AlertToast
                        topOffSet={15}
                        successToastStyle={{ borderLeftColor: "green" }}
                        errorToastStyle={{ borderLeftColor: "red" }}
                    />
                </>
            ) : (
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
        paddingTop: normalizeVertical(50),
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
    select_striker_and_nonstriker_wrapper: {
        gap: normalizeVertical(20),
        marginHorizontal: normalize(22),
        marginVertical: normalizeVertical(30)
    },
    select_batsman_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    batsman: {
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(18),
        backgroundColor: "#FFFFFF",
        width: normalize(150),
        height: normalizeVertical(210),
        borderRadius: normalize(7),
        borderWidth: 2,
        borderColor: "white",
        elevation: 2
    },

    batsman_icon_wrapper: {
        height: normalize(90),
        width: normalize(90),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F54133",
        borderRadius: normalize(50),
        elevation: 1
    },
    batsman_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    batsman_name: {
        color: "black",
        fontSize: normalize(18),
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    select_current_bowler_wrapper: {
        gap: normalizeVertical(20),
        marginHorizontal: normalize(22),
        marginVertical: normalizeVertical(50)
    },
    select_bowler_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    bowler: {
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(18),
        backgroundColor: "#FFFFFF",
        width: normalize(150),
        height: normalizeVertical(210),
        borderRadius: normalize(7),
        borderWidth: 2,
        borderColor: "white",
        elevation: 2
    },

    bowler_icon_wrapper: {
        height: normalize(90),
        width: normalize(90),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F54133",
        borderRadius: normalize(50),
        elevation: 1
    },
    bowler_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    bowler_name: {
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
        paddingVertical: normalizeVertical(18)
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
    },
    bg_flash_white: {
        backgroundColor: "#E7E8EA"
    }
});

export default InitialPlayersAssignScreen;
