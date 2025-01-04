import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Pressable,
    StatusBar
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Header from "../components/Header.js";
import LoadingSpinner from "../components/LoadingSpinner.js";

import { normalize, normalizeVertical } from "../utils/responsive.js";

const HomeScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);

    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [matches, setMatches] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { accessToken } = useSelector(state => state.auth);

    useFocusEffect(
        useCallback(() => {
            setIsScreenFocused(true);
            return () => setIsScreenFocused(false);
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            const getMatchDetails = async () => {
                try {
                    const response = await fetch(
                        `${process.env.EXPO_PUBLIC_BASE_URL}/get-all-matches`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        }
                    );
                    const data = await response.json();

                    if (response.status === 200) {
                        setMatches(data.data);
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

    const handleNavigate = match => {
        if (match.matchStatus !== "completed") {
            if (match.matchStatus === "no toss") {
                navigation.navigate("toss -screen", {
                    matchId: match._id
                });
            } else if (match.isOverChangePending) {
                navigation.navigate("select-new-bowler", {
                    matchId: match._id
                });
            } else if (match.isSelectNewBatsmanPending) {
                navigation.navigate("select-new-batsman", {
                    matchId: match._id
                });
            } else if (match.isInningChangePending) {
                navigation.navigate("initial-players-assign-screen", {
                    matchId: match._id
                });
            } else {
                navigation.navigate("manage-scoreboard", {
                    matchId: match._id
                });
            }
        }
    };

    return (
        <View style={styles.wrapper}>
            <Header
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
            />
            <View style={styles.section_wrapper}>
                <TouchableOpacity
                    style={styles.create_new_match_btn}
                    onPress={() => navigation.navigate("select-teams")}
                >
                    <Text style={styles.create_new_match_btn_text}>
                        create new match
                    </Text>
                </TouchableOpacity>
            </View>
            {!isLoading ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps={"handled"}
                >
                    <Pressable
                        onPressOut={() => {
                            showSuggestions === true &&
                                setShowSuggestions(false);
                        }}
                    >
                        <View style={styles.matches_wrapper}>
                            {matches?.map(match => (
                                <TouchableOpacity
                                    style={styles.match}
                                    key={match._id}
                                    onPress={() => handleNavigate(match)}
                                >
                                    <View
                                        style={styles.other_match_info_wrapper}
                                    >
                                        <Text style={styles.match_place}>
                                            {match.matchPlace.ground} |{" "}
                                            {match.matchPlace.city}
                                        </Text>
                                        <View
                                            style={[
                                                styles.match_status_wrapper,
                                                match.matchStatus ===
                                                "completed"
                                                    ? styles.bg_green
                                                    : styles.bg_orange
                                            ]}
                                        >
                                            <Text style={styles.match_status}>
                                                {match.matchStatus ===
                                                "completed"
                                                    ? "Completed"
                                                    : "in progress"}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.team_name_wrapper}>
                                        <Text style={styles.team_name}>
                                            {match.teamA.name}
                                        </Text>
                                        <Text style={styles.versus_text}>
                                            Vs
                                        </Text>
                                        <Text style={styles.team_name}>
                                            {match.teamB.name}
                                        </Text>
                                    </View>

                                    <View style={styles.match_info_wrapper}>
                                        <Text style={styles.match_info}>
                                            {match.matchStatus === "no toss" &&
                                                "toss will commence shortly"}
                                            {match.matchStatus ===
                                                "toss happend" &&
                                                `${match.toss.tossWinner} elected to ${match.toss.tossDecision} first`}
                                            {match.matchStatus ===
                                                "completed" &&
                                                `${match.matchWinner.teamName} won by ${match.matchWinner.wonBy}`}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </ScrollView>
            ) : (
                <LoadingSpinner />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#F2F2F2"
    },
    section_wrapper: {
        marginTop: normalizeVertical(22),

        zIndex: -1
    },
    create_new_match_btn: {
        backgroundColor: "#1A4DA1",
        marginVertical: normalizeVertical(25),
        marginHorizontal: normalize(18),
        paddingHorizontal: normalize(5),
        paddingVertical: normalizeVertical(15),
        borderRadius: normalize(12)
    },
    create_new_match_btn_text: {
        fontSize: normalize(18),
        textAlign: "center",
        color: "white",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    },
    matches_wrapper: {
        gap: normalizeVertical(22),
        paddingTop: normalizeVertical(5),
        paddingBottom: normalizeVertical(50)
    },
    match: {
        width: "90%",
        gap: normalize(20),
        justifyContent: "center",
        backgroundColor: "white",
        marginHorizontal: "auto",
        paddingHorizontal: normalize(10),
        paddingVertical: normalizeVertical(10),
        borderRadius: normalize(8),
        elevation: 2,
        borderWidth: 2,
        borderColor: "white"
    },
    team_name_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    team: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(10)
    },
    team_icon: {
        backgroundColor: "#f75454",
        height: normalize(60),
        width: normalize(60),
        borderRadius: normalize(100),
        justifyContent: "center",
        alignItems: "center",
        elevation: 1
    },
    team_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    team_name: {
        fontSize: normalize(18),
        color: "#474646",
        textTransform: "capitalize",
        fontFamily: "ubuntuMedium"
    },
    versus_text: {
        fontSize: normalize(22),
        color: "#E21F26",
        fontFamily: "robotoBold"
    },
    other_match_info_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    match_info_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    match_info: {
        fontSize: normalize(18),
        color: "#1A4DA1",
        fontFamily: "robotoMedium",
        textAlign: "center",
        textTransform: "capitalize"
    },
    match_place: {
        fontSize: normalize(16),
        textTransform: "capitalize",
        fontFamily: "latoBold"
    },
    match_status_wrapper: {
        paddingHorizontal: normalize(15),
        paddingVertical: normalizeVertical(6),
        borderRadius: normalize(15)
    },
    match_status: {
        color: "#FFFFFF",
        fontSize: normalize(16),
        fontFamily: "latoBold"
    },
    bg_orange: {
        backgroundColor: "#f48441"
    },
    bg_green: {
        backgroundColor: "#14B492"
    }
});

export default HomeScreen;
