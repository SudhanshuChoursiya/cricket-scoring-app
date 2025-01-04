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
import { setReplaceBowlerModal } from "../redux/modalSlice.js";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ReplaceBowlerModal = ({ matchId }) => {
    const replaceBowlerModal = useSelector(
        state => state.modal.replaceBowlerModal
    );
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const handleNavigate = () => {
        navigation.navigate("select-new-bowler", {
            matchId
        });
        dispatch(setReplaceBowlerModal({ isShow: false }));
    };
    return (
        <View style={styles.modal_wrapper}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={replaceBowlerModal.isShow}
                onRequestClose={() =>
                    dispatch(setReplaceBowlerModal({ isShow: false }))
                }
            >
                <View style={styles.modal_overlay}>
                    <View style={styles.modal_container}>
                        <View style={styles.modal_content}>
                            <View style={styles.icon_wrapper}>
                                <Icon
                                    name="error-outline"
                                    size={normalize(45)}
                                    color="#F99F0D"
                                />
                            </View>
                            <Text style={styles.modal_title}>
                                Replace bowler?
                            </Text>
                            <Text style={styles.modal_desc}>
                                Are u sure to replace current bowler?
                            </Text>
                            <TouchableOpacity
                                style={styles.confirm_btn}
                                onPress={handleNavigate}
                            >
                                <Text style={styles.confirm_btn_text}>
                                    yes, i’m sure
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.close_btn}
                                onPress={() =>
                                    dispatch(
                                        setReplaceBowlerModal({ isShow: false })
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
        fontFamily: "ubuntuMedium",
        color: "#AF2B1C"
    },

    modal_content: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: normalize(15),
        paddingVertical: normalizeVertical(15),
        gap: normalizeVertical(22)
    },
    icon_wrapper: {
        height: normalize(85),
        width: normalize(85),
        borderRadius: normalize(100),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFE8C6"
    },
    modal_title: {
        fontSize: normalize(22),
        fontFamily: "ubuntuBold",
        color: "#39444B"
    },
    modal_desc: {
        fontSize: normalize(18),
        fontFamily: "ubuntuRegular",
        color: "#A8ACAF",
        textAlign: "center"
    },

    confirm_btn: {
        backgroundColor: "#F99F0D",
        paddingVertical: normalizeVertical(12),
        paddingHorizontal: normalize(25),
        borderRadius: normalize(8),
        elevation: 1
    },
    confirm_btn_text: {
        color: "white",
        fontSize: normalize(16),

        fontFamily: "robotoMedium",
        textTransform: "uppercase",
        textAlign: "center"
    },

    close_btn: {
        backgroundColor: "#f5f5f5",
        paddingVertical: normalizeVertical(10),
        paddingHorizontal: normalize(25),
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
export default ReplaceBowlerModal;
