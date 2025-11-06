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
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../redux/modalSlice.js";
import { useNavigation } from "@react-navigation/native";
import ExtraDimensions from "react-native-extra-dimensions-android";
import Modal from "react-native-modal";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const MatchCompletionModal = ({ matchDetails, handleUndoScore }) => {
    const { activeModal, payload } = useSelector(state => state.modal);

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const deviceWidth = Dimensions.get("window").width;

    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");

    const handleNavigate = () => {
        if (matchDetails?.tournamentId) {
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: "tournament-matches",
                        params: {
                            tournamentId: matchDetails.tournamentId,
                            tournamentName: matchDetails?.tournamentName
                        }
                    }
                ]
            });
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: "home-screen" }]
            });
        }
        dispatch(closeModal());
    };

    const handleContinueOver = () => {
        handleUndoScore();

        dispatch(closeModal());
    };

    return (
        <Modal
            isVisible={activeModal === "matchCompletion"}
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
                <Text style={styles.modal_title}>Match Completed</Text>
                <View style={styles.modal_content}>
                    <Text style={styles.modal_info}>
                        {matchDetails?.matchStatus === "completed" &&
                            matchDetails?.matchResult &&
                            (matchDetails.matchResult.status === "Win"
                                ? `${ellipsize(
                                      matchDetails.matchResult.winningTeam,
                                      24
                                  )} won by ${
                                      matchDetails.matchResult.winningMargin
                                  }`
                                : matchDetails.matchResult.status === "Tie"
                                ? "Match Tied"
                                : matchDetails.matchResult.status ===
                                  "Super Over"
                                ? `${ellipsize(
                                      matchDetails.matchResult.winningTeam,
                                      24
                                  )} won the super over`
                                : matchDetails.matchResult.status ===
                                  "Super Over Tie"
                                ? "Super Over Tied"
                                : "")}
                    </Text>
                    <TouchableOpacity
                        style={styles.start_new_inning_btn}
                        onPress={handleNavigate}
                    >
                        <Text style={styles.start_new_inning_btn_text}>
                            End Match
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
    modal_info: {
        fontSize: normalize(18),
        fontFamily: "ubuntuMedium",
        color: "#565656",
        textTransform: "capitalize"
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
export default MatchCompletionModal;
