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
import { setFielder } from "../redux/matchSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import LoadingSpinner from "../components/LoadingSpinner.js";
import ScrollingText from "../components/ScrollingText";
import { getCurrentInning } from "../utils/matchUtils.js";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const SelectFielder = ({ navigation, route }) => {
    const [bowlingTeam, setBowlingTeam] = useState(null);
    const [currentBowler, setCurrentBowler] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    const dispatch = useDispatch();
    const { accessToken } = useSelector(state => state.auth);
    useEffect(() => {
        setIsScreenFocused(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const getMatchDetails = async () => {
                try {
                    const response = await fetch(
                        `${process.env.EXPO_PUBLIC_BASE_URL}/get-match-details/${route.params?.matchId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        }
                    );
                    const data = await response.json();

                    if (response.status === 200) {
                        const currentInning = getCurrentInning(data.data);

                        setCurrentBowler(currentInning.currentBowler);
                        setBowlingTeam(currentInning.bowlingTeam);
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

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            setIsLoading(true);
            setSelectedPlayer(null);
        });
        return unsubscribe;
    }, [navigation]);

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
        return [
            ...bowlingTeam?.playing11.filter(player => {
                return player._id !== currentBowler._id;
            }),
            ...bowlingTeam?.substitutes
        ];
    };

    const handleSelectPlayer = () => {
        dispatch(setFielder(selectedPlayer));
        console.log(route.params);
        if (route.params?.payload?.outMethod === "run out") {
            navigation.navigate("run-out-fielder-assign", {
                matchId: route.params?.matchId,
                payload: route.params?.payload
            });
        } else {
            navigation.navigate("caught-out-fielder-assign", {
                matchId: route.params?.matchId,
                payload: route.params?.payload
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
                <ScrollingText
                    text={`select fielder ( ${bowlingTeam?.name} )`}
                    style={styles.label}
                    fitWidth="85%"
                />
            </View>

            {!isLoading ? (
                <>
                    <FlatList
                        data={availablePlayers()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.player,

                                    selectedPlayer?._id === item._id &&
                                        styles.selected
                                ]}
                                onPress={() => setSelectedPlayer(item)}
                            >
                                <View style={styles.player_details}>
                                    <View style={styles.player_icon}>
                                        <Text style={styles.player_icon_text}>
                                            {item?.name[0]}
                                        </Text>
                                    </View>
                                    <View
                                        style={styles.other_player_info_wrapper}
                                    >
                                        <Text style={styles.player_name}>
                                            {ellipsize(
                                                item?.name,
                                                bowlingTeam?.substitutes.includes(
                                                    item
                                                )
                                                    ? 20
                                                    : 27
                                            )}
                                        </Text>
                                    </View>
                                </View>
                                {bowlingTeam?.substitutes.includes(item) && (
                                    <View style={styles.substitute_sign}>
                                        <Text
                                            style={styles.substitute_sign_text}
                                        >
                                            sub
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.choose_player_wrapper}
                    />
                    {selectedPlayer && (
                        <View style={styles.confirm_btn_wrapper}>
                            <TouchableOpacity
                                style={styles.confirm_btn}
                                onPress={handleSelectPlayer}
                            >
                                <Text style={styles.confirm_btn_text}>
                                    Continue
                                </Text>
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
        justifyContent: "space-between",
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
    substitute_sign_text: {
        fontSize: normalize(17),
        color: "#ad0c0c",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
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

export default SelectFielder;
