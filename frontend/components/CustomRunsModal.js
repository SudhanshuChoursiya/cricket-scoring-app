import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCustomRunsModal } from "../redux/modalSlice.js";
import Spinner from "./Spinner.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const CustomRunsModal = ({ showSpinner, handleUpdateScore }) => {
    const customRunsModal = useSelector(state => state.modal.customRunsModal);
    const dispatch = useDispatch();

    const handleCloseModal = () => {
        dispatch(
            setCustomRunsModal({
                inputValue: 0,
                isShow: false
            })
        );
    };

    const handleConfirmModal = () => {
        handleUpdateScore(
            customRunsModal.inputLabel,
            customRunsModal.payload
        ).then(() => handleCloseModal());
    };

    return (
        <View style={styles.modal_wrapper}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={customRunsModal.isShow}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modal_overlay}>
                    <View style={styles.modal_container}>
                        <Text style={styles.modal_title}>
                            Runs Scored by runnning
                        </Text>

                        <View style={styles.modal_content}>
                            <View style={styles.modal_input_wrapper}>
                                <TextInput
                                    style={styles.modal_input}
                                    value={customRunsModal.inputValue}
                                    onChangeText={text =>
                                        dispatch(
                                            setCustomRunsModal({
                                                inputValue: Number(text)
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
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modal_overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "relative"
    },
    modal_container: {
        width: "100%",
        height: normalizeVertical(230),
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
        paddingTop: normalizeVertical(22),
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
