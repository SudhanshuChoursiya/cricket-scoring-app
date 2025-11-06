import { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Keyboard
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../redux/toastSlice.js";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useHideNestedTabBar } from "../utils/useHideNestedTabBar.js";
import { useAddNewTeamMutation } from "../services/teamApi.js";

const AddTeamScreen = ({ navigation, route }) => {
    const [teamName, setTeamName] = useState(null);
    const [city, setCity] = useState(null);
    const [captainName, setCaptainName] = useState(null);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [iskeyboardVisible, setIsKeyboardVisible] = useState(false);

    useHideNestedTabBar(navigation, isScreenFocused);

    const { accessToken } = useSelector(state => state.auth);

    const dispatch = useDispatch();

    const [addNewTeam, { isLoading: isAdding }] = useAddNewTeamMutation();

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () =>
            setIsKeyboardVisible(true)
        );
        const hideSub = Keyboard.addListener("keyboardDidHide", () =>
            setIsKeyboardVisible(false)
        );

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleAddNewTeam = async () => {
        if (iskeyboardVisible) {
            Keyboard.dismiss();
        }

        if (!teamName || !city) {
            dispatch(
                showToast({
                    type: "error",
                    message: "please fill all required field"
                })
            );
            return;
        }

        try {
            const result = await addNewTeam({
                teamName,
                city,
                captainName
            }).unwrap();
            navigation.goBack();
            setTeamName(null);
            setCity(null);
            setCaptainName(null);
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message:
                        error?.data?.message ||
                        "unexpected error occurred, please try again later"
                })
            );
        }
    };

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
                    isDisabled={isAdding}
                >
                    {!isAdding ? (
                        <Text style={styles.add_btn_text}>add team</Text>
                    ) : (
                        <Spinner
                            isLoading={isAdding}
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
