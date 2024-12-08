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

import Header from "../components/Header.js";
import LoadingSpinner from "../components/Loading.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const HomeScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);

    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [matches, setMatches] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

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
                    const accessToken =
                        await AsyncStorage.getItem("accessToken");
                    if (!accessToken) {
                        throw new Error("access token not found");
                    }
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
                                    onPress={() =>
                                        match.matchStatus === "no toss"
                                            ? navigation.navigate(
                                                  "toss -screen",
                                                  {
                                                      matchId: match._id
                                                  }
                                              )
                                            : navigation.navigate(
                                                  "manage-scoreboard",
                                                  { matchId: match._id }
                                              )
                                    }
                                >
                                    <View
                                        style={styles.other_match_info_wrapper}
                                    >
                                        <Text style={styles.match_place}>
                                            {match.matchPlace.ground} |{" "}
                                            {match.matchPlace.city}
                                        </Text>
                                        <View
                                            style={styles.match_status_wrapper}
                                        >
                                            <Text style={styles.match_status}>
                                                {match.matchStatus ===
                                                "match completed"
                                                    ? "completed"
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

                                    <View style={styles.toss_info_wrapper}>
                                        <Text style={styles.toss_info}>
                                            {match.matchStatus ===
                                            "toss happend"
                                                ? `${match.toss.tossWinner} elected to ${match.toss.tossDecision} first`
                                                : "toss will commence shortly"}
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
        paddingTop: normalizeVertical(10),
        paddingBottom: normalizeVertical(55)
    },
    match: {
        width: "90%",
        gap: normalize(18),
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
    toss_info_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    toss_info: {
        fontSize: normalize(18),
        color: "#1A4DA1",
        fontFamily: "robotoBold",
        textAlign: "center"
    },
    match_place: {
        fontSize: normalize(16),
        textTransform: "capitalize",
        fontFamily: "latoBold"
    },
    match_status_wrapper: {
        backgroundColor: "#f48441",

        paddingHorizontal: normalize(15),
        paddingVertical: normalizeVertical(6),
        borderRadius: normalize(15)
    },
    match_status: {
        color: "#FFFFFF",
        fontSize: normalize(16),
        fontFamily: "latoBold"
    }
});

export default HomeScreen;
