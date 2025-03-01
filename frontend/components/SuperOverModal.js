import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Dimensions,
    Platform
} from "react-native";
import Modal from "react-native-modal";
import ExtraDimensions from "react-native-extra-dimensions-android";
import { useDispatch, useSelector } from "react-redux";
import {
    setSuperOverModal,
    setMatchCompleteModal
} from "../redux/modalSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "./Spinner.js";
import { useNavigation } from "@react-navigation/native";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const SuperOverModal = ({ matchId, showSpinner, setShowSpinner }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const deviceWidth = Dimensions.get("window").width;

    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");
    const superOverModal = useSelector(state => state.modal.superOverModal);
    const { accessToken } = useSelector(state => state.auth);

    const handleCloseModal = () => {
        dispatch(setSuperOverModal({ isShow: false }));
        dispatch(setMatchCompleteModal({ isShow: true }));
    };

    const handleConfirmModal = async () => {
        try {
            setShowSpinner(true);
            if (!matchId) {
                throw new Error("plz provide all the required field");
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/start-super-over/${matchId}`,

                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();
            if (response.status !== 200) {
                throw new Error(data.message);
            } else {
                navigation.navigate("initial-players-assign-screen", {
                    matchId
                });
                dispatch(setSuperOverModal({ isShow: false }));
            }
        } catch (error) {
            console.log(error);
        } finally {
            setShowSpinner(false);
        }
    };
    return (
        <Modal
            isVisible={superOverModal.isShow}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
            backdropOpacity={0.6}
            animationInTiming={500}
            animationOutTiming={500}
            backdropTransitionOutTiming={0}
            coverScreen={false}
            style={styles.modal_wrapper}
        >
            <View style={styles.modal_container}>
                <View style={styles.modal_content}>
                    <View style={styles.icon_wrapper}>
                        {!showSpinner ? (
                            <Icon
                                name="error-outline"
                                size={normalize(45)}
                                color="#F99F0D"
                            />
                        ) : (
                            <Spinner
                                isLoading={showSpinner}
                                spinnerColor="#F99F0D"
                                spinnerSize={45}
                            />
                        )}
                    </View>
                    <Text style={styles.modal_title}>super over?</Text>
                    <Text style={styles.modal_desc}>
                        is there a super over to decide the match result?
                    </Text>
                    <TouchableOpacity
                        style={styles.confirm_btn}
                        onPress={handleConfirmModal}
                    >
                        <Text style={styles.confirm_btn_text}>yes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.close_btn}
                        onPress={handleCloseModal}
                    >
                        <Text style={styles.close_btn_text}>no</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal_wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        margin: 0,
        paddingTop: StatusBar.currentHeight
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
export default SuperOverModal;
