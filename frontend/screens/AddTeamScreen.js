import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Keyboard
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import { showToast } from "../redux/toastSlice.js";

import { normalize, normalizeVertical } from "../utils/responsive.js";
const AddTeamScreen = ({ navigation, route }) => {
    const [teamName, setTeamName] = useState(null);
    const [city, setCity] = useState(null);
    const [captainName, setCaptainName] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();
    const { accessToken } = useSelector(state => state.auth);
    useEffect(() => {
        setIsScreenFocused(true);
    }, []);

    const handleAddNewTeam = async () => {
        try {
            setShowSpinner(true);
            Keyboard.dismiss();
            if (!teamName || !city) {
                dispatch(
                    showToast({
                        type: "error",
                        message: "please fill all required field"
                    })
                );
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/add-new-team`,

                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ teamName, city, captainName })
                }
            );

            const data = await response.json();
            if (response.status !== 200) {
                dispatch(showToast({ type: "error", message: data.message }));
            } else {
                navigation.navigate("select-teams");
                setTeamName(null);
                setCity(null);
                setCaptainName(null);
            }
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message: "unexpected error occured,please try again latter"
                })
            );
        } finally {
            setShowSpinner(false);
        }
    };

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
            <View style={styles.add_team_wrapper}>
                <TextInput
                    placeholder="Team Name *"
                    placeholderTextColor="#767474"
                    style={styles.text_input}
                    value={teamName}
                    onChangeText={text => setTeamName(text)}
                />

                <TextInput
                    placeholder="City/town *"
                    placeholderTextColor="#858080"
                    style={styles.text_input}
                    value={city}
                    onChangeText={text => setCity(text)}
                />
                <TextInput
                    placeholder="Captain Name (optional)"
                    placeholderTextColor="#858080"
                    style={styles.text_input}
                    value={captainName}
                    onChangeText={text => setCaptainName(text)}
                />
                <TouchableOpacity
                    style={styles.add_btn}
                    onPress={handleAddNewTeam}
                >
                    {!showSpinner ? (
                        <Text style={styles.add_btn_text}>add team</Text>
                    ) : (
                        <Spinner
                            isLoading={showSpinner}
                            label="adding..."
                            spinnerColor="white"
                            labelColor="white"
                            labelSize={17}
                            spinnerSize={26}
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#FAFAFA",
        width: "100%"
    },
    add_team_wrapper: {
        justifyContent: "center",
        gap: normalizeVertical(15),
        backgroundColor: "white",
        marginHorizontal: normalize(15),
        paddingHorizontal: normalize(25),
        paddingVertical: normalizeVertical(20),
        borderRadius: normalize(8),
        elevation: 1
    },
    text_input: {
        paddingVertical: normalizeVertical(10),
        borderBottomWidth: 1,
        borderBottomColor: "#858080",
        fontSize: normalize(17),
        fontFamily: "ubuntuRegular"
    },
    add_btn: {
        backgroundColor: "#14B391",
        marginVertical: normalizeVertical(25),

        paddingHorizontal: normalize(5),
        paddingVertical: normalizeVertical(12),
        borderRadius: normalize(8)
    },
    add_btn_text: {
        fontSize: normalize(17),
        textAlign: "center",
        color: "white",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    }
});

export default AddTeamScreen;
