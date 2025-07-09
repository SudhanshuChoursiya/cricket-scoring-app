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
import { setTeamACaptain, setTeamBCaptain } from "../redux/matchSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import LoadingSpinner from "../components/LoadingSpinner.js";
import Spinner from "../components/Spinner.js";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const SelectCaptain = ({ navigation, route }) => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isScreenFocused, setIsScreenFocused] = useState(false);

    const dispatch = useDispatch();
    const { teamA, teamB } = useSelector(state => state.match);
    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
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

    const availablePlayers = () => {
        if (route.params?.selectFor === "team A") {
            return teamA.playing11;
        } else {
            return teamB.playing11;
        }
    };

    const HandleSelectCaptain = () => {
        if (route.params?.selectFor === "team A") {
            dispatch(
                setTeamACaptain({
                    name: selectedPlayer?.name,
                    captainId: selectedPlayer?.playerId
                })
            );
        }

        if (route.params?.selectFor === "team B") {
            dispatch(
                setTeamBCaptain({
                    name: selectedPlayer?.name,
                    captainId: selectedPlayer?.playerId
                })
            );
        }

        navigation.navigate("select-teams");
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            setSelectedPlayer(null);
            if (route.params?.selectFor === "team A") {
                dispatch(setTeamACaptain(null));
            }
            if (route.params?.selectFor === "team B") {
                dispatch(setTeamBCaptain(null));
            }
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
                    select {route.params?.selectFor} captain
                </Text>
            </View>

            {!isLoading ? (
                <>
                    <FlatList
                        data={availablePlayers()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.player,

                                    selectedPlayer === item && styles.selected
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
                                        {ellipsize(item?.name,27)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => index}
                        contentContainerStyle={styles.choose_player_wrapper}
                    />
                    {selectedPlayer && (
                        <View style={styles.confirm_btn_wrapper}>
                            <TouchableOpacity
                                style={styles.confirm_btn}
                                onPress={HandleSelectCaptain}
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
        borderRadius: normalize(30),
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

export default SelectCaptain;
