import { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    StatusBar
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../redux/toastSlice.js";
import { setTeamAPlaying11, setTeamBPlaying11 } from "../redux/matchSlice.js";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import ScrollingText from "../components/ScrollingText";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useHideTabBar } from "../utils/useHideTabBar.js";
import {
    useGetMatchDetailsQuery,
    useReplacePlayerMutation
} from "../services/matchApi.js";
import { useGetTeamDetailsQuery } from "../services/teamApi.js";

const SelectReplacementPlayer = ({ navigation, route }) => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    useHideTabBar(navigation, isScreenFocused);
    const dispatch = useDispatch();
    const { accessToken } = useSelector(state => state.auth);

    const { data: matchData, isLoading: isMatchLoading } =
        useGetMatchDetailsQuery(route.params?.matchId);

    const { data: teamData, isLoading: isTeamLoading } = useGetTeamDetailsQuery(
        route.params?.teamId
    );

    const [replacePlayer, { isLoading: isReplacing }] =
        useReplacePlayerMutation();

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    const teamDetails = teamData?.data || null;
    const playingTeamDetails = matchData?.data
        ? [matchData.data.teamA, matchData.data.teamB].find(
              t => t.teamId === route.params?.teamId
          )
        : null;

    const availablePlayers = () => {
        if (
            !teamDetails.players ||
            !playingTeamDetails.playing11 ||
            !playingTeamDetails.substitutes
        ) {
            return;
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

    const handleReplacePlayer = async () => {
        try {
            const { teamName, matchId, teamId, replacedPlayerId } =
                route.params;
            if (!selectedPlayer || !matchId || !teamId || !replacedPlayerId) {
                dispatch(
                    showToast({
                        type: "error",
                        message: "please provide all required field"
                    })
                );
                return;
            }

            await replacePlayer({
                matchId,
                teamId,
                replacedPlayerId,
                newPlayerId: selectedPlayer.playerId
            }).unwrap();
            navigation.goBack();
            setSelectedPlayer(null);
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message: error?.data?.message || error.message
                })
            );
        }
    };

    const teamName = route.params?.teamName;

    const headerText = teamName
        ? `select replacement player ( ${teamName} )`
        : "";

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
                            teamId: teamDetails?._id
                        })
                    }
                >
                    <Text style={styles.add_player_btn_text}>
                        add new player
                    </Text>
                </TouchableOpacity>
            </View>
            {!isMatchLoading && !isTeamLoading ? (
                <>
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
                                        {item?.name[0]}
                                    </Text>
                                </View>

                                <View style={styles.other_player_info_wrapper}>
                                    <Text style={styles.player_name}>
                                        {ellipsize(item?.name, 24)}
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
                                {!isReplacing ? (
                                    <Text style={styles.confirm_btn_text}>
                                        Confirm
                                    </Text>
                                ) : (
                                    <Spinner
                                        isLoading={true}
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
        width: normalize(61),
        borderRadius: normalize(62 / 2),
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
