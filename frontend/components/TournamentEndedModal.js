import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform,
    StatusBar
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../redux/modalSlice.js";
import { useNavigation } from "@react-navigation/native";
import ExtraDimensions from "react-native-extra-dimensions-android";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialIcons";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const TournamentEndedModal = () => {
    const { activeModal, payload } = useSelector(state => state.modal);

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const deviceWidth = Dimensions.get("window").width;

    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");

    const handleCloseModal = () => {
        dispatch(closeModal());
    };

    const handleConfirmModal = () => {
        handleCloseModal();
        if (payload?.tournamentDetails?._id) {
            navigation.navigate("create-tournament", {
                tournamentDetails: payload?.tournamentDetails
            });
        }
    };

    return (
        <Modal
            isVisible={activeModal === "tournamentEnded"}
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
                <View style={styles.modal_content}>
                    <View style={styles.icon_wrapper}>
                        <Icon
                            name="error-outline"
                            size={normalize(45)}
                            color="#2A363E"
                        />
                    </View>
                    <Text style={styles.modal_title}>Tournament is over?</Text>
                    <Text style={styles.modal_desc}>
                        It seems the tournament is already over. If it has
                        extended,please change the End Date.
                    </Text>
                    <TouchableOpacity
                        style={styles.confirm_btn}
                        onPress={handleConfirmModal}
                    >
                        <Text style={styles.confirm_btn_text}>
                            Change End Date
                        </Text>
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
        justifyContent: "center",
        alignItems: "center",
        paddingTop: StatusBar.currentHeight,
        margin: 0
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
        backgroundColor: "#CBCFD2"
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
        backgroundColor: "#72797F",
        paddingVertical: normalizeVertical(10),
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
export default TournamentEndedModal;
