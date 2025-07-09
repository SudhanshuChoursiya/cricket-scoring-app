import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    StatusBar
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const SelectTwoTeamScreen = ({ navigation, route }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    const { teamA, teamB } = useSelector(state => state.match);

    useEffect(() => {
        setIsScreenFocused(true);
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
                <Text style={styles.label}>select playing teams</Text>
            </View>

            <View style={styles.select_team_wrapper}>
                <TouchableOpacity
                    style={styles.select_team}
                    onPress={() =>
                        navigation.navigate("choose-team", {
                            selectFor: "team A"
                        })
                    }
                >
                    <>
                        <View style={styles.select_icon_wrapper}>
                            {!teamA.name ? (
                                <Icon
                                    name="add"
                                    size={normalize(28)}
                                    color="white"
                                />
                            ) : (
                                <View style={styles.selected_team_icon_wrapper}>
                                    <Text
                                        style={styles.selected_team_icon_text}
                                    >
                                        {teamA.name[0]}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {teamA.name && (
                            <Text style={styles.selected_team_name}>
                                {ellipsize(teamA.name, 35)}
                            </Text>
                        )}
                        <Text style={styles.select_caption}>team a</Text>
                    </>
                </TouchableOpacity>
                <Text style={styles.versus_text}>Vs</Text>
                <TouchableOpacity
                    style={styles.select_team}
                    onPress={() =>
                        navigation.navigate("choose-team", {
                            selectFor: "team B"
                        })
                    }
                >
                    <>
                        <View style={styles.select_icon_wrapper}>
                            {!teamB.name ? (
                                <Icon
                                    name="add"
                                    size={normalize(28)}
                                    color="white"
                                />
                            ) : (
                                <View style={styles.selected_team_icon_wrapper}>
                                    <Text
                                        style={styles.selected_team_icon_text}
                                    >
                                        {teamB.name[0]}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {teamB.name && (
                            <Text style={styles.selected_team_name}>
                                {ellipsize(teamB.name, 35)}
                            </Text>
                        )}
                        <Text style={styles.select_caption}>team b</Text>
                    </>
                </TouchableOpacity>
            </View>

            {teamA.name && teamB.name && (
                <View style={styles.confirm_btn_wrapper}>
                    <TouchableOpacity
                        style={styles.confirm_btn}
                        onPress={() => navigation.navigate("create-match")}
                    >
                        <Text style={styles.confirm_btn_text}>continue</Text>
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
        gap: normalize(25),
        paddingHorizontal: normalize(20)
    },

    label: {
        fontSize: normalize(20),
        color: "white",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    },
    select_team_wrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(30)
    },
    select_team: {
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(15)
    },
    select_icon_wrapper: {
        height: normalize(95),
        width: normalize(95),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#282829",
        borderRadius: normalize(47),
        elevation: 1
    },
    select_caption: {
        backgroundColor: "#1A4DA1",
        color: "white",
        fontSize: normalize(16),
        width: normalize(100),
        paddingVertical: normalizeVertical(10),
        borderRadius: normalize(8),
        textTransform: "capitalize",
        fontFamily: "robotoMedium",
        textAlign: "center"
    },
    versus_text: {
        fontSize: normalize(24),
        fontFamily: "robotoBold"
    },
    selected_team_icon_wrapper: {
        height: normalize(95),
        width: normalize(95),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E21F26",
        borderRadius: normalize(47)
    },
    selected_team_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    selected_team_name: {
        fontSize: normalize(19),
        fontFamily: "robotoMedium",
        color: "#333333",
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
    }
});

export default SelectTwoTeamScreen;
