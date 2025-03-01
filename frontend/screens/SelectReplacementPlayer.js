import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    StatusBar
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import { showToast } from "../redux/toastSlice.js";

import { setTeamAPlaying11, setTeamBPlaying11 } from "../redux/matchSlice.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const SelectReplacementPlayer = ({ navigation, route }) => {
    const [teamDetails, setTeamDetails] = useState([]);
    const [playingTeamDetails, setPlayingTeamDetails] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
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
                        const team = [
                            matchData.data.teamA,
                            matchData.data.teamB
                        ].find(team => team.teamId === route.params?.teamId);
                        setPlayingTeamDetails(team);

                        // Fetch squad details
                        const teamResponse = await fetch(
                            `${process.env.EXPO_PUBLIC_BASE_URL}/get-single-team/${route.params?.teamId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`
                                }
                            }
                        );
                        const teamData = await teamResponse.json();

                        if (teamResponse.status === 200) {
                            setTeamDetails(teamData.data);
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

    const availablePlayers = () => {
        if (
            !teamDetails.players ||
            !playingTeamDetails.playing11 ||
            !playingTeamDetails.substitutes
        ) {
            return [];
        }

        return teamDetails?.players.filter(
            player =>
                !playingTeamDetails?.playing11.some(
                    p => p.playerId === player.playerId
                ) &&
                !playingTeamDetails?.substitutes.some(
                    p => p.playerId === player.playerId
                )
        );
    };

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

    const handleReplacePlayer = async () => {
        try {
            setShowSpinner(true);
            const { matchId, teamId, replacedPlayerId } = route.params;
            if (!selectedPlayer || !matchId || !teamId || !replacedPlayerId) {
                dispatch(
                    showToast({
                        type: "error",
                        message: "please provide all required field"
                    })
                );
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/replace-player/${matchId}`,

                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        teamId,
                        replacedPlayerId,
                        newPlayerId: selectedPlayer.playerId
                    })
                }
            );

            const data = await response.json();

            if (response.status !== 200) {
                dispatch(showToast({ type: "error", message: data.message }));
            } else {
                navigation.navigate("change-squad", { matchId, teamId });
                setSelectedPlayer(null);
            }
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message: "unexpected error occured, try again latter"
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
                <Text style={styles.label}>select replacement player</Text>
            </View>
            <View style={styles.add_player_btn_wrapper}>
                <TouchableOpacity
                    style={styles.add_player_btn}
                    onPress={() =>
                        navigation.navigate("add-players", {
                            teamId: teamDetails._id
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
                    <View style={styles.heading_wrapper}>
                        <Text style={styles.heading}>
                            Team : {playingTeamDetails?.name}
                        </Text>
                    </View>
                    <FlatList
                        data={availablePlayers()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.player,

                                    selectedPlayer?.playerId ===
                                        item.playerId && styles.selected
                                ]}
                                onPress={() => setSelectedPlayer(item)}
                            >
                                <View style={styles.player_icon}>
                                    <Text style={styles.player_icon_text}>
                                        {item.name[0]}
                                    </Text>
                                </View>

                                <View style={styles.other_player_info_wrapper}>
                                    <Text style={styles.player_name}>
                                        {item.name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.choose_players_wrapper}
                    />

                    {selectedPlayer && (
                        <View style={styles.confirm_btn_wrapper}>
                            <TouchableOpacity
                                style={styles.confirm_btn}
                                onPress={handleReplacePlayer}
                            >
                                {!showSpinner ? (
                                    <Text style={styles.confirm_btn_text}>
                                        Confirm
                                    </Text>
                                ) : (
                                    <Spinner
                                        isLoading={showSpinner}
                                        label="progressing..."
                                        spinnerColor="white"
                                        labelColor="white"
                                        labelSize={19}
                                        spinnerSize={28}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
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
    heading_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: normalize(18),
        marginTop: normalizeVertical(25)
    },
    heading: {
        fontSize: normalize(20),
        color: "black",
        fontFamily: "robotoMedium"
    },
    add_player_btn: {
        backgroundColor: "#1A4DA1",
        marginTop: normalizeVertical(25),
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
    choose_players_wrapper: {
        gap: normalizeVertical(22),
        paddingTop: normalizeVertical(24),
        paddingBottom: normalizeVertical(82)
    },
    player: {
        width: "90%",
        flexDirection: "row",
        gap: normalize(18),
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
    confirm_btn_wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0
    },
    confirm_btn: {
        backgroundColor: "#14B391",
        height: normalizeVertical(60),
        justifyContent: "center",
        alignItems: "center"
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

export default SelectReplacementPlayer;
