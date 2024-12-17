import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Keyboard,
    StatusBar
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { setTotalOvers, setCity, setGround } from "../redux/matchSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import { showAlert } from "../redux/alertSlice.js";
import AlertToast from "../components/AlertToast.js";

import { normalize, normalizeVertical } from "../utils/responsive.js";
const CreateMatchScreen = ({ navigation, route }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();

    const { teamA, teamB, totalOvers, matchPlace } = useSelector(
        state => state.match
    );

    const { isLoggedin, user, accessToken } = useSelector(state => state.auth);

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

    const handleCreateMatch = async () => {
        try {
            setShowSpinner(true);
            Keyboard.dismiss();
            if (
                !teamA.name ||
                teamA.playing11.length !== 11 ||
                !teamB.name ||
                teamB.playing11.length !== 11 ||
                !totalOvers ||
                !matchPlace.city ||
                !matchPlace.ground
            ) {
                dispatch(
                    showAlert({
                        value: true,
                        severity: "error",
                        type: "normal_alert",
                        msg: "plz fill all required field"
                    })
                );
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/create-new-match`,

                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        teamA,
                        teamB,
                        totalOvers,
                        matchPlace
                    })
                }
            );

            const data = await response.json();

            if (response.status !== 200) {
                dispatch(
                    showAlert({
                        value: true,
                        severity: "error",
                        type: "normal_alert",
                        msg: data.message
                    })
                );
            } else {
                dispatch(
                    showAlert({
                        value: true,
                        severity: "success",
                        type: "normal_alert",
                        msg: data.message
                    })
                );

                navigation.navigate("toss-screen", { matchId: data.data._id });
            }
        } catch (error) {
            console.log(error);
            dispatch(
                showAlert({
                    value: true,
                    severity: "error",
                    type: "normal_alert",
                    msg: "unexpected error occured,please try again latter"
                })
            );
        } finally {
            setShowSpinner(false);
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
                <Text style={styles.label}>start a match</Text>
            </View>

            <View style={styles.selected_team_wrapper}>
                <View style={styles.selected_team}>
                    <View style={styles.selected_team_icon_wrapper}>
                        <Text style={styles.selected_team_icon_text}>
                            {teamA.name[0]}
                        </Text>
                    </View>
                    <Text style={styles.selected_team_name}>{teamA.name}</Text>
                </View>
                <Text style={styles.versus_text}>Vs</Text>
                <View style={styles.selected_team}>
                    <View style={styles.selected_team_icon_wrapper}>
                        <Text style={styles.selected_team_icon_text}>
                            {teamB.name[0]}
                        </Text>
                    </View>
                    <Text style={styles.selected_team_name}>{teamB.name}</Text>
                </View>
            </View>

            <View style={styles.other_details_wrapper}>
                <View style={styles.text_input_wrapper}>
                    <Text style={styles.text_input_label}>No.of Overs*</Text>
                    <TextInput
                        style={styles.text_input}
                        value={totalOvers}
                        onChangeText={text => dispatch(setTotalOvers(text))}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.text_input_wrapper}>
                    <Text style={styles.text_input_label}>City/Town*</Text>
                    <TextInput
                        style={styles.text_input}
                        value={matchPlace.city}
                        onChangeText={text => dispatch(setCity(text))}
                    />
                </View>
                <View style={styles.text_input_wrapper}>
                    <Text style={styles.text_input_label}>Ground*</Text>
                    <TextInput
                        style={styles.text_input}
                        value={matchPlace.ground}
                        onChangeText={text => dispatch(setGround(text))}
                    />
                </View>
            </View>

            <View style={styles.confirm_btn_wrapper}>
                <TouchableOpacity
                    style={styles.confirm_btn}
                    onPress={handleCreateMatch}
                >
                    {!showSpinner ? (
                        <Text style={styles.confirm_btn_text}>NEXT (TOSS)</Text>
                    ) : (
                        <Spinner
                            isLoading={showSpinner}
                            label="creating..."
                            spinnerColor="white"
                            labelColor="white"
                            labelSize={19}
                            spinnerSize={28}
                        />
                    )}
                </TouchableOpacity>
            </View>
            <AlertToast
                topOffSet={15}
                successToastStyle={{ borderLeftColor: "green" }}
                errorToastStyle={{ borderLeftColor: "red" }}
            />
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
        gap: normalize(20),
        paddingHorizontal: normalize(20)
    },

    label: {
        fontSize: normalize(20),
        color: "white",
        paddingHorizontal: normalize(13),
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    },
    selected_team_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: normalize(20),
        marginVertical: normalizeVertical(25)
    },
    selected_team: {
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(15)
    },

    versus_text: {
        fontSize: normalize(22),
        fontFamily: "robotoBold"
    },
    selected_team_icon_wrapper: {
        height: normalize(100),
        width: normalize(100),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E21F26",
        borderRadius: normalize(50)
    },
    selected_team_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    selected_team_name: {
        backgroundColor: "#1A4DA1",
        color: "white",
        paddingHorizontal: normalize(15),
        paddingVertical: normalizeVertical(10),
        borderRadius: normalize(8),
        textTransform: "capitalize"
    },
    other_details_wrapper: {
        justifyContent: "center",
        gap: normalizeVertical(15),
        marginHorizontal: normalize(20)
    },
    text_input_wrapper: {
        justifyContent: "center"
    },
    text_input_label: {
        fontSize: normalize(15),
        fontFamily: "ubuntuRegular"
    },
    text_input: {
        paddingVertical: normalizeVertical(10),
        borderBottomWidth: 1,
        borderBottomColor: "#858080",
        fontSize: normalize(17),
        fontFamily: "ubuntuRegular"
    },
    confirm_btn_wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0
    },
    confirm_btn: {
        backgroundColor: "#14B391",
        paddingVertical: normalizeVertical(18)
    },
    confirm_btn_text: {
        fontSize: normalize(19),
        textAlign: "center",
        color: "white",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    }
});

export default CreateMatchScreen;
