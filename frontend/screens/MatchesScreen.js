import { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { resetMatchState } from "../redux/matchSlice.js";
import { useFocusEffect } from "@react-navigation/native";
import { debounce } from "lodash";
import Header from "../components/Header.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useGetAllMatchesQuery } from "../services/matchApi";

const MatchesScreen = ({ navigation, route }) => {
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();
    const { accessToken } = useSelector(state => state.auth);

    const { data, isLoading } = useGetAllMatchesQuery();

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            dispatch(resetMatchState());
        });
        return unsubscribe;
    }, [navigation, dispatch]);

    const matches = data?.data || [];

    const handleNavigate = match => {
        if (
            match.matchStatus === "completed" ||
            match.matchStatus === "abandoned"
        )
            return;

        const resetRoutes = [{ name: "home-screen" }];

        let index = 0;

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

        index = resetRoutes.length - 1;

        navigation.reset({
            index,
            routes: resetRoutes
        });
    };

    return (
        <View style={styles.wrapper}>
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
                                        style={styles.other_match_info_wrapper}
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
                                            <Text style={styles.match_status}>
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
                                            {ellipsize(match.teamA.name, 35)}
                                        </Text>
                                        <Text style={styles.versus_text}>
                                            Vs
                                        </Text>
                                        <Text style={styles.team_name}>
                                            {ellipsize(match.teamB.name, 35)}
                                        </Text>
                                    </View>

                                    <View style={styles.match_info_wrapper}>
                                        <Text style={styles.match_info}>
                                            {match.matchStatus === "no toss" &&
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
                                                (match.matchResult.status ===
                                                "Win"
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
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#F2F2F2",
        paddingBottom: normalizeVertical(60)
    },
    section_wrapper: {
        marginVertical: normalizeVertical(5)
    },
    create_new_match_btn: {
        backgroundColor: "#1A4DA1",
        marginTop: normalizeVertical(22),
        marginBottom: normalizeVertical(22),
        marginHorizontal: normalize(18),
        paddingHorizontal: normalize(5),
        paddingVertical: normalizeVertical(12),
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
        paddingBottom: normalizeVertical(30)
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

export default MatchesScreen;
