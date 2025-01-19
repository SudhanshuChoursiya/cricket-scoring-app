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
import { setReplaceBatsmanModal } from "../redux/modalSlice.js";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ReplaceBatsmanModal = ({ matchId, currentInningDetails }) => {
    const replaceBatsmanModal = useSelector(
        state => state.modal.replaceBatsmanModal
    );
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const handleNavigate = replacedBatsmanId => {
        navigation.navigate("select-new-batsman", {
            matchId,
            replacedBatsmanId
        });
        dispatch(setReplaceBatsmanModal({ isShow: false }));
    };
    return (
        <View style={styles.modal_wrapper}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={replaceBatsmanModal.isShow}
                onRequestClose={() =>
                    dispatch(setReplaceBatsmanModal({ isShow: false }))
                }
            >
                <View style={styles.modal_overlay}>
                    <View style={styles.modal_container}>
                        <View style={styles.modal_content}>
                            <Text style={styles.modal_title}>
                                Whom do you want to replace?
                            </Text>
                            <View style={styles.select_batsman_wrapper}>
                                {currentInningDetails?.currentBatsmen.map(
                                    batsman => (
                                        <TouchableOpacity
                                            style={styles.batsman}
                                            onPress={() => handleNavigate(batsman._id)}
                                            key={batsman._id}
                                        >
                                            <View
                                                style={
                                                    styles.batsman_icon_wrapper
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.batsman_icon_text
                                                    }
                                                >
                                                    {batsman.name[0]}
                                                </Text>
                                            </View>
                                            <Text style={styles.batsman_name}>
                                                {batsman.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.close_btn}
                                onPress={() =>
                                    dispatch(
                                        setReplaceBatsmanModal({
                                            isShow: false
                                        })
                                    )
                                }
                            >
                                <Text style={styles.close_btn_text}>
                                    cancel
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
        fontFamily: "ubuntuBold",
        color: "#39444B",
        textAlign: "center"
    },
    modal_content: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: normalize(15),
        paddingVertical: normalizeVertical(15),
        gap: normalizeVertical(22)
    },
    modal_desc: {
        fontSize: normalize(18),
        fontFamily: "ubuntuRegular",
        color: "#A8ACAF",
        textAlign: "center"
    },
    select_batsman_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    batsman: {
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(18),
        backgroundColor: "#FFFFFF",
        width: normalize(135),
        height: normalizeVertical(185),
        borderRadius: normalize(7),
        borderWidth: 2,
        borderColor: "white",
        elevation: 2
    },
    batsman_icon_wrapper: {
        height: normalize(80),
        width: normalize(80),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F54133",
        borderRadius: normalize(50),
        elevation: 1
    },
    batsman_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    batsman_name: {
        color: "black",
        fontSize: normalize(18),
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    close_btn: {
        backgroundColor: "#f5f5f5",
        paddingVertical: normalizeVertical(10),
        paddingHorizontal: normalize(30),
        borderRadius: normalize(8),
        elevation: 1
    },
    close_btn_text: {
        color: "#AF2B1C",
        fontSize: normalize(16),
        fontFamily: "robotoMedium",
        textTransform: "uppercase",
        textAlign: "center"
    }
});
export default ReplaceBatsmanModal;
