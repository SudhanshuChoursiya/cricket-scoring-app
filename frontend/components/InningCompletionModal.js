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
import { setInningCompleteModal } from "../redux/modalSlice.js";
import { useNavigation } from "@react-navigation/native";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const InningCompletionModal = ({ matchDetails, handleUndoScore }) => {
    const inningCompleteModal = useSelector(
        state => state.modal.inningCompleteModal
    );
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const deviceWidth = Dimensions.get("window").width;

    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");
    const handleNavigate = () => {
        navigation.navigate("initial-players-assign-screen", {
            matchId: matchDetails?._id
        });
        dispatch(setInningCompleteModal({ isShow: false }));
    };

    const handleContinueOver = () => {
        handleUndoScore();
        dispatch(setInningCompleteModal({ isShow: false }));
    };

    return (
        <Modal
            isVisible={inningCompleteModal.isShow}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
            backdropOpacity={0.6}
            animationInTiming={200}
            animationOutTiming={200}
            backdropTransitionOutTiming={0}
            coverScreen={false}
            style={styles.modal_wrapper}
        >
            <View style={styles.modal_container}>
                <Text style={styles.modal_title}>Inning complete</Text>
                <View style={styles.modal_content}>
                    <Text style={styles.inning_info}>
                        {!matchDetails?.isSuperOver &&
                            `${matchDetails?.inning1.battingTeam.name} scores ${matchDetails?.inning1.totalScore} runs`}
                        {matchDetails?.isSuperOver &&
                            `${ellipsize(
                                matchDetails?.superOver.inning1.battingTeam
                                    .name,
                                27
                            )} scores ${
                                matchDetails?.superOver.inning1.totalScore
                            } runs`}
                    </Text>
                    <TouchableOpacity
                        style={styles.start_new_inning_btn}
                        onPress={handleNavigate}
                    >
                        <Text style={styles.start_new_inning_btn_text}>
                            start next innings
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.continue_over_btn}
                    onPress={handleContinueOver}
                >
                    <Text style={styles.continue_over_btn_text}>
                        Continue This Over
                    </Text>
                </TouchableOpacity>
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
        height: normalizeVertical(320),
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
        height: normalizeVertical(165),
        justifyContent: "space-between",
        paddingVertical: normalizeVertical(25),
        paddingHorizontal: normalize(15),
        borderWidth: normalize(2),
        borderColor: "#d2d1d1",
        borderRadius: normalize(8)
    },
    inning_info: {
        fontSize: normalize(18),
        fontFamily: "ubuntuMedium",
        color: "#565656"
    },
    start_new_inning_btn: {
        backgroundColor: "#14B492",
        paddingVertical: normalizeVertical(15),

        borderRadius: normalize(8),
        elevation: 1
    },
    start_new_inning_btn_text: {
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
export default InningCompletionModal;
