import { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Pressable,
    TextInput,
    Keyboard,
    StatusBar,
    ScrollView
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
    setTotalOvers,
    setCity,
    setGround,
    setStartTime,
    setMatchStage,
    resetMatchState
} from "../redux/matchSlice.js";
import { showToast } from "../redux/toastSlice.js";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useHideTabBar } from "../utils/useHideTabBar.js";
import { useCreateMatchMutation } from "../services/matchApi";

const CreateMatchScreen = ({ navigation, route }) => {
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [iskeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    useHideTabBar(navigation, isScreenFocused);
    const dispatch = useDispatch();
    const {
        tournamentId,
        tournamentName,
        teamA,
        teamB,
        totalOvers,
        matchPlace,
        startTime,
        matchStage
    } = useSelector(state => state.match);

    const { isLoggedin, user, accessToken } = useSelector(state => state.auth);

    const [createMatch, { isLoading: isCreating }] = useCreateMatchMutation();

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

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            dispatch(setTotalOvers(null));
            dispatch(setCity(null));
            dispatch(setGround(null));
            dispatch(setStartTime(null));
            dispatch(setMatchStage(null));
        });
        return unsubscribe;
    }, [navigation]);

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (event.type === "dismissed") {
            return;
        }

        if (selectedTime) {
            dispatch(setStartTime(selectedTime.toISOString()));
        }
    };

    const handleOpenTimePicker = () => {
        if (iskeyboardVisible) {
            Keyboard.dismiss();
        }
        setShowTimePicker(true);
    };

    const handleCreateMatch = async () => {
        try {
            if (iskeyboardVisible) {
                Keyboard.dismiss();
            }

            if (
                !teamA.id ||
                !teamB.id ||
                !teamA.name ||
                teamA.playing11.length !== 11 ||
                !teamA.captain ||
                !teamB.name ||
                teamB.playing11.length !== 11 ||
                !teamB.captain ||
                !totalOvers ||
                !matchPlace.city ||
                !matchPlace.ground
            ) {
                dispatch(
                    showToast({
                        type: "error",
                        message: "Please fill all required fields"
                    })
                );
                return;
            }

            const data = await createMatch({
                teamA,
                teamB,
                totalOvers,
                matchPlace,
                matchStage,
                startTime,
                tournamentId,
                tournamentName
            }).unwrap();

            dispatch(resetMatchState());

            if (tournamentId) {
                navigation.reset({
                    index: 1,
                    routes: [
                        {
                            name: "tournament-matches",
                            params: { tournamentId, tournamentName }
                        },
                        {
                            name: "toss-screen",
                            params: { matchId: data?.data?._id }
                        }
                    ]
                });
            } else {
                navigation.reset({
                    index: 1,
                    routes: [
                        { name: "home-screen" },
                        {
                            name: "toss-screen",
                            params: { matchId: data?.data?._id }
                        }
                    ]
                });
            }
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message: error?.data?.message || "Unexpected error occurred"
                })
            );
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
            <ScrollView
                style={styles.scroll_view_wrapper}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.selected_team_wrapper}>
                    <View style={styles.selected_team}>
                        <View style={styles.selected_team_icon_wrapper}>
                            <Text style={styles.selected_team_icon_text}>
                                {teamA.name?.[0]}
                            </Text>
                        </View>
                        <Text style={styles.selected_team_name}>
                            {ellipsize(teamA?.name, 15)}
                        </Text>
                        <Text style={styles.selected_caption}>team a</Text>
                    </View>
                    <Text style={styles.versus_text}>Vs</Text>
                    <View style={styles.selected_team}>
                        <View style={styles.selected_team_icon_wrapper}>
                            <Text style={styles.selected_team_icon_text}>
                                {teamB.name?.[0]}
                            </Text>
                        </View>
                        <Text style={styles.selected_team_name}>
                            {ellipsize(teamB?.name, 15)}
                        </Text>
                        <Text style={styles.selected_caption}>team b</Text>
                    </View>
                </View>

                <View style={styles.other_details_wrapper}>
                    <View style={styles.text_input_wrapper}>
                        <Text style={styles.text_input_label}>
                            No.of Overs*
                        </Text>
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
                            value={matchPlace?.city}
                            onChangeText={text => dispatch(setCity(text))}
                        />
                    </View>
                    <View style={styles.text_input_wrapper}>
                        <Text style={styles.text_input_label}>Ground*</Text>
                        <TextInput
                            style={styles.text_input}
                            value={matchPlace?.ground}
                            onChangeText={text => dispatch(setGround(text))}
                        />
                    </View>
                    <View style={styles.text_input_wrapper}>
                        <Text style={styles.text_input_label}>
                            Match Stage ( optional )
                        </Text>
                        <TextInput
                            style={styles.text_input}
                            value={matchStage}
                            onChangeText={text => dispatch(setMatchStage(text))}
                        />
                    </View>
                    <View style={styles.text_input_wrapper}>
                        <Text style={styles.text_input_label}>
                            Starting Time ( optional )
                        </Text>
                        <Pressable
                            onPress={handleOpenTimePicker}
                            style={styles.input_and_close_button_wrapper}
                        >
                            <TextInput
                                style={styles.text_input}
                                value={
                                    startTime
                                        ? moment(startTime).format("hh:mm A")
                                        : ""
                                }
                                editable={false}
                            />
                            {startTime && (
                                <TouchableOpacity
                                    onPress={() => dispatch(setStartTime(null))}
                                    style={styles.close_button}
                                >
                                    <Icon
                                        name="close"
                                        size={normalize(22)}
                                        color="#858080"
                                    />
                                </TouchableOpacity>
                            )}
                        </Pressable>
                        {showTimePicker && (
                            <DateTimePicker
                                value={
                                    startTime ? new Date(startTime) : new Date()
                                }
                                mode="time"
                                display="default"
                                onChange={handleTimeChange}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
            <View style={styles.confirm_btn_wrapper}>
                <TouchableOpacity
                    style={styles.confirm_btn}
                    onPress={handleCreateMatch}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <Spinner
                            isLoading={isCreating}
                            label="Creating..."
                            spinnerColor="white"
                            labelColor="white"
                            labelSize={19}
                            spinnerSize={28}
                        />
                    ) : (
                        <Text style={styles.confirm_btn_text}>NEXT (TOSS)</Text>
                    )}
                </TouchableOpacity>
            </View>
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
        paddingTop: normalizeVertical(38),
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
        fontFamily: "robotoBold",
        textTransform: "capitalize"
    },
    scroll_view_wrapper: {
        marginBottom: normalizeVertical(82)
    },
    selected_team_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: normalizeVertical(25)
    },
    selected_team: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(10)
    },
    versus_text: {
        fontSize: normalize(22),
        fontFamily: "robotoBold"
    },
    selected_team_icon_wrapper: {
        height: normalize(80),
        width: normalize(80),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E21F26",
        borderRadius: normalize(40)
    },
    selected_team_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    selected_team_name: {
        fontSize: normalize(18),
        fontFamily: "robotoMedium",
        color: "#333333",
        textTransform: "capitalize"
    },
    selected_caption: {
        backgroundColor: "#1A4DA1",
        color: "white",
        fontSize: normalize(16),
        width: normalize(90),
        paddingVertical: normalizeVertical(8),
        borderRadius: normalize(8),
        textTransform: "capitalize",
        fontFamily: "robotoMedium",
        textAlign: "center"
    },
    other_details_wrapper: {
        justifyContent: "center",
        gap: normalizeVertical(15),
        marginHorizontal: normalize(20)
    },
    input_and_close_button_wrapper: {
        position: "relative"
    },
    close_button: {
        position: "absolute",
        right: normalize(5),
        top: normalizeVertical(16)
    },
    text_input_wrapper: {
        justifyContent: "center"
    },
    text_input_label: {
        fontSize: normalize(16),
        fontFamily: "ubuntuRegular"
    },
    text_input: {
        paddingVertical: normalizeVertical(10),
        borderBottomWidth: 1,
        borderBottomColor: "#858080",
        fontSize: normalize(17),
        color: "#333333",
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

export default CreateMatchScreen;
