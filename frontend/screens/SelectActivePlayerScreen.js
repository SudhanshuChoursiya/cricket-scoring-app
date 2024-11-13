import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    StatusBar,
    FlatList
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
    setStrikeBatsman,
    setNonStrikeBatsman,
    setCurrentBowler
} from "../redux/matchSlice.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const SelectActivePlayerScreen = ({ navigation, route }) => {
    const [battingTeam, setBattingTeam] = useState(null);
    const [bowlingTeam, setBowlingTeam] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    const dispatch = useDispatch();
    const { strikeBatsman, nonStrikeBatsman, currentBowler } = useSelector(
        state => state.match
    );

    useEffect(() => {
        setIsScreenFocused(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const getMatchDetails = async () => {
                try {
                    const response = await fetch(
                        `${process.env.EXPO_PUBLIC_BASE_URL}/get-match-details/${route.params?.matchId}`
                    );
                    const data = await response.json();

                    if (response.status === 200) {
                        if (data.data.currentInning === 1) {
                            setBattingTeam(data.data.inning1.battingTeam);
                            setBowlingTeam(data.data.inning1.bowlingTeam);
                        } else {
                            setBattingTeam(data.data.inning2.battingTeam);
                            setBowlingTeam(data.data.inning2.bowlingTeam);
                        }
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            };
            getMatchDetails();
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

    const availablePlayers = () => {
        if (route.params?.selectFor === "strike batsman") {
            return battingTeam?.playing11.filter(
                player => player._id !== nonStrikeBatsman?.playerId
            );
        }

        if (route.params?.selectFor === "non strike batsman") {
            return battingTeam?.playing11.filter(
                player => player._id !== strikeBatsman?.playerId
            );
        }

        if (route.params?.selectFor === "current bowler") {
            return bowlingTeam?.playing11;
        }
        return [];
    };

    const HandleSelectPlayer = () => {
        if (route.params?.selectFor === "strike batsman") {
            dispatch(setStrikeBatsman(selectedPlayer));
            navigation.navigate("player-assignment-screen", {
                matchId: route.params?.matchId
            });
        }

        if (route.params?.selectFor === "non strike batsman") {
            dispatch(setNonStrikeBatsman(selectedPlayer));
            navigation.navigate("player-assignment-screen", {
                matchId: route.params?.matchId
            });
        }

        if (route.params?.selectFor === "current bowler") {
            dispatch(setCurrentBowler(selectedPlayer));
            navigation.navigate("player-assignment-screen", {
                matchId: route.params?.matchId
            });
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
                    select {route.params?.selectFor}
                </Text>
            </View>
            <View style={styles.team_name_wrapper}>
                <Text style={styles.team_name}>
                    team:{" "}
                    {route.params?.selectFor === "strike batsman" ||
                    route.params?.selectFor === "non strike batsman"
                        ? battingTeam?.name
                        : bowlingTeam?.name}
                </Text>
            </View>
            <FlatList
                data={availablePlayers()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.player,

                            selectedPlayer?._id === item._id && styles.selected
                        ]}
                        onPress={() => setSelectedPlayer(item)}
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
                contentContainerStyle={styles.choose_player_wrapper}
            />
            {selectedPlayer && (
                <View style={styles.confirm_squad_btn_wrapper}>
                    <TouchableOpacity
                        style={styles.confirm_squad_btn}
                        onPress={HandleSelectPlayer}
                    >
                        <Text style={styles.confirm_squad_btn_text}>
                            continue
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
        gap: normalize(40),
        paddingHorizontal: normalize(20)
    },
    label: {
        fontSize: normalize(20),
        color: "white",

        textTransform: "capitalize",
        fontFamily: "robotoBold"
    },
    team_name_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: normalize(18),
        marginTop: normalizeVertical(35)
    },
    team_name: {
        fontSize: normalize(20),
        color: "#474646",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    },
    choose_player_wrapper: {
        gap: normalizeVertical(22),
        paddingTop: normalizeVertical(35),
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
    confirm_squad_btn_wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
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

export default SelectActivePlayerScreen;
