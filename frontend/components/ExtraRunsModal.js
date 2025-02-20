import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform
} from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import ExtraDimensions from "react-native-extra-dimensions-android";
import { useDispatch, useSelector } from "react-redux";
import { setExtraRunsModal } from "../redux/modalSlice.js";
import { showToast } from "../redux/toastSlice.js";

import Spinner from "./Spinner.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ExtraRunsModal = ({ showSpinner, handleUpdateScore }) => {
    const [selected, setSelected] = useState(null);

    const extraRunsModal = useSelector(state => state.modal.extraRunsModal);
    const dispatch = useDispatch();

    const deviceWidth = Dimensions.get("window").width;

    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");

    const handleCloseModal = () => {
        dispatch(
            setExtraRunsModal({
                title: null,
                runsInput: { isShow: false, value: null, label: null },
                payload: null,
                isShow: false
            })
        );
        setSelected(null);
    };
    const handleConfirmModal = () => {
        if (["LB", "BY"].includes(extraRunsModal.runsInput?.label)) {
            if (extraRunsModal.runsInput?.value <= 0) {
                dispatch(showToast("Please select runs"));
                return;
            }
        }
        handleUpdateScore(
            extraRunsModal.runsInput?.label,
            extraRunsModal.payload
        ).then(() => handleCloseModal());
    };

    return (
        <Modal
            isVisible={extraRunsModal.isShow}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
            backdropOpacity={0.6}
            animationInTiming={200}
            animationOutTiming={200}
            onBackdropPress={handleCloseModal}
            onBackButtonPress={handleCloseModal}
            backdropTransitionOutTiming={0}
            coverScreen={false}
            style={styles.modal_wrapper}
        >
            <View style={styles.modal_container}>
                <Text style={styles.modal_title}>{extraRunsModal.title}</Text>

                <View style={styles.modal_content}>
                    {(extraRunsModal.title === "Bye" ||
                        extraRunsModal.title === "Leg Bye") && (
                        <View style={styles.runs_scored_wrapper}>
                            {[1, 2, 3, 4, "+"].map((run, index) => (
                                <TouchableOpacity
                                    style={[
                                        styles.runs_scored,
                                        run === selected && styles.selected_bg
                                    ]}
                                    key={index}
                                    onPress={() => {
                                        setSelected(run);
                                        dispatch(
                                            setExtraRunsModal({
                                                ...extraRunsModal,
                                                runsInput: {
                                                    ...extraRunsModal.runsInput,
                                                    isShow: run === "+",
                                                    value:
                                                        extraRunsModal.runsInput
                                                            ?.value === run
                                                            ? null
                                                            : run !== "+" && run
                                                }
                                            })
                                        );
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.run_name,
                                            run === selected &&
                                                styles.selected_text
                                        ]}
                                    >
                                        {run}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            {extraRunsModal.runsInput?.isShow && (
                                <TextInput
                                    style={styles.runs_input}
                                    keyboardType="numeric"
                                    value={extraRunsModal.runsInput?.value}
                                    onChangeText={text =>
                                        dispatch(
                                            setExtraRunsModal({
                                                ...extraRunsModal,
                                                runsInput: {
                                                    ...extraRunsModal.runsInput,
                                                    value: Number(text)
                                                }
                                            })
                                        )
                                    }
                                />
                            )}
                        </View>
                    )}
                    {(extraRunsModal.title === "Wide Ball" ||
                        extraRunsModal.title === "No Ball") && (
                        <View style={styles.modal_input_wrapper}>
                            <Text style={styles.modal_input_label}>
                                {extraRunsModal.runsInput?.label}
                            </Text>
                            <Text style={styles.operator_sign}>+</Text>
                            <TextInput
                                style={styles.modal_input}
                                value={extraRunsModal.runsInput?.value}
                                onChangeText={text =>
                                    dispatch(
                                        setExtraRunsModal({
                                            ...extraRunsModal,
                                            runsInput: {
                                                ...extraRunsModal.runsInput,
                                                value: Number(text)
                                            }
                                        })
                                    )
                                }
                                keyboardType="numeric"
                            />
                            <Text style={styles.operator_sign}>=</Text>
                            <Text style={styles.modal_input_sum}>
                                {extraRunsModal.runsInput?.value === 0
                                    ? 1
                                    : 1 +
                                      Number(extraRunsModal.runsInput?.value)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Buttons */}
                <View style={styles.modal_btn_wrapper}>
                    <TouchableOpacity
                        style={styles.cancel_button}
                        onPress={handleCloseModal}
                    >
                        <Text style={styles.cancel_button_text}>cancel</Text>
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
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal_wrapper: {
        flex: 1,
        position: "relative",
        margin: 0
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
        left: 0,
        right: 0,
        bottom: 0,
        elevation: 1
    },
    modal_title: {
        paddingTop: normalizeVertical(20),
        fontSize: normalize(22),
        fontFamily: "robotoBold"
    },
    modal_input_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(7)
    },
    modal_input_label: {
        color: "#474646",
        fontSize: normalize(20),
        fontFamily: "robotoMedium"
    },
    modal_input: {
        width: normalize(50),
        borderWidth: 2,
        borderColor: "#14B492",
        borderRadius: normalize(5),
        paddingHorizontal: normalize(10)
    },
    operator_sign: {
        color: "#7c7c7c",
        fontSize: normalize(25)
    },
    modal_input_sum: {
        color: "#474646",
        fontSize: normalize(20),
        fontFamily: "robotoMedium"
    },
    runs_scored_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(15)
    },
    runs_scored: {
        height: normalize(42),
        width: normalize(42),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: normalize(5),
        borderWidth: 1,
        borderColor: "#14B492",
        elevation: 1
    },
    run_name: {
        color: "#14B492",
        fontSize: normalize(18),
        fontFamily: "robotoRegular"
    },
    runs_input: {
        width: normalize(42),
        height: normalize(42),
        borderWidth: 1.1,
        borderColor: "#6d6d6d",
        borderRadius: normalize(5),
        paddingHorizontal: normalize(10)
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
    },
    selected_bg: {
        backgroundColor: "#14B492",
        borderWidth: 1,
        borderColor: "#14B492"
    },
    selected_text: {
        color: "#FFFFFF"
    }
});

export default ExtraRunsModal;
