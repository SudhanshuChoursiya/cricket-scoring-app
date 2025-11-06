import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Platform
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../redux/modalSlice.js";
import { useNavigation } from "@react-navigation/native";
import ExtraDimensions from "react-native-extra-dimensions-android";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "./Spinner.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useEndInningMutation } from "../services/matchApi.js";

const EndInningModal = ({ matchId }) => {
  const { activeModal, payload } = useSelector(state => state.modal);
  
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [endInning, { isLoading: isInningEnding }] = useEndInningMutation();

    const deviceWidth = Dimensions.get("window").width;
    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");

    const handleCloseModal = () => {
        dispatch(closeModal());
    };

    const handleConfirmModal = async () => {
        try {
            if (!matchId) {
                throw new Error("Please provide all the required fields");
            }

            await endInning(matchId).unwrap();

            navigation.replace("initial-players-assign-screen", { matchId });
            handleCloseModal()
        } catch (error) {
            console.log("End inning error:", error);
        }
    };

    return (
        <Modal
            isVisible={activeModal==="endInning"}
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
                        {!isInningEnding ? (
                            <Icon
                                name="error-outline"
                                size={normalize(45)}
                                color="#F99F0D"
                            />
                        ) : (
                            <Spinner
                                isLoading={true}
                                spinnerColor="#F99F0D"
                                spinnerSize={45}
                            />
                        )}
                    </View>
                    <Text style={styles.modal_title}>End Innings?</Text>
                    <Text style={styles.modal_desc}>
                        Are you sure to end 1st innings?
                    </Text>
                    <TouchableOpacity
                        style={styles.confirm_btn}
                        onPress={handleConfirmModal}
                        disabled={isInningEnding}
                    >
                        <Text style={styles.confirm_btn_text}>
                            {isInningEnding ? "Processing..." : "Yes, I’m sure"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.close_btn}
                        onPress={handleCloseModal}
                        disabled={isInningEnding}
                    >
                        <Text style={styles.close_btn_text}>Cancel</Text>
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
export default EndInningModal;
