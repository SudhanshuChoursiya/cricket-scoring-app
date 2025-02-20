import {
    StyleSheet,
    Text,
    View,
    Pressable,
    TouchableOpacity,
    StatusBar,
    ScrollView
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { showToast } from "../redux/toastSlice.js";
import { setChangeCaptainModal, setConfirmModal } from "../redux/modalSlice.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import ChangeCaptainModal from "../components/ChangeCaptainModal.js";
import ConfirmModal from "../components/ConfirmModal.js";
import { io } from "socket.io-client";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const ChangeSquadScreen = ({ navigation, route }) => {
    const [matchDetails, setMatchDetails] = useState(null);
    const [teamDetails, setTeamDetails] = useState(null);
    const [substitutes, setSubstitutes] = useState([]);
    const [restOfSquad, setRestOfSquad] = useState([]);
    const [player, setPlayer] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);

    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();
    const { confirmModal } = useSelector(state => state.modal);

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
                        setSubstitutes(team.substitutes);

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
                            const playing11Ids = team.playing11.map(
                                player => player.playerId
                            );
                            const substituteIds = team.substitutes.map(
                                player => player.playerId
                            );

                            setRestOfSquad(
                                squadData.data.players.filter(
                                    player =>
                                        !playing11Ids.includes(
                                            player.playerId
                                        ) &&
                                        !substituteIds.includes(player.playerId)
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

    useEffect(() => {
        const socket = io(`${process.env.EXPO_PUBLIC_BASE_URL}`);
        socket.on("scoreUpdated", ({ match, squadDetails }) => {
            setMatchDetails(match);
            const team = [match.teamA, match.teamB].find(
                team => team.teamId === route.params?.teamId
            );
            setTeamDetails(team);
            setSubstitutes(team.substitutes);
            const playing11Ids = team.playing11.map(player => player.playerId);
            const substituteIds = team.substitutes.map(
                player => player.playerId
            );

            setRestOfSquad(
                squadDetails?.players.filter(
                    player =>
                        !playing11Ids.includes(player.playerId) &&
                        !substituteIds.includes(player.playerId)
                )
            );
        });

        return () => {
            socket.disconnect();
        };
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

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            setIsLoading(true);
            setPlayer(null);
            dispatch(
                setConfirmModal({
                    isShow: false,
                    actionType: null,
                    title: null,
                    description: null
                })
            );
        });
        return unsubscribe;
    }, [navigation]);

    const handleOpenChangeCaptainModal = player => {
        setPlayer(player);
        dispatch(setChangeCaptainModal({ isShow: true }));
    };
    const handleOpenConfirmModal = ({
        actionType,
        title,
        description,
        player
    }) => {
        setPlayer(player);
        dispatch(
            setConfirmModal({ isShow: true, actionType, title, description })
        );
    };

    const handleAddSubstitute = async () => {
        try {
            setShowSpinner(true);
            if (
                !matchDetails?._id ||
                !teamDetails?.teamId ||
                !player.playerId
            ) {
                dispatch(showToast("please provide all required field"));
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/add-substitutes/${matchDetails?._id}`,

                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        teamId: teamDetails?.teamId,
                        playerId: player.playerId
                    })
                }
            );

            const data = await response.json();

            if (response.status !== 200) {
                dispatch(showToast(data.message));
            } else {
                dispatch(
                    setConfirmModal({
                        isShow: false,
                        actionType: null,
                        title: null,
                        description: null
                    })
                );
            }
        } catch (error) {
            console.log(error);
            dispatch(showToast("unexpected error occured, try again latter"));
        } finally {
            setShowSpinner(false);
        }
    };

    const handleRemoveSubstitute = async () => {
        try {
            setShowSpinner(true);

            if (
                !matchDetails?._id ||
                !teamDetails?.teamId ||
                !player.playerId
            ) {
                dispatch(showToast("please provide all required field"));
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/remove-substitutes/${matchDetails?._id}`,

                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        teamId: teamDetails?.teamId,
                        playerId: player.playerId
                    })
                }
            );

            const data = await response.json();

            if (response.status !== 200) {
                dispatch(showToast(data.message));
            } else {
                dispatch(
                    setConfirmModal({
                        isShow: false,
                        actionType: null,
                        title: null,
                        description: null
                    })
                );
            }
        } catch (error) {
            console.log(error);
            dispatch(showToast("unexpected error occured, try again latter"));
        } finally {
            setShowSpinner(false);
        }
    };

    const handleConfirmModal = () => {
        if (confirmModal.actionType === "REPLACE") {
            navigation.navigate("select-replacement-player", {
                matchId: route.params?.matchId,
                teamId: route.params?.teamId,
                replacedPlayerId: player.playerId
            });
            dispatch(
                setConfirmModal({
                    isShow: false,
                    actionType: null,
                    title: null,
                    description: null,
                    player: null
                })
            );
        } else if (confirmModal.actionType === "ADD") {
            handleAddSubstitute();
        } else if (confirmModal.actionType === "REMOVE") {
            handleRemoveSubstitute();
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
                                    <Pressable
                                        style={styles.player}
                                        key={item._id}
                                        onPress={() =>
                                            handleOpenChangeCaptainModal(item)
                                        }
                                    >
                                        <View style={styles.player_details}>
                                            <View style={styles.player_icon}>
                                                <Text
                                                    style={
                                                        styles.player_icon_text
                                                    }
                                                >
                                                    {item.name[0]}
                                                </Text>
                                                {teamDetails?.captain
                                                    .captainId ===
                                                    item.playerId && (
                                                    <View
                                                        style={
                                                            styles.captain_icon_wrapper
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.captain_icon
                                                            }
                                                        >
                                                            C
                                                        </Text>
                                                    </View>
                                                )}
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
                                        {teamDetails?.captain.captainId !==
                                            item.playerId && (
                                            <TouchableOpacity
                                                style={styles.replace_btn}
                                                onPress={() =>
                                                    handleOpenConfirmModal({
                                                        actionType: "REPLACE",
                                                        title: "Replace player",
                                                        description: `Are you sure to replace ${item.name}?`,
                                                        player: item
                                                    })
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.replace_btn_text
                                                    }
                                                >
                                                    replace
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {substitutes?.length > 0 && (
                            <View style={styles.substitutes_wrapper}>
                                <Text style={styles.heading}>Substitutes</Text>
                                <View style={styles.players_wrapper}>
                                    {substitutes?.map(item => (
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
                                                style={styles.remove_btn}
                                                onPress={() =>
                                                    handleOpenConfirmModal({
                                                        actionType: "REMOVE",
                                                        title: "Remove player",
                                                        description: `Are you sure to remove ${item.name} from substitutes ?`,
                                                        player: item
                                                    })
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.remove_btn_text
                                                    }
                                                >
                                                    remove
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

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
                                                    onPress={() =>
                                                        handleOpenConfirmModal({
                                                            actionType: "ADD",
                                                            title: "Add player",
                                                            description: `Are you sure to add ${item.name} in substitutes ?`,
                                                            player: item
                                                        })
                                                    }
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
                    <ChangeCaptainModal
                        matchId={matchDetails?._id}
                        teamId={teamDetails?.teamId}
                        player={player}
                        showSpinner={showSpinner}
                        setShowSpinner={setShowSpinner}
                    />
                    <ConfirmModal
                        showSpinner={showSpinner}
                        player={player}
                        handleConfirm={handleConfirmModal}
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
    substitutes_wrapper: {
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
        borderRadius: normalize(30),
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        elevation: 1
    },
    player_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    captain_icon_wrapper: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#4d4d4d",
        height: normalize(24),
        width: normalize(24),
        borderRadius: normalize(12),
        position: "absolute",
        bottom: 0,
        right: 0,
        elevation: 1
    },
    captain_icon: {
        fontSize: normalize(14),
        color: "white",
        fontFamily: "robotoBold"
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
    remove_btn: {
        backgroundColor: "#f5f5f5",
        paddingVertical: normalizeVertical(8),
        width: normalize(80),
        borderRadius: normalize(8),
        elevation: 1
    },
    remove_btn_text: {
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
