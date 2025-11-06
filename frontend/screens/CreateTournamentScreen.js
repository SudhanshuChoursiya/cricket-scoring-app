import { useState, useEffect } from "react";
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
    setName,
    setCity,
    setGround,
    setStartDate,
    setEndDate,
    resetTournamentState
} from "../redux/tournamentSlice.js";
import { showToast } from "../redux/toastSlice.js";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useHideTabBar } from "../utils/useHideTabBar.js";
import {
    useCreateTournamentMutation,
    useUpdateTournamentMutation
} from "../services/tournamentApi.js";

const CreateTournamentScreen = ({ navigation, route }) => {
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [iskeyboardVisible, setIsKeyboardVisible] = useState(false);

    // pickers
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    useHideTabBar(navigation, isScreenFocused);
    const dispatch = useDispatch();

    const { name, location, startDate, endDate } = useSelector(
        state => state.tournament
    );

    const { isLoggedin, user, accessToken } = useSelector(state => state.auth);

    const [createTournament, { isLoading: isCreating }] =
        useCreateTournamentMutation();

    const [updateTournament, { isLoading: isUpdating }] =
        useUpdateTournamentMutation();

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
            if (route.params?.tournamentDetails?._id) {
                const tournamentDetails = route.params?.tournamentDetails;

                dispatch(setName(tournamentDetails?.name));
                dispatch(setCity(tournamentDetails?.location.city));
                dispatch(setGround(tournamentDetails?.location.ground));
                dispatch(setStartDate(tournamentDetails?.startDate));
                dispatch(setEndDate(tournamentDetails?.endDate));
            } else {
                dispatch(resetTournamentState());
            }
        });
        return unsubscribe;
    }, [navigation, route.params, dispatch]);

    // handle start date
    const handleStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (event.type === "dismissed") return;
        if (selectedDate) {
            dispatch(setStartDate(selectedDate.toISOString()));
        }
    };

    const handleOpenStartDatePicker = () => {
        if (iskeyboardVisible) Keyboard.dismiss();
        setShowStartDatePicker(true);
    };

    // handle end date
    const handleEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (event.type === "dismissed") return;
        if (selectedDate) {
            dispatch(setEndDate(selectedDate.toISOString()));
        }
    };

    const handleOpenEndDatePicker = () => {
        if (iskeyboardVisible) Keyboard.dismiss();
        setShowEndDatePicker(true);
    };

    const handleCreateTournament = async () => {
        try {
            if (iskeyboardVisible) Keyboard.dismiss();

            if (
                !name ||
                !location.city ||
                !location.ground ||
                !startDate ||
                !endDate
            ) {
                dispatch(
                    showToast({
                        type: "error",
                        message: "please fill all required field"
                    })
                );
                return;
            }

            const payload = { name, location, startDate, endDate };

            const data = await createTournament(payload).unwrap();
            navigation.goBack();

            // reset state
            dispatch(setCity(null));
            dispatch(setGround(null));
            dispatch(setStartDate(null));
            dispatch(setEndDate(null));
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message:
                        error?.data?.message ||
                        "unexpected error occured, try again later"
                })
            );
        }
    };

    const handleUpdateTournament = async () => {
        try {
            if (iskeyboardVisible) Keyboard.dismiss();

            if (
                !name ||
                !location.city ||
                !location.ground ||
                !startDate ||
                !endDate
            ) {
                dispatch(
                    showToast({
                        type: "error",
                        message: "Please fill all required fields"
                    })
                );
                return;
            }

            const tournamentId = route.params?.tournamentDetails?._id;

            const payload = { name, location, startDate, endDate };

            await updateTournament({ tournamentId, payload }).unwrap();

            dispatch(
                showToast({
                    type: "success",
                    message: "Tournament updated successfully!"
                })
            );
            navigation.goBack();
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message:
                        error?.data?.message ||
                        "Update failed, please try again"
                })
            );
        }
    };

    const handleSubmit = () => {
        if (route.params?.tournamentDetails?._id) handleUpdateTournament();
        else handleCreateTournament();
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
                    {route.params?.tournamentDetails?._id
                        ? "Update Tournament"
                        : "Register Tournament"}
                </Text>
            </View>
            <ScrollView
                style={styles.scroll_view_wrapper}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.other_details_wrapper}>
                    <View style={styles.text_input_wrapper}>
                        <Text style={styles.text_input_label}>
                            Tournament / series name*
                        </Text>
                        <TextInput
                            style={styles.text_input}
                            value={name}
                            onChangeText={text => dispatch(setName(text))}
                        />
                    </View>
                    <View style={styles.text_input_wrapper}>
                        <Text style={styles.text_input_label}>City/Town*</Text>
                        <TextInput
                            style={styles.text_input}
                            value={location.city}
                            onChangeText={text => dispatch(setCity(text))}
                        />
                    </View>
                    <View style={styles.text_input_wrapper}>
                        <Text style={styles.text_input_label}>Ground*</Text>
                        <TextInput
                            style={styles.text_input}
                            value={location.ground}
                            onChangeText={text => dispatch(setGround(text))}
                        />
                    </View>

                    {/* Start Date */}
                    <View style={styles.text_input_wrapper}>
                        <Text style={styles.text_input_label}>Start Date*</Text>
                        <Pressable
                            onPress={handleOpenStartDatePicker}
                            style={styles.input_and_close_button_wrapper}
                        >
                            <TextInput
                                style={styles.text_input}
                                value={
                                    startDate
                                        ? moment(startDate).format(
                                              "DD MMM YYYY"
                                          )
                                        : ""
                                }
                                editable={false}
                            />
                            {startDate && (
                                <TouchableOpacity
                                    onPress={() => dispatch(setStartDate(null))}
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
                        {showStartDatePicker && (
                            <DateTimePicker
                                value={
                                    startDate ? new Date(startDate) : new Date()
                                }
                                mode="date"
                                display="default"
                                onChange={handleStartDateChange}
                            />
                        )}
                    </View>

                    {/* End Date */}
                    <View style={styles.text_input_wrapper}>
                        <Text style={styles.text_input_label}>End Date*</Text>
                        <Pressable
                            onPress={handleOpenEndDatePicker}
                            style={styles.input_and_close_button_wrapper}
                        >
                            <TextInput
                                style={styles.text_input}
                                value={
                                    endDate
                                        ? moment(endDate).format("DD MMM YYYY")
                                        : ""
                                }
                                editable={false}
                            />
                            {endDate && (
                                <TouchableOpacity
                                    onPress={() => dispatch(setEndDate(null))}
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
                        {showEndDatePicker && (
                            <DateTimePicker
                                value={endDate ? new Date(endDate) : new Date()}
                                mode="date"
                                display="default"
                                onChange={handleEndDateChange}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
            <View style={styles.confirm_btn_wrapper}>
                <TouchableOpacity
                    style={styles.confirm_btn}
                    onPress={handleSubmit}
                    disabled={isCreating || isUpdating}
                >
                    {isCreating || isUpdating ? (
                        <Spinner
                            isLoading={isCreating || isUpdating}
                            label={isCreating ? "creating..." : "updating..."}
                            spinnerColor="white"
                            labelColor="white"
                            labelSize={19}
                            spinnerSize={28}
                        />
                    ) : (
                        <Text style={styles.confirm_btn_text}>
                            {route.params?.tournamentDetails?._id
                                ? "Update"
                                : "Register"}
                        </Text>
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
    other_details_wrapper: {
        marginVertical: normalizeVertical(25),
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

export default CreateTournamentScreen;
