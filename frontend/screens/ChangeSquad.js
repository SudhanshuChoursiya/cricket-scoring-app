import { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    TouchableOpacity,
    StatusBar,
    ScrollView
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../redux/toastSlice.js";
import { openModal, closeModal } from "../redux/modalSlice.js";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import LoadingSpinner from "../components/LoadingSpinner.js";
import ScrollingText from "../components/ScrollingText.js";
import ChangeCaptainModal from "../components/ChangeCaptainModal.js";
import ConfirmModal from "../components/ConfirmModal.js";
import { io } from "socket.io-client";
import socket from "../services/socket.js";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useHideTabBar } from "../utils/useHideTabBar.js";
import {
    useGetMatchDetailsQuery,
    useAddSubstituteMutation,
    useRemoveSubstituteMutation
} from "../services/matchApi.js";
import { useGetTeamDetailsQuery } from "../services/teamApi.js";

const ChangeSquadScreen = ({ navigation, route }) => {
    const [matchDetails, setMatchDetails] = useState(null);
    const [teamDetails, setTeamDetails] = useState(null);
    const [playingTeamDetails, setPlayingTeamDetails] = useState(null);
    const [substitutes, setSubstitutes] = useState([]);
    const [restOfSquad, setRestOfSquad] = useState([]);
    const [player, setPlayer] = useState(null);
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    useHideTabBar(navigation, isScreenFocused);

    const { accessToken } = useSelector(state => state.auth);

    const { payload } = useSelector(state => state.modal);

    const dispatch = useDispatch();

    const { data: matchData, isLoading: isMatchLoading } =
        useGetMatchDetailsQuery(route.params?.matchId);

    const { data: teamData, isLoading: isTeamLoading } = useGetTeamDetailsQuery(
        route.params?.teamId
    );

    const [addSubstitute, { isLoading: isAdding }] = useAddSubstituteMutation();
    const [removeSubstitute, { isLoading: isRemoving }] =
        useRemoveSubstituteMutation();

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    useEffect(() => {
        if (matchData?.data && teamData?.data) {
            setMatchDetails(matchData?.data);
            setTeamDetails(teamData?.data);

            const team = [matchData?.data?.teamA, matchData?.data?.teamB].find(
                t => t.teamId === route.params?.teamId
            );
            setPlayingTeamDetails(team);
            setSubstitutes(team.substitutes || []);

            const playing11Ids = team.playing11.map(p => p.playerId);
            const substituteIds = team.substitutes.map(p => p.playerId);

            setRestOfSquad(
                teamData?.data?.players.filter(
                    p =>
                        !playing11Ids.includes(p.playerId) &&
                        !substituteIds.includes(p.playerId)
                )
            );
        }
    }, [matchData, teamData]);

    useEffect(() => {
        if (!matchDetails?._id) return;

        if (!socket.connected) socket.connect();

        // Join match room
        const joinRoom = () => {
            socket.emit("joinMatch", matchDetails._id);
        };

        const handleScoreUpdated = ({ match, squadDetails }) => {
            setMatchDetails(match);
            setTeamDetails(squadDetails);
            const team = [match.teamA, match.teamB].find(
                t => t.teamId === route.params?.teamId
            );

            if (!team) return;

            setPlayingTeamDetails(team);
            setSubstitutes(team.substitutes || []);

            const playing11Ids = team.playing11.map(p => p.playerId);
            const substituteIds = team.substitutes.map(p => p.playerId);

            setRestOfSquad(
                squadDetails?.players.filter(
                    p =>
                        !playing11Ids.includes(p.playerId) &&
                        !substituteIds.includes(p.playerId)
                )
            );
        };

        // Register socket listeners
        socket.on("connect", joinRoom);
        socket.on("reconnect", joinRoom);
        socket.on("scoreUpdated", handleScoreUpdated);

        // Cleanup
        return () => {
            if (matchDetails?._id) socket.emit("leaveMatch", matchDetails._id);

            socket.off("connect", joinRoom);
            socket.off("reconnect", joinRoom);
            socket.off("scoreUpdated", handleScoreUpdated);

            socket.disconnect();
        };
    }, [matchDetails?._id]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            setPlayer(null);
            dispatch(closeModal());
        });
        return unsubscribe;
    }, [navigation]);

    const handleOpenChangeCaptainModal = player => {
        setPlayer(player);
        dispatch(openModal({ type: "changeCaptain" }));
    };

    const handleOpenConfirmModal = ({
        actionType,
        title,
        description,
        player
    }) => {
        setPlayer(player);
        dispatch(
            openModal({
                type: "confirm",
                payload: { actionType, title, description }
            })
        );
    };

    const handleAddSubstitute = async () => {
        if (
            !matchDetails?._id ||
            !playingTeamDetails?.teamId ||
            !player?.playerId
        ) {
            dispatch(
                showToast({
                    type: "error",
                    message: "Please provide all required fields"
                })
            );
            return;
        }
        try {
            await addSubstitute({
                matchId: matchDetails._id,
                teamId: playingTeamDetails.teamId,
                playerId: player.playerId
            }).unwrap();
            dispatch(closeModal());
        } catch (err) {
            dispatch(
                showToast({
                    type: "error",
                    message: err?.data?.message || "Unexpected error occurred"
                })
            );
        }
    };

    const handleRemoveSubstitute = async () => {
        if (
            !matchDetails?._id ||
            !playingTeamDetails?.teamId ||
            !player?.playerId
        ) {
            dispatch(
                showToast({
                    type: "error",
                    message: "Please provide all required fields"
                })
            );
            return;
        }
        try {
            await removeSubstitute({
                matchId: matchDetails._id,
                teamId: playingTeamDetails.teamId,
                playerId: player.playerId
            }).unwrap();
            dispatch(closeModal());
        } catch (err) {
            dispatch(
                showToast({
                    type: "error",
                    message: err?.data?.message || "Unexpected error occurred"
                })
            );
        }
    };

    const handleConfirmModal = () => {
        if (payload.actionType === "REPLACE") {
            navigation.navigate("select-replacement-player", {
                teamName: route.params?.teamName,
                matchId: route.params?.matchId,
                teamId: route.params?.teamId,
                replacedPlayerId: player.playerId
            });
            dispatch(closeModal());
        } else if (payload.actionType === "ADD") {
            handleAddSubstitute();
        } else if (payload.actionType === "REMOVE") {
            handleRemoveSubstitute();
        }
    };

    const teamName = route.params?.teamName;
    const headerText = teamName ? `Change ${teamName} squad` : "";

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
                <ScrollingText
                    text={headerText}
                    style={styles.label}
                    fitWidth="85%"
                />
            </View>
            <View style={styles.add_player_btn_wrapper}>
                <TouchableOpacity
                    style={styles.add_player_btn}
                    onPress={() =>
                        navigation.navigate("add-players", {
                            teamId: playingTeamDetails?.teamId
                        })
                    }
                >
                    <Text style={styles.add_player_btn_text}>
                        add new player
                    </Text>
                </TouchableOpacity>
            </View>
            {!isMatchLoading && !isTeamLoading && playingTeamDetails ? (
                <>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.playing11_wrapper}>
                            <Text style={styles.heading}>Playing 11</Text>
                            <View style={styles.players_wrapper}>
                                {playingTeamDetails?.playing11?.map(item => (
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
                                                    {item?.name[0]}
                                                </Text>
                                                {playingTeamDetails?.captain
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
                                                    {ellipsize(item?.name, 24)}
                                                </Text>
                                            </View>
                                        </View>
                                        {playingTeamDetails?.captain
                                            .captainId !== item.playerId && (
                                            <TouchableOpacity
                                                style={styles.replace_btn}
                                                onPress={() =>
                                                    handleOpenConfirmModal({
                                                        actionType: "REPLACE",
                                                        title: "Replace player",
                                                        description: `Are you sure to replace ${ellipsize(
                                                            item.name,
                                                            24
                                                        )}`,
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
                                                        {item?.name[0]}
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
                                                        {ellipsize(
                                                            item?.name,
                                                            24
                                                        )}
                                                    </Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.remove_btn}
                                                onPress={() =>
                                                    handleOpenConfirmModal({
                                                        actionType: "REMOVE",
                                                        title: "Remove player",
                                                        description: `Are you sure to remove ${ellipsize(
                                                            item.name,
                                                            24
                                                        )} from substitutes ?`,
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
                                                        {item?.name[0]}
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
                                                        {ellipsize(
                                                            item?.name,
                                                            24
                                                        )}
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
                                                            description: `Are you sure to add ${ellipsize(
                                                                item.name,
                                                                24
                                                            )} in substitutes ?`,
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
                        teamId={playingTeamDetails?.teamId}
                        player={player}
                    />
                    <ConfirmModal
                        showSpinner={isAdding || isRemoving}
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
        paddingTop: normalizeVertical(38),
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
    other_player_info_wrapper: {
        maxWidth: normalize(165)
    },
    player_icon: {
        backgroundColor: "#f75454",
        height: normalize(60),
        width: normalize(61),
        borderRadius: normalize(62 / 2),
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
