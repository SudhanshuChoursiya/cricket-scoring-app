import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const OverCompletionModal = ({ showModal, setShowModal,currentInningDetails}) => {
    return (
        <View style={styles.modal_wrapper}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modal_overlay}>
                    <View style={styles.modal_container}>
                        <Text style={styles.modal_title}>Over Complete</Text>
                        <View style={styles.modal_content}>
                            <Text style={styles.over_info}>
                                End of over {currentInningDetails?.currentOvers} by {currentInningDetails?.currentBowler.name}
                            </Text>
                            <TouchableOpacity style={styles.start_new_over_btn}>
                                <Text style={styles.start_new_over_btn_text}>
                                    start next over
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Button to close the modal */}

                        <TouchableOpacity style={styles.continue_over_btn}>
                            <Text style={styles.continue_over_btn_text}>
                                Continue This Over
                            </Text>
                        </TouchableOpacity>
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
        justifyContent: "center",
        alignItems: "center"
    },
    modal_container: {
        width: normalize(300),
        backgroundColor: "white",
        borderRadius: normalize(10),
        gap: normalizeVertical(20),
        paddingHorizontal: normalize(20),
        paddingVertical: normalizeVertical(20),
        elevation: 1
    },
    modal_title: {
        fontSize: normalize(21),
        fontFamily: "ubuntuMedium",
        color: "#AF2B1C"
    },

    modal_content: {
        borderWidth: normalize(2),
        borderColor: "#d2d1d1",
        paddingHorizontal: normalize(15),
        paddingVertical: normalizeVertical(25),
        gap: normalizeVertical(20),
        borderRadius: normalize(8)
    },

    over_info: {
        fontSize: normalize(18),
        fontFamily: "ubuntuMedium",
        color: "#565656"
    },

    start_new_over_btn: {
        backgroundColor: "#14B492",
        paddingVertical: normalizeVertical(15),

        borderRadius: normalize(8),
        elevation: 1
    },
    start_new_over_btn_text: {
        color: "white",
        fontSize: normalize(17),

        fontFamily: "ubuntuMedium",
        textTransform: "uppercase",
        textAlign: "center"
    },

    continue_over_btn: {
        width: "100%",
        backgroundColor: "#f5f5f5",
        paddingVertical: normalizeVertical(15),
        borderRadius: normalize(8),
        elevation: 1
    },

    continue_over_btn_text: {
        color: "#AF2B1C",
        fontSize: normalize(17),
        fontFamily: "ubuntuMedium",
        textTransform: "uppercase",
        textAlign: "center"
    }
});
export default OverCompletionModal;
