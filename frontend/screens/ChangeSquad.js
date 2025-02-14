import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ScrollView
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import AlertToast from "../components/AlertToast.js";
import { setTeamAPlaying11, setTeamBPlaying11 } from "../redux/matchSlice.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const ChangeSquadScreen = ({ navigation, route }) => {
    const [matchDetails, setMatchDetails] = useState([]);
    const [teamDetails, setTeamDetails] = useState([]);
    const [restOfSquad, setRestOfSquad] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();
    const { accessToken } = useSelector(state => state.auth);

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const fetchDetails = async () => {
                setIsLoading(true);
                try {
                    // Fetch match details
                    const matchResponse = await fetch(
                        `${process.env.EXPO_PUBLIC_BASE_URL}/get-match-details/${route.params?.matchId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        }
                    );
                    const matchData = await matchResponse.json();

                    if (matchResponse.status === 200) {
                        setMatchDetails(matchData.data);

                        const team = [
                            matchData.data.teamA,
                            matchData.data.teamB
                        ].find(team => team.teamId === route.params?.teamId);
                        setTeamDetails(team);

                        // Fetch squad details
                        const squadResponse = await fetch(
                            `${process.env.EXPO_PUBLIC_BASE_URL}/get-single-team/${route.params?.teamId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`
                                }
                            }
                        );
                        const squadData = await squadResponse.json();

                        if (squadResponse.status === 200) {
                            setRestOfSquad(
                                squadData.data.players.filter(
                                    player =>
                                        !team.playing11.some(
                                            selectedPlayer =>
                                                player.playerId ===
                                                selectedPlayer.playerId
                                        )
                                )
                            );
                        }
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchDetails();
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

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            setIsLoading(true);
        });
        return unsubscribe;
    }, [navigation]);

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
                    change {teamDetails?.name} squad
                </Text>
            </View>
            <View style={styles.add_player_btn_wrapper}>
                <TouchableOpacity
                    style={styles.add_player_btn}
                    onPress={() =>
                        navigation.navigate("add-players", {
                            teamId: teamDetails?.teamId
                        })
                    }
                >
                    <Text style={styles.add_player_btn_text}>
                        add new player
                    </Text>
                </TouchableOpacity>
            </View>
            {!isLoading ? (
                <>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.playing11_wrapper}>
                            <Text style={styles.heading}>Playing 11</Text>
                            <View style={styles.players_wrapper}>
                                {teamDetails?.playing11?.map(item => (
                                    <View style={styles.player} key={item._id}>
                                        <View style={styles.player_details}>
                                            <View style={styles.player_icon}>
                                                <Text
                                                    style={
                                                        styles.player_icon_text
                                                    }
                                                >
                                                    {item.name[0]}
                                                </Text>
                                            </View>

                                            <View
                                                style={
                                                    styles.other_player_info_wrapper
                                                }
                                            >
                                                <Text
                                                    style={styles.player_name}
                                                >
                                                    {item.name}
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.replace_btn}
                                            onPress={() =>
                                                navigation.navigate(
                                                    "select-replacement-player",
                                                    {
                                                        matchId:
                                                            route.params
                                                                ?.matchId,
                                                        teamId: route.params
                                                            ?.teamId,
                                                        replacedPlayerId:
                                                            item.playerId
                                                    }
                                                )
                                            }
                                        >
                                            <Text
                                                style={styles.replace_btn_text}
                                            >
                                                replace
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                        {restOfSquad?.length > 0 && (
                            <View style={styles.rest_team_wrapper}>
                                <Text style={styles.heading}>
                                    Rest of the team
                                </Text>
                                <View style={styles.players_wrapper}>
                                    {restOfSquad?.map(item => (
                                        <View
                                            style={styles.player}
                                            key={item._id}
                                        >
                                            <View style={styles.player_details}>
                                                <View
                                                    style={styles.player_icon}
                                                >
                                                    <Text
                                                        style={
                                                            styles.player_icon_text
                                                        }
                                                    >
                                                        {item.name[0]}
                                                    </Text>
                                                </View>

                                                <View
                                                    style={
                                                        styles.other_player_info_wrapper
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.player_name
                                                        }
                                                    >
                                                        {item.name}
                                                    </Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.add_btn}
                                            >
                                                <Text
                                                    style={styles.add_btn_text}
                                                >
                                                    add
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </>
            ) : (
                <LoadingSpinner />
            )}
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
        backgroundColor: "#FFFFFF",
        width: "100%"
    },
    header: {
        paddingTop: normalizeVertical(50),
        paddingBottom: normalizeVertical(20),
        backgroundColor: "#E21F26",
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(15),
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
    add_player_btn: {
        backgroundColor: "#1A4DA1",
        marginVertical: normalizeVertical(25),
        marginHorizontal: normalize(18),
        paddingHorizontal: normalize(5),
        paddingVertical: normalizeVertical(14),
        borderRadius: normalize(12)
    },
    add_player_btn_text: {
        fontSize: normalize(18),
        textAlign: "center",
        color: "white",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    },
    playing11_wrapper: {
        marginHorizontal: normalize(20)
    },
    rest_team_wrapper: {
        marginHorizontal: normalize(20)
    },
    players_wrapper: {
        gap: normalizeVertical(22),
        paddingTop: normalizeVertical(25),
        paddingBottom: normalizeVertical(55)
    },
    player: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        marginHorizontal: "auto",
        paddingHorizontal: normalize(10),
        paddingVertical: normalizeVertical(10),
        borderRadius: normalize(8),
        elevation: 2,
        borderWidth: 2,
        borderColor: "white"
    },
    player_details: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(18)
    },
    player_icon: {
        backgroundColor: "#f75454",
        height: normalize(60),
        width: normalize(60),
        borderRadius: normalize(100),
        justifyContent: "center",
        alignItems: "center",
        elevation: 1
    },
    player_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    player_name: {
        fontSize: normalize(18),
        color: "#474646",
        textTransform: "capitalize",
        fontFamily: "ubuntuMedium"
    },
    replace_btn: {
        backgroundColor: "#f5f5f5",

        paddingVertical: normalizeVertical(8),
        width: normalize(80),
        borderRadius: normalize(8),
        elevation: 1
    },
    replace_btn_text: {
        color: "#676767",
        fontSize: normalize(14),
        fontFamily: "robotoMedium",
        textTransform: "uppercase",
        textAlign: "center"
    },
    add_btn: {
        backgroundColor: "#14B492",
        paddingVertical: normalizeVertical(8),
        width: normalize(80),
        borderRadius: normalize(8),
        elevation: 1
    },
    add_btn_text: {
        color: "white",
        fontSize: normalize(14),
        fontFamily: "robotoMedium",
        textTransform: "uppercase",
        textAlign: "center"
    }
});

export default ChangeSquadScreen;
