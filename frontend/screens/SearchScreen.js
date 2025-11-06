import { useState, useEffect, useRef, useMemo } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    ScrollView,
    Text,
    StatusBar,
    Platform,
    Dimensions
} from "react-native";
import ExtraDimensions from "react-native-extra-dimensions-android";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLazySearchMatchesQuery } from "../services/matchApi.js";
import { useLazySearchTournamentsQuery } from "../services/tournamentApi.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { ellipsize } from "../utils/textUtils.js";
import moment from "moment";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useHideTabBar } from "../utils/useHideTabBar.js";

const SearchScreen = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const navigation = useNavigation();
    useHideTabBar(navigation, isScreenFocused);
    const route = useRoute();
    const activeTab = route.params?.activeTab || "matches";

    const inputRef = useRef();

    // RTK Query lazy hooks
    const [triggerMatchSearch, { isFetching: isMatchLoading }] =
        useLazySearchMatchesQuery();
    const [triggerTournamentSearch, { isFetching: isTournamentLoading }] =
        useLazySearchTournamentsQuery();

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () =>
            setIsKeyboardVisible(true)
        );
        const hideSub = Keyboard.addListener("keyboardDidHide", () =>
            setIsKeyboardVisible(false)
        );

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // Focus input on mount
    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

useEffect(() => {
  if (query.trim() === "") {
    setResults(null);
  }
}, [query]);

    const handleSearch = async () => {
        const text = query.trim();
        if (!text) {
            setResults(null);
            return;
        }

        if (isKeyboardVisible) Keyboard.dismiss();

        try {
            if (activeTab === "matches") {
                const res = await triggerMatchSearch(text).unwrap();
                setResults(res?.data || []);
            } else {
                const res = await triggerTournamentSearch(text).unwrap();
                setResults(res?.data || []);
            }
        } catch {
            setResults([]);
        }
    };

    const handleClose = () => {
        if (isKeyboardVisible) {
            Keyboard.dismiss();
        }
        navigation.goBack();
    };

    const handleMatchNavigate = match => {
        handleClose();
        if (["completed", "abandoned"].includes(match.matchStatus)) return;

        const resetRoutes = [{ name: "home-screen" }];

        if (match.matchStatus === "no toss") {
            resetRoutes.push({
                name: "toss-screen",
                params: { matchId: match._id }
            });
        } else if (match.matchStatus === "toss happend") {
            resetRoutes.push({
                name: "initial-players-assign-screen",
                params: { matchId: match._id }
            });
        } else if (match.isOverChangePending) {
            resetRoutes.push({
                name: "manage-scoreboard",
                params: { matchId: match._id }
            });
            resetRoutes.push({
                name: "select-new-bowler",
                params: { matchId: match._id }
            });
        } else if (match.isSelectNewBatsmanPending) {
            resetRoutes.push({
                name: "manage-scoreboard",
                params: { matchId: match._id }
            });
            resetRoutes.push({
                name: "select-new-batsman",
                params: { matchId: match._id }
            });
        } else if (match.isInningChangePending) {
            resetRoutes.push({
                name: "initial-players-assign-screen",
                params: { matchId: match._id }
            });
        } else {
            resetRoutes.push({
                name: "manage-scoreboard",
                params: { matchId: match._id }
            });
        }

        navigation.reset({
            index: resetRoutes.length - 1,
            routes: resetRoutes
        });
    };

    const handleTournamentNavigate = tournament => {
        handleClose();
        navigation.navigate("tournament-matches", {
            tournamentName: tournament?.name,
            tournamentId: tournament?._id
        });
    };

    const deviceWidth = Dimensions.get("window").width;
    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");

    const isLoading =
        activeTab === "matches" ? isMatchLoading : isTournamentLoading;

    return (
        <View style={styles.screen_wrapper}>
            <View style={styles.header} />
            {/* Search Bar */}
            <View style={styles.search_bar}>
                <TouchableOpacity onPress={handleClose}>
                    <Icon name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder={`Search ${activeTab}...`}
                    placeholderTextColor="#999"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery("")}>
                        <Icon name="close" size={22} color="#555" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Results */}
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={styles.results_container}
            >
                {isLoading ? (
                    <Text style={styles.info_text}>Searching...</Text>
                ) : results? (
                    results.map(item =>
                        activeTab === "matches" ? (
                            <TouchableOpacity
                                style={styles.match}
                                key={item._id}
                                onPress={() => handleMatchNavigate(item)}
                            >
                                {/* Match UI */}
                                <View style={styles.other_match_info_wrapper}>
                                    <Text style={styles.match_place}>
                                        {ellipsize(item.matchPlace.ground, 10)}{" "}
                                        | {ellipsize(item.matchPlace.city, 10)}
                                    </Text>
                                    <View
                                        style={[
                                            styles.match_status_wrapper,
                                            item.matchStatus === "completed"
                                                ? styles.bg_green
                                                : item.matchStatus ===
                                                  "abandoned"
                                                ? styles.bg_red
                                                : styles.bg_orange
                                        ]}
                                    >
                                        <Text style={styles.match_status}>
                                            {item.matchStatus === "completed"
                                                ? "Completed"
                                                : item.matchStatus ===
                                                  "abandoned"
                                                ? "Abandoned"
                                                : "In progress"}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.team_name_wrapper}>
                                    <Text style={styles.team_name}>
                                        {ellipsize(item.teamA.name, 35)}
                                    </Text>
                                    <Text style={styles.versus_text}>Vs</Text>
                                    <Text style={styles.team_name}>
                                        {ellipsize(item.teamB.name, 35)}
                                    </Text>
                                </View>

                                <View style={styles.match_info_wrapper}>
                                    <Text style={styles.match_info}>
                                        {item.matchStatus === "no toss" &&
                                            "Toss will commence shortly"}
                                        {(item.matchStatus === "toss happend" ||
                                            item.matchStatus ===
                                                "in progress") &&
                                            `${ellipsize(
                                                item.toss.tossWinner,
                                                35
                                            )} elected to ${
                                                item.toss.tossDecision
                                            } first`}
                                        {item.matchStatus === "inning break" &&
                                            "Innings break"}
                                        {item.matchStatus === "completed" &&
                                            item.matchResult &&
                                            (item.matchResult.status === "Win"
                                                ? `${ellipsize(
                                                      item.matchResult
                                                          .winningTeam,
                                                      35
                                                  )} won by ${
                                                      item.matchResult
                                                          .winningMargin
                                                  }`
                                                : item.matchResult.status ===
                                                  "Tie"
                                                ? "Match Tied"
                                                : item.matchResult.status ===
                                                  "Super Over"
                                                ? `${ellipsize(
                                                      item.matchResult
                                                          .winningTeam,
                                                      35
                                                  )} won the super over`
                                                : item.matchResult.status ===
                                                  "Super Over Tie"
                                                ? "Super Over Tied"
                                                : "")}
                                        {item.matchStatus === "super over" &&
                                            "Match tied (super over in progress)"}
                                        {item.matchStatus === "abandoned" &&
                                            "Match abandoned"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.tournament}
                                key={item._id}
                                onPress={() => handleTournamentNavigate(item)}
                            >
                                <View
                                    style={styles.other_tournament_info_wrapper}
                                >
                                    <Text style={styles.location}>
                                        {ellipsize(item.location.ground, 10)} |{" "}
                                        {ellipsize(item.location.city, 10)}
                                    </Text>
                                    <View
                                        style={[
                                            styles.tournament_status_wrapper,
                                            item.status === "completed"
                                                ? styles.bg_green
                                                : styles.bg_orange
                                        ]}
                                    >
                                        <Text style={styles.tournament_status}>
                                            {item.status === "completed"
                                                ? "Completed"
                                                : item.status === "ongoing"
                                                ? "Ongoing"
                                                : "Upcoming"}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.team_name_wrapper}>
                                    <Text style={styles.team_name}>
                                        {ellipsize(item.name, 35)}
                                    </Text>
                                </View>

                                <View style={styles.tournament_date_wrapper}>
                                    <Text style={styles.tournament_date}>
                                        {moment(item?.startDate).format(
                                            "DD MMM YYYY"
                                        )}{" "}
                                        to{" "}
                                        {moment(item?.endDate).format(
                                            "DD MMM YYYY"
                                        )}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )
                    )
                ) : results? (
                    <Text style={styles.info_text}>No results found</Text>
                ) : (
                    <Text style={styles.info_text}>
                         Search {activeTab}
                    </Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen_wrapper: {
        flex: 1,
        backgroundColor: "#F2F2F2"
    },
    header: {
        height: StatusBar.currentHeight,
        backgroundColor: "#E21F26"
    },
    search_bar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: normalize(14),
        paddingVertical: normalizeVertical(10),
        marginVertical: normalizeVertical(6),
        marginHorizontal: normalize(6),
        elevation: 2,
        borderRadius: normalize(2)
    },
    input: {
        flex: 1,
        fontSize: normalize(17),
        color: "#000",
        marginHorizontal: normalize(10)
    },
    results_container: {
        flex: 1,
        backgroundColor: "#F2F2F2",
        padding: normalize(18)
    },
    match: {
        width: "100%",
        gap: normalizeVertical(12),
        justifyContent: "center",
        backgroundColor: "white",
        paddingHorizontal: normalize(10),
        paddingVertical: normalizeVertical(10),
        borderRadius: normalize(4),
        elevation: 1
    },
    tournament: {
        width: "100%",
        gap: normalizeVertical(12),
        justifyContent: "center",
        backgroundColor: "white",
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
        fontSize: normalize(18),
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
    match_info_wrapper: { marginTop: normalizeVertical(6) },
    match_info: {
        fontSize: normalize(18),
        color: "#1A4DA1",
        fontFamily: "robotoMedium",
        textAlign: "center",
        textTransform: "capitalize"
    },
    other_tournament_info_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    location: {
        fontSize: normalize(16),
        textTransform: "capitalize",
        fontFamily: "latoBold"
    },
    tournament_status_wrapper: {
        paddingHorizontal: normalize(14),
        paddingVertical: normalizeVertical(6),
        borderRadius: normalize(4)
    },
    tournament_status: {
        color: "#FFFFFF",
        fontSize: normalize(16),
        fontFamily: "latoBold"
    },
    tournament_date_wrapper: { alignItems: "center" },
    tournament_date: { fontSize: normalize(17), fontFamily: "robotoMedium" },
    bg_red: { backgroundColor: "#E21F26" },
    bg_orange: { backgroundColor: "#f48441" },
    bg_green: { backgroundColor: "#14B492" },
    info_text: {
        textAlign: "center",
        marginTop: normalizeVertical(20),
        fontSize: normalize(15),
        color: "#666"
    }
});

export default SearchScreen;
