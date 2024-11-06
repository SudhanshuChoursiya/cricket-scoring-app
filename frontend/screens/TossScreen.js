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
import { setTossDecision, setTossWinner } from "../redux/matchSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import batLogo from "../assets/cricket-bat.png";
import ballLogo from "../assets/cricket-ball.png";
import Spinner from "../components/Spinner.js";
import { showAlert } from "../redux/alertSlice.js";
import AlertToast from "../components/AlertToast.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const TossScreen = ({ navigation, route }) => {
    const [matchDetails, setMatchDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();

    const { tossWinner, tossDecision } = useSelector(state => state.match);

    console.log("28", tossWinner, tossDecision);
    console.log("29", matchDetails);
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
                        `${process.env.EXPO_PUBLIC_BASE_URL}/get-match-details/${route.params?.matchId}`
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

    const handleToss = async () => {
        try {
            if (!tossWinner || !tossDecision) {
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

            setIsLoading(true);
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/update-toss-details/${route.params?.matchId}`,

                {
                    method: "POST",
                    headers: {
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
                dispatch(
                    showAlert({
                        value: true,
                        severity: "error",
                        type: "normal_alert",
                        msg: data.message
                    })
                );
                setIsLoading(false);
            } else {
                dispatch(
                    showAlert({
                        value: true,
                        severity: "success",
                        type: "normal_alert",
                        msg: data.message
                    })
                );

                setIsLoading(false);
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
            setIsLoading(false);
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
                <Text style={styles.label}>Toss</Text>
            </View>

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
                            dispatch(setTossWinner(matchDetails?.teamA.name))
                        }
                    >
                        <View style={styles.team_icon_wrapper}>
                            <Text style={styles.team_icon_text}>
                                {matchDetails?.teamA.name[0]}
                            </Text>
                        </View>
                        <Text style={styles.team_name}>
                            {matchDetails?.teamA.name}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.team,
                            tossWinner === matchDetails?.teamB.name &&
                                styles.selected
                        ]}
                        onPress={() =>
                            dispatch(setTossWinner(matchDetails?.teamB.name))
                        }
                    >
                        <View style={styles.team_icon_wrapper}>
                            <Text style={styles.team_icon_text}>
                                {matchDetails?.teamB.name[0]}
                            </Text>
                        </View>
                        <Text style={styles.team_name}>
                            {matchDetails?.teamB.name}
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
                        onPress={() => dispatch(setTossDecision("ball"))}
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
                    {!isLoading ? (
                        <Text style={styles.confirm_btn_text}>Let’s Play</Text>
                    ) : (
                        <Spinner
                            isLoading={isLoading}
                            label="processing..."
                            spinnerColor="white"
                            labelColor="white"
                            labelSize={17}
                            spinnerSize={24}
                        />
                    )}
                </TouchableOpacity>
            </View>
            <AlertToast
                topOffSet={15}
                successToastStyle={{ borderLeftColor: "green" }}
                errorToastStyle={{ borderLeftColor: "red" }}
            />
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
        width: normalize(150),
        height: normalizeVertical(180),
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
        borderRadius: normalize(50)
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
        textTransform: "capitalize"
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
        width: normalize(150),
        height: normalizeVertical(180),
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
        borderRadius: normalize(50)
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
    }
});

export default TossScreen;
