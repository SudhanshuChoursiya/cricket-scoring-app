import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    TouchableWithoutFeedback
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCustomRunsModal } from "../redux/modalSlice.js";
import Spinner from "./Spinner.js";
import { showToast } from "../redux/toastSlice.js";

import { normalize, normalizeVertical } from "../utils/responsive.js";

const CustomRunsModal = ({ showSpinner, handleUpdateScore }) => {
    const customRunsModal = useSelector(state => state.modal.customRunsModal);
    const dispatch = useDispatch();

    const slideAnim = useRef(
        new Animated.Value(normalizeVertical(250))
    ).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (customRunsModal.isShow) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true
                })
            ]).start();
        }
    }, [customRunsModal.isShow]);

    const handleCloseModal = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: normalizeVertical(250),
                duration: 100,
                useNativeDriver: true
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true
            })
        ]).start(() => {
            dispatch(
                setCustomRunsModal({
                    runsInput: {
                        isShow: false,
                        value: null,
                        label: null
                    },
                    payload: null,
                    isShow: false
                })
            );
        });
    };

    const handleConfirmModal = () => {
        if (customRunsModal.runsInput?.label === "5,7") {
            if (customRunsModal.runsInput?.value <= 0) {
                dispatch(showToast("Please Enter Runs"));
                return;
            }
        }
        handleUpdateScore(
            customRunsModal.runsInput?.label,
            customRunsModal.payload
        ).then(() => handleCloseModal());
    };

    if (!customRunsModal.isShow) return null;

    return (
        <TouchableWithoutFeedback onPress={handleCloseModal}>
            <Animated.View
                style={[styles.modal_wrapper, { opacity: fadeAnim }]}
            >
                <Animated.View
                    style={[
                        styles.modal_container,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={styles.modal_title}>
                        Runs Scored by runnning
                    </Text>

                    <View style={styles.modal_content}>
                        <View style={styles.modal_input_wrapper}>
                            <TextInput
                                style={styles.modal_input}
                                value={customRunsModal.runsInput?.value}
                                onChangeText={text =>
                                    dispatch(
                                        setCustomRunsModal({
                                            ...customRunsModal,
                                            runsInput: {
                                                ...customRunsModal.runsInput,
                                                value: Number(text)
                                            }
                                        })
                                    )
                                }
                                keyboardType="numeric"
                            />
                        </View>
                        <Text style={styles.modal_desc}>
                            *4 and 6 will not be considered boundaries
                        </Text>
                    </View>

                    {/* Button to close the modal */}
                    <View style={styles.modal_btn_wrapper}>
                        <TouchableOpacity
                            style={styles.cancel_button}
                            onPress={handleCloseModal}
                        >
                            <Text style={styles.cancel_button_text}>
                                cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.ok_button}
                            onPress={handleConfirmModal}
                        >
                            <Text style={styles.ok_button_text}>ok</Text>
                            {showSpinner && (
                                <Spinner
                                    isLoading={showSpinner}
                                    spinnerColor="white"
                                    spinnerSize={28}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    modal_wrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    modal_container: {
        width: "100%",
        height: normalizeVertical(250),
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        borderTopLeftRadius: normalize(25),
        borderTopRightRadius: normalize(25),
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 1
    },
    modal_title: {
        paddingTop: normalizeVertical(24),
        fontSize: normalize(21),
        fontFamily: "robotoBold"
    },
    modal_content: {
        gap: normalizeVertical(10)
    },
    modal_input_wrapper: {
        justifyContent: "center",
        alignItems: "center"
    },
    modal_input: {
        width: normalize(65),
        borderWidth: 2,
        borderColor: "#14B492",
        borderRadius: normalize(5),
        paddingHorizontal: normalize(10)
    },
    modal_desc: {
        color: "#474646",
        fontSize: normalize(18),
        fontFamily: "robotoMedium"
    },
    modal_btn_wrapper: {
        flexDirection: "row",
        alignContent: "center"
    },
    cancel_button: {
        width: "50%",
        height: normalizeVertical(62),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F2F2",

        marginTop: normalizeVertical(20)
    },
    ok_button: {
        width: "50%",
        height: normalizeVertical(62),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: normalize(10),
        backgroundColor: "#14B492",
        marginTop: normalizeVertical(20)
    },
    cancel_button_text: {
        color: "black",
        fontSize: normalize(17),
        fontFamily: "robotoBold",
        textTransform: "uppercase",
        textAlign: "center"
    },
    ok_button_text: {
        color: "white",
        fontSize: normalize(17),
        fontFamily: "robotoBold",
        textTransform: "uppercase",
        textAlign: "center"
    }
});
export default CustomRunsModal;
