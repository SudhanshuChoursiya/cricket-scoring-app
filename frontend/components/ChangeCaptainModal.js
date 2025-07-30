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
import { setChangeCaptainModal } from "../redux/modalSlice.js";
import { showToast } from "../redux/toastSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "./Spinner.js";
import { useNavigation } from "@react-navigation/native";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ChangeCaptainModal = ({
    matchId,
    teamId,
    player,
    showSpinner,
    setShowSpinner
}) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const deviceWidth = Dimensions.get("window").width;

    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");
    const changeCaptainModal = useSelector(
        state => state.modal.changeCaptainModal
    );
    const { accessToken } = useSelector(state => state.auth);

    const handleCloseModal = () => {
        dispatch(setChangeCaptainModal({ isShow: false, player: null }));
        setShowSpinner(false);
    };

    const handleConfirmModal = async () => {
        try {
            setShowSpinner(true);
            if (!matchId || !teamId || !player) {
                dispatch(
                    showToast({
                        type: "error",
                        message: "please provide all required field"
                    })
                );
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/change-captain/${matchId}`,

                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ teamId, captainId: player.playerId })
                }
            );

            const data = await response.json();
            if (response.status !== 200) {
                dispatch(showToast(data.message));
            } else {
                dispatch(setChangeCaptainModal({ isShow: false }));
            }
        } catch (error) {
            console.log(error);
        } finally {
            setShowSpinner(false);
        }
    };
    return (
        <Modal
            isVisible={changeCaptainModal.isShow}
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
                <Text style={styles.modal_title}>change captain</Text>

                <View style={styles.modal_content}>
                    <View style={styles.player}>
                        <View style={styles.player_details}>
                            <View style={styles.player_icon}>
                                <Text style={styles.player_icon_text}>
                                    {player?.name[0]}
                                </Text>
                            </View>

                            <View style={styles.other_player_info_wrapper}>
                                <Text style={styles.player_name}>
                                    {ellipsize(player?.name, 26)}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.modal_info}>
                        Are you sure to make this player captain?
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
        height: normalizeVertical(310),
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
        paddingTop: normalizeVertical(24),
        fontSize: normalize(22),
        fontFamily: "robotoBold",
        textTransform: "capitalize"
    },
    modal_content: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        gap: normalizeVertical(15),
        paddingHorizontal: normalize(20),
        paddingVertical: normalizeVertical(24)
    },
    player: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        marginHorizontal: "auto",
        paddingHorizontal: normalize(10),
        paddingVertical: normalizeVertical(10),

        borderWidth: 1,
        borderColor: "#d4d4d4"
    },
    player_details: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(18)
    },
    player_icon: {
        backgroundColor: "#f75454",
        height: normalize(60),
        width: normalize(60),
        borderRadius: normalize(30),
        justifyContent: "center",
        alignItems: "center",
        elevation: 1
    },
    player_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },

    player_name: {
        fontSize: normalize(18),
        color: "#474646",
        textTransform: "capitalize",
        fontFamily: "ubuntuMedium"
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
export default ChangeCaptainModal;
