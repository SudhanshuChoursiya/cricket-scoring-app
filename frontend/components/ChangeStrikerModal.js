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
import { setChangeStrikeModal } from "../redux/modalSlice.js";
import Spinner from "./Spinner.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ChangeStrikerModal = ({
    matchDetails,
    showSpinner,
    handleChangeStrike
}) => {
    const changeStrikeModal = useSelector(
        state => state.modal.changeStrikeModal
    );
    const dispatch = useDispatch();
    const deviceWidth = Dimensions.get("window").width;

    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");

    const handleCloseModal = () => {
        dispatch(setChangeStrikeModal({ isShow: false }));
    };
    return (
        <Modal
            isVisible={changeStrikeModal.isShow}
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
                <Text style={styles.modal_title}>change striker</Text>

                <View style={styles.modal_content}></View>

                <Text style={styles.modal_info}>
                    Are you sure to change the strike batsman?
                </Text>

                <View style={styles.modal_btn_wrapper}>
                    <TouchableOpacity
                        style={styles.cancel_button}
                        onPress={handleCloseModal}
                    >
                        <Text style={styles.cancel_button_text}>not now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.ok_button}
                        onPress={handleChangeStrike}
                    >
                        <Text style={styles.ok_button_text}>yes sure</Text>
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
        alignContent: "center"
    },
    cancel_button: {
        width: "50%",
        height: normalizeVertical(60),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F2F2",
        marginTop: normalizeVertical(20)
    },
    ok_button: {
        width: "50%",
        height: normalizeVertical(60),
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
export default ChangeStrikerModal;
