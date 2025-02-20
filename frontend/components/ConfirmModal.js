import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Platform
} from "react-native";
import Modal from "react-native-modal";
import ExtraDimensions from "react-native-extra-dimensions-android";
import { useDispatch, useSelector } from "react-redux";
import { setConfirmModal } from "../redux/modalSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "./Spinner.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ConfirmModal = ({ showSpinner, player, handleConfirm }) => {
    const confirmModal = useSelector(state => state.modal.confirmModal);
    const dispatch = useDispatch();

    const deviceWidth = Dimensions.get("window").width;

    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");

    const handleCloseModal = () => {
        dispatch(
            setConfirmModal({
                isShow: false,
                actionType: null,
                title: null,
                description: null
            })
        );
    };

    const handleConfirmModal = () => {
        handleConfirm();
    };

    return (
        <Modal
            isVisible={confirmModal.isShow}
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
                <Text style={styles.modal_title}>{confirmModal?.title}</Text>

                <View style={styles.modal_content}>
                    <Text style={styles.modal_info}>
                        {confirmModal?.description}
                    </Text>
                </View>

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
                        <Text style={styles.ok_button_text}>yes</Text>
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
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        margin: 0,
        paddingTop: StatusBar.currentHeight
    },
    modal_container: {
        width: normalize(300),
        height: normalizeVertical(260),
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        elevation: 1
    },
    modal_title: {
        paddingTop: normalizeVertical(20),
        color: "#E21F26",
        fontSize: normalize(22),
        fontFamily: "robotoBold",
        textTransform: "capitalize",
        textAlign: "center"
    },
    modal_content: {
        paddingHorizontal: normalize(10)
    },
    modal_info: {
        fontSize: normalize(19),
        fontFamily: "robotoMedium",
        color: "#565656",
        textAlign: "center"
    },
    modal_btn_wrapper: {
        flexDirection: "row",
        alignItems: "center"
    },
    cancel_button: {
        width: "50%",
        height: normalizeVertical(62),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F2F2"
    },
    ok_button: {
        width: "50%",
        height: normalizeVertical(62),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: normalize(10),
        backgroundColor: "#14B492"
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
export default ConfirmModal;
