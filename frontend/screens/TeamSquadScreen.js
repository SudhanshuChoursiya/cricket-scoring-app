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
import { setTeamAPlaying11, setTeamBPlaying11 } from "../redux/matchSlice.js";

import { normalize, normalizeVertical } from "../utils/responsive.js";
const TeamSquadScreen = ({ navigation, route }) => {
    const [teamDetails, setTeamDetails] = useState([]);
    const [teamPlaying11, setTeamPlaying11] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();
    const selectedTeamDetails = useSelector(state => state.match);

    console.log(JSON.stringify(selectedTeamDetails));
    useEffect(() => {
        setIsScreenFocused(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const getTeamDetails = async () => {
                try {
                    const response = await fetch(
                        `${process.env.EXPO_PUBLIC_BASE_URL}/get-single-team/${route.params.teamId}`
                    );
                    const data = await response.json();

                    if (response.status === 200) {
                        setTeamDetails(data.data);
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            };
            getTeamDetails();
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

    const handlePlayerSelect = selectedPlayer => {
        const isSelected = teamPlaying11.some(
            player => player.playerId === selectedPlayer.playerId
        );

        if (isSelected) {
            setTeamPlaying11(
                teamPlaying11.filter(
                    player => player.playerId !== selectedPlayer.playerId
                )
            );
        } else {
            if (teamPlaying11.length < 11) {
                setTeamPlaying11([...teamPlaying11, selectedPlayer]);
            }
        }
    };

    const HandleSelectSquad = () => {
        if (route.params?.selectFor === "team A") {
            dispatch(setTeamAPlaying11(teamPlaying11));
        }

        if (route.params?.selectFor === "team B") {
            dispatch(setTeamBPlaying11(teamPlaying11));
        }

        navigation.navigate("select-teams");
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
                <Text style={styles.label}>select playing 11</Text>
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

            <View style={styles.squad_count_wrapper}>
                <Text style={styles.squad_count}>
                    squad ({teamDetails.players?.length})
                </Text>
            </View>
            <FlatList
                data={teamDetails.players}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.player,
                            teamPlaying11.some(
                                player => player.playerId === item.playerId
                            ) && styles.selected
                        ]}
                        onPress={() => handlePlayerSelect(item)}
                    >
                        <View style={styles.player_icon}>
                            <Text style={styles.player_icon_text}>
                                {item.name[0]}
                            </Text>
                        </View>

                        <View style={styles.other_player_info_wrapper}>
                            <Text style={styles.player_name}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.choose_players_wrapper}
            />
            {teamPlaying11.length === 11 && (
                <View style={styles.confirm_squad_btn_wrapper}>
                    <TouchableOpacity
                        style={styles.confirm_squad_btn}
                        onPress={HandleSelectSquad}
                    >
                        <Text style={styles.confirm_squad_btn_text}>
                            confirm playing 11
                        </Text>
                    </TouchableOpacity>
                </View>
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
        gap: normalize(45),
        paddingHorizontal: normalize(20)
    },
    label: {
        fontSize: normalize(20),
        color: "white",
        paddingHorizontal: normalize(13),
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    },
    squad_count_wrapper: {
        marginHorizontal: normalize(18)
    },
    squad_count: {
        fontSize: normalize(20),
        color: "#474646",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
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
    choose_players_wrapper: {
        gap: normalizeVertical(22),
        paddingVertical: normalizeVertical(28)
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
    confirm_squad_btn_wrapper: {
        position: "fixed",
        bottom: 0,
        lef: 0,
        right: 0
    },
    confirm_squad_btn: {
        backgroundColor: "#14B391",
        paddingVertical: normalizeVertical(18)
    },
    confirm_squad_btn_text: {
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

export default TeamSquadScreen;
