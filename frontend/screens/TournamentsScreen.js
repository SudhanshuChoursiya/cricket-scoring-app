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
import { useFocusEffect } from "@react-navigation/native";

import Header from "../components/Header.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import { debounce } from "lodash";
import { ellipsize } from "../utils/textUtils.js";
import moment from "moment";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useGetAllTournamentsQuery } from "../services/tournamentApi.js";

const TournamentsScreen = ({ navigation, route }) => {
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();
    const { accessToken } = useSelector(state => state.auth);

    const { data, isLoading} = useGetAllTournamentsQuery();

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    const tournaments = data?.data || [];

    const handleNavigate = tournament => {
        navigation.navigate("tournament-matches", {
            tournamentName: tournament?.name,
            tournamentId: tournament?._id
        });
    };

    return (
            <View style={styles.wrapper}>
                <View style={styles.section_wrapper}>
                    <TouchableOpacity
                        style={styles.create_new_tournament_btn}
                        onPress={() => navigation.navigate("create-tournament")}
                    >
                        <Text style={styles.create_new_tournament_btn_text}>
                            create new tournament
                        </Text>
                    </TouchableOpacity>
                </View>
                {!isLoading ? (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.tournaments_wrapper}>
                            {tournaments.length > 0 ? (
                                tournaments?.map(tournament => (
                                    <TouchableOpacity
                                        style={styles.tournament}
                                        key={tournament._id}
                                        onPress={() =>
                                            handleNavigate(tournament)
                                        }
                                    >
                                        <View
                                            style={
                                                styles.other_tournament_info_wrapper
                                            }
                                        >
                                            <Text style={styles.location}>
                                                {ellipsize(
                                                    tournament.location.ground,
                                                    10
                                                )}{" "}
                                                |{" "}
                                                {ellipsize(
                                                    tournament.location.city,
                                                    10
                                                )}
                                            </Text>
                                            <View
                                                style={[
                                                    styles.tournament_status_wrapper,
                                                    tournament.matchStatus ===
                                                    "completed"
                                                        ? styles.bg_green
                                                        : styles.bg_orange
                                                ]}
                                            >
                                                <Text
                                                    style={
                                                        styles.tournament_status
                                                    }
                                                >
                                                    {tournament.status ===
                                                    "completed"
                                                        ? "Completed"
                                                        : tournament.status ===
                                                          "ongoing"
                                                        ? "Ongoing"
                                                        : "upcoming"}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.team_name_wrapper}>
                                            <Text style={styles.team_name}>
                                                {ellipsize(tournament.name, 35)}
                                            </Text>
                                        </View>
                                        <View
                                            style={
                                                styles.tournament_date_wrapper
                                            }
                                        >
                                            <Text
                                                style={styles.tournament_date}
                                            >
                                                {moment(
                                                    tournament?.startDate
                                                ).format("DD MMM YYYY")}{" "}
                                                to{" "}
                                                {moment(
                                                    tournament?.endDate
                                                ).format("DD MMM YYYY")}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.not_found_wrapper}>
                                    <Text style={styles.not_found_text}>
                                        No Tournament found
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
        marginBottom: normalizeVertical(60)
    },
    section_wrapper: {
        marginVertical: normalizeVertical(8),
        zIndex: -1
    },
    create_new_tournament_btn: {
        backgroundColor: "#1A4DA1",
        marginTop: normalizeVertical(22),
        marginBottom: normalizeVertical(22),
        marginHorizontal: normalize(18),
        paddingHorizontal: normalize(5),
        paddingVertical: normalizeVertical(12),
        borderRadius: normalize(12)
    },
    create_new_tournament_btn_text: {
        fontSize: normalize(18),
        textAlign: "center",
        color: "white",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    },
    tournaments_wrapper: {
        gap: normalizeVertical(20),
        paddingBottom: normalizeVertical(30)
    },
    tournament: {
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
    other_tournament_info_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    tournament_info: {
        fontSize: normalize(18),
        color: "#1A4DA1",
        fontFamily: "robotoMedium",
        textAlign: "center",
        textTransform: "capitalize"
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
    tournament_date_wrapper: {
        alignItems: "center"
    },
    tournament_date: {
        fontSize: normalize(17),
        fontFamily: "robotoMedium"
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

export default TournamentsScreen;
