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
    setTeamAId,
    setTeamBId,
    setTeamAName,
    setTeamBName
} from "../redux/matchSlice.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const ChooseTeamScreen = ({ navigation, route }) => {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    const dispatch = useDispatch();
    const { accessToken } = useSelector(state => state.auth);

    const { teamA, teamB } = useSelector(state => state.match);

    useEffect(() => {
        setIsScreenFocused(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const getAllTeams = async () => {
                try {
                    const response = await fetch(
                        `${process.env.EXPO_PUBLIC_BASE_URL}/get-all-teams`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        }
                    );
                    const data = await response.json();

                    if (response.status === 200) {
                        setTeams(data.data);
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            };
            getAllTeams();
        }, [isScreenFocused])
    );

    useFocusEffect(
        useCallback(() => {
            navigation
                .getParent()
                ?.getParent()
                ?.setOptions({
                    tabBarStyle: { display: "none" }
                });

            return () => {
                navigation
                    .getParent()
                    ?.getParent()
                    ?.setOptions({
                        tabBarStyle: { display: "flex" }
                    });
            };
        }, [isScreenFocused])
    );

    const availableTeams = () => {
        return teams.filter(team => {
            if (route.params?.selectFor === "team A") {
                return team.team_name !== teamB?.name;
            } else if (route.params?.selectFor === "team B") {
                return team.team_name !== teamA?.name;
            }
            return true;
        });
    };

    const HandleSelectTeam = () => {
        if (route.params?.selectFor === "team A") {
            dispatch(setTeamAId(selectedTeam._id));
            dispatch(setTeamAName(selectedTeam.team_name));
            navigation.navigate("team-squad", {
                teamId: selectedTeam._id,
                selectFor: "team A"
            });
        }

        if (route.params?.selectFor === "team B") {
            dispatch(setTeamBId(selectedTeam._id));
            dispatch(setTeamBName(selectedTeam.team_name));
            navigation.navigate("team-squad", {
                teamId: selectedTeam._id,
                selectFor: "team B"
            });
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            if (route.params?.selectFor === "team A") {
                dispatch(setTeamAId(null));

                dispatch(setTeamAName(null));
            }
            if (route.params?.selectFor === "team B") {
                dispatch(setTeamBId(null));

                dispatch(setTeamBName(null));
            }
            setSelectedTeam(null);
            setIsLoading(true);
        });

        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.wrapper}>
            {!isLoading ? (
                <>
                    <FlatList
                        data={availableTeams()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.team,
                                    selectedTeam?.team_name ===
                                        item?.team_name && styles.selected
                                ]}
                                onPress={() => setSelectedTeam(item)}
                            >
                                <View style={styles.team_icon}>
                                    <Text style={styles.team_icon_text}>
                                        {item.team_name[0]}
                                    </Text>
                                </View>

                                <View style={styles.other_team_info_wrapper}>
                                    <Text style={styles.team_name}>
                                        {item.team_name}
                                    </Text>
                                    <View
                                        style={styles.city_and_captain_wrapper}
                                    >
                                        <View style={styles.city_wrapper}>
                                            <View style={styles.icon_wrapper}>
                                                <Icon
                                                    name="location-on"
                                                    size={12}
                                                    color="white"
                                                />
                                            </View>
                                            <Text style={styles.city_name}>
                                                {item.city.length > 12
                                                    ? item.city.substring(
                                                          0,
                                                          12
                                                      ) + ".."
                                                    : item.city}
                                            </Text>
                                        </View>
                                        {item.captain_name && (
                                            <View
                                                style={styles.captain_wrapper}
                                            >
                                                <View
                                                    style={styles.icon_wrapper}
                                                >
                                                    <Text style={styles.icon}>
                                                        C
                                                    </Text>
                                                </View>
                                                <Text
                                                    style={styles.captain_name}
                                                >
                                                    {item.captain_name.length >
                                                    12
                                                        ? item.captain_name.substring(
                                                              0,
                                                              12
                                                          ) + ".."
                                                        : item.captain_name}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.choose_team_wrapper}
                    />

                    {selectedTeam && (
                        <View style={styles.confirm_team_btn_wrapper}>
                            <TouchableOpacity
                                style={styles.confirm_team_btn}
                                onPress={HandleSelectTeam}
                            >
                                <Text style={styles.confirm_team_btn_text}>
                                    confirm team
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
        backgroundColor: "#FAFAFA",
        width: "100%"
    },

    choose_team_wrapper: {
        gap: normalizeVertical(25),
        paddingVertical: normalizeVertical(30)
    },
    team: {
        width: "90%",
        flexDirection: "row",
        gap: normalize(20),
        alignItems: "center",
        backgroundColor: "white",
        marginHorizontal: "auto",
        paddingHorizontal: normalize(10),
        paddingVertical: normalizeVertical(15),
        borderRadius: normalize(8),
        elevation: 2,
        borderWidth: 2,
        borderColor: "white"
    },
    team_icon: {
        backgroundColor: "#f75454",
        height: normalize(60),
        width: normalize(60),
        borderRadius: normalize(100),
        justifyContent: "center",
        alignItems: "center",
        elevation: 1
    },
    team_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },

    other_team_info_wrapper: {
        gap: normalizeVertical(10)
    },
    team_name: {
        fontSize: normalize(18),
        color: "#474646",
        textTransform: "capitalize",
        fontFamily: "ubuntuMedium"
    },
    city_and_captain_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(20)
    },
    icon_wrapper: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        height: normalize(22),
        width: normalize(22),
        borderRadius: normalize(50),
        elevation: 1
    },
    icon: {
        fontSize: normalize(12),
        color: "white",
        fontFamily: "robotoBold"
    },
    city_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(7)
    },
    city_name: {
        fontSize: normalize(16),
        color: "#474646",
        textTransform: "capitalize",
        fontFamily: "ubuntuMedium"
    },
    captain_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(7)
    },
    captain_name: {
        fontSize: normalize(16),
        color: "#474646",
        textTransform: "capitalize",
        fontFamily: "ubuntuMedium"
    },
    add_to_team_btn_wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0
    },
    confirm_team_btn_wrapper: {
        position: "fixed",
        bottom: 0,
        lef: 0,
        right: 0
    },
    confirm_team_btn: {
        backgroundColor: "#14B391",
        height: normalizeVertical(60),
        justifyContent: "center",
        alignItems: "center"
    },
    confirm_team_btn_text: {
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

export default ChooseTeamScreen;
