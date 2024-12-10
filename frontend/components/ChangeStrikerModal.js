import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ChangeStrikerModal = ({ showModal, setShowModal, matchDetails }) => {
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
                        <Text style={styles.modal_title}>change striker</Text>

                        <View style={styles.modal_content}></View>

                        <Text style={styles.modal_info}>
                            Are you sure to change the strike batsman?
                        </Text>

                        <View style={styles.modal_btn_wrapper}>
                            <TouchableOpacity
                                style={styles.cancel_button}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.cancel_button_text}>
                                    not now
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.ok_button}>
                                <Text style={styles.ok_button_text}>
                                    yes sure
                                </Text>
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
        paddingTop: normalizeVertical(25),
        fontSize: normalize(22),
        fontFamily: "robotoBold",
        textTransform: "capitalize"
    },
    modal_info: {
        fontSize: normalize(19),
        fontFamily: "robotoMedium",
        color: "#565656",
        width: "80%",
        textAlign: "center"
    },
    modal_btn_wrapper: {
        flexDirection: "row",
        alignContent: "centet"
    },
    cancel_button: {
        width: "50%",
        backgroundColor: "#F2F2F2",
        paddingVertical: normalizeVertical(18),
        marginTop: normalizeVertical(20)
    },
    ok_button: {
        width: "50%",
        backgroundColor: "#14B492",
        paddingVertical: normalizeVertical(18),
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
export default ChangeStrikerModal;
