import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Keyboard,
    TouchableWithoutFeedback
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import {
    setTeamAId,
    setTeamBId,
    setTeamAName,
    setTeamBName,
    setTeamAPlaying11,
    setTeamBPlaying11,
    setTeamACaptain,
    setTeamBCaptain,
    setTotalOvers,
    setCity,
    setGround,
    setTossWinner,
    setTossDecision,
    setStrikeBatsman,
    setNonStrikeBatsman,
    setCurrentBowler
} from "../redux/matchSlice.js";
import Header from "../components/Header.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import { debounce } from "lodash";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const HomeScreen = ({ navigation, route }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [matches, setMatches] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const dispatch = useDispatch();
    const { accessToken } = useSelector(state => state.auth);

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            setSearchQuery("");
            dispatch(setTeamAId(null));
            dispatch(setTeamBId(null));
            dispatch(setTeamAName(null));
            dispatch(setTeamBName(null));
            dispatch(setTeamAPlaying11([]));
            dispatch(setTeamBPlaying11([]));
            dispatch(setTeamACaptain(null));
            dispatch(setTeamBCaptain(null));
            dispatch(setTotalOvers(null));
            dispatch(setCity(null));
            dispatch(setGround(null));
            dispatch(setTossWinner(null));
            dispatch(setTossDecision(null));
            dispatch(setStrikeBatsman({ _id: null, name: null }));
            dispatch(setNonStrikeBatsman({ _id: null, name: null }));
            dispatch(setCurrentBowler({ _id: null, name: null }));
        });
        return unsubscribe;
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            if (searchQuery.trim() === "") {
                getAllMatches();
            }
        }, [isScreenFocused, searchQuery])
    );

    useEffect(() => {
        const debouncedFn = debounce(() => {
            if (searchQuery.trim() !== "") {
                getSearchedMatches();
            }
        }, 500);
        debouncedFn();
        return () => debouncedFn.cancel();
    }, [searchQuery]);

    const getAllMatches = async () => {
        try {
            setIsLoading(true);
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

    const getSearchedMatches = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/search-match?searched=${searchQuery}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            const data = await response.json();

            if (response.status === 200) {
                setMatches(data.data);
            } else {
                setMatches([]);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigate = match => {
        if (
            match.matchStatus !== "completed" &&
            match.matchStatus !== "abandoned"
        ) {
            if (match.matchStatus === "no toss") {
                navigation.navigate("toss-screen", {
                    matchId: match._id
                });
            } else if (match.matchStatus === "toss happend") {
                navigation.navigate("initial-players-assign-screen", {
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.wrapper}>
                <Header
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
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
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.matches_wrapper}>
                            {matches.length > 0 ? (
                                matches?.map(match => (
                                    <TouchableOpacity
                                        style={styles.match}
                                        key={match._id}
                                        onPress={() => handleNavigate(match)}
                                    >
                                        <View
                                            style={
                                                styles.other_match_info_wrapper
                                            }
                                        >
                                            <Text style={styles.match_place}>
                                                {ellipsize(
                                                    match.matchPlace.ground,
                                                    10
                                                )}{" "}
                                                |{" "}
                                                {ellipsize(
                                                    match.matchPlace.city,
                                                    10
                                                )}
                                            </Text>
                                            <View
                                                style={[
                                                    styles.match_status_wrapper,
                                                    match.matchStatus ===
                                                    "completed"
                                                        ? styles.bg_green
                                                        : match.matchStatus ===
                                                          "abandoned"
                                                        ? styles.bg_red
                                                        : styles.bg_orange
                                                ]}
                                            >
                                                <Text
                                                    style={styles.match_status}
                                                >
                                                    {match.matchStatus ===
                                                    "completed"
                                                        ? "Completed"
                                                        : match.matchStatus ===
                                                          "abandoned"
                                                        ? "Abandoned"
                                                        : "in progress"}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.team_name_wrapper}>
                                            <Text style={styles.team_name}>
                                                {ellipsize(
                                                    match.teamA.name,
                                                    35
                                                )}
                                            </Text>
                                            <Text style={styles.versus_text}>
                                                Vs
                                            </Text>
                                            <Text style={styles.team_name}>
                                                {ellipsize(
                                                    match.teamB.name,
                                                    35
                                                )}
                                            </Text>
                                        </View>

                                        <View style={styles.match_info_wrapper}>
                                            <Text style={styles.match_info}>
                                                {match.matchStatus ===
                                                    "no toss" &&
                                                    "toss will commence shortly"}

                                                {(match.matchStatus ===
                                                    "toss happend" ||
                                                    match.matchStatus ===
                                                        "in progress") &&
                                                    `${ellipsize(
                                                        match.toss.tossWinner,
                                                        35
                                                    )} elected to ${
                                                        match.toss.tossDecision
                                                    } first`}

                                                {match.matchStatus ===
                                                    "inning break" &&
                                                    "innings break"}

                                                {match?.matchStatus ===
                                                    "completed" &&
                                                    match?.matchResult &&
                                                    (match.matchResult
                                                        .status === "Win"
                                                        ? `${ellipsize(
                                                              match.matchResult
                                                                  .winningTeam,
                                                              35
                                                          )} won by ${
                                                              match.matchResult
                                                                  .winningMargin
                                                          }`
                                                        : match.matchResult
                                                              .status === "Tie"
                                                        ? "Match Tied"
                                                        : match.matchResult
                                                              .status ===
                                                          "Super Over"
                                                        ? `${ellipsize(
                                                              match.matchResult
                                                                  .winningTeam,
                                                              35
                                                          )} won the super over`
                                                        : match.matchResult
                                                              .status ===
                                                          "Super Over Tie"
                                                        ? "Super Over Tied"
                                                        : "")}
                                                {match.matchStatus ===
                                                    "super over" &&
                                                    "match tied (super over in progress)"}

                                                {match.matchStatus ===
                                                    "abandoned" &&
                                                    "match abandoned"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.not_found_wrapper}>
                                    <Text style={styles.not_found_text}>
                                        No match found
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                ) : (
                    <LoadingSpinner />
                )}
            </View>
        </TouchableWithoutFeedback>
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
        gap: normalizeVertical(20),
        paddingTop: normalizeVertical(5),
        paddingBottom: normalizeVertical(50)
    },
    match: {
        width: "90%",
        gap: normalizeVertical(12),
        justifyContent: "center",
        backgroundColor: "white",
        marginHorizontal: "auto",
        paddingHorizontal: normalize(10),
        paddingVertical: normalizeVertical(10),
        borderRadius: normalize(4),
        elevation: 1
    },
    team_name_wrapper: {
        justifyContent: "center",
        alignItems: "center",
        gap: normalizeVertical(10)
    },
    team_name: {
        fontSize: normalize(17),
        color: "#474646",
        textTransform: "capitalize",
        fontFamily: "ubuntuMedium"
    },
    versus_text: {
        fontSize: normalize(20),
        color: "#E21F26",
        fontFamily: "robotoBold"
    },
    other_match_info_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    match_info: {
        fontSize: normalize(17),
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
        paddingHorizontal: normalize(14),
        paddingVertical: normalizeVertical(6),
        borderRadius: normalize(4)
    },
    match_status: {
        color: "#FFFFFF",
        fontSize: normalize(16),
        fontFamily: "latoBold"
    },
    bg_red: {
        backgroundColor: "#E21F26"
    },
    bg_orange: {
        backgroundColor: "#f48441"
    },
    bg_green: {
        backgroundColor: "#14B492"
    },
    not_found_wrapper: {
        justifyContent: "center",
        alignItems: "center"
    },
    not_found_text: {
        color: "#696969",
        fontSize: normalize(19),
        fontFamily: "latoBold"
    }
});

export default HomeScreen;
