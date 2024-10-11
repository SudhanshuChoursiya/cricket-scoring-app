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

import Icon from "react-native-vector-icons/MaterialIcons";

import { normalize, normalizeVertical } from "../utils/responsive.js";
const ChooseTeamScreen = ({ navigation, route }) => {
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    useEffect(() => {
        setIsScreenFocused(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const getAllTeams = async () => {
                try {
                    const response = await fetch(
                        `${process.env.EXPO_PUBLIC_BASE_URL}/get-all-teams`
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

    return (
        <View style={styles.wrapper}>
            <FlatList
                data={teams}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.team} onPress={()=>navigation.navigate("team-squad",{teamId:item._id})}>
                        <View style={styles.team_icon}>
                            <Text style={styles.team_icon_text}>
                                {item.team_name[0]}
                            </Text>
                        </View>

                        <View style={styles.other_team_info_wrapper}>
                            <Text style={styles.team_name}>
                                {item.team_name}
                            </Text>
                            <View style={styles.city_and_captain_wrapper}>
                                <View style={styles.city_wrapper}>
                                    <View style={styles.icon_wrapper}>
                                        <Icon
                                            name="location-on"
                                            size={12}
                                            color="white"
                                        />
                                    </View>
                                    <Text style={styles.city_name}>
                                        {item.city.length > 10
                                            ? item.city.substring(0, 10) + ".."
                                            : item.city}
                                    </Text>
                                </View>
                                {item.captain_name && (
                                    <View style={styles.captain_wrapper}>
                                        <View style={styles.icon_wrapper}>
                                            <Text style={styles.icon}>C</Text>
                                        </View>
                                        <Text style={styles.captain_name}>
                                            {item.captain_name.length > 10
                                                ? item.captain_name.substring(
                                                      0,
                                                      10
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
        elevation: 2
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
    }
});

export default ChooseTeamScreen;
