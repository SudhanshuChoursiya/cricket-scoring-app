import { useState } from "react";
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
import { showToast } from "../redux/toastSlice.js";
import { useNavigation } from "@react-navigation/native";
import ExtraDimensions from "react-native-extra-dimensions-android";
import Modal from "react-native-modal";
import Spinner from "./Spinner.js";
import CheckBox from "../components/CheckBox.js";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useEndMatchMutation } from "../services/matchApi.js";

const EndMatchModal = ({ matchId, matchDetails }) => {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isMatchAbandoned, setIsMatchAbandoned] = useState(false);

    const { activeModal, payload } = useSelector(state => state.modal);

    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [endMatch, { isLoading: isMatchEnding }] = useEndMatchMutation();

    const deviceWidth = Dimensions.get("window").width;
    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");

    const handleCloseModal = () => {
        dispatch(closeModal());
        if (isMatchAbandoned) {
            setIsMatchAbandoned(false);
        }
        setSelectedTeam(null);
    };

    const handleConfirmModal = async () => {
        if (!selectedTeam && !isMatchAbandoned) {
            dispatch(
                showToast({
                    type: "error",
                    message:
                        "Please select winning team or check Match Abandoned"
                })
            );
            return;
        }

        try {
            const payload = {
                matchId,
                isMatchAbandoned
            };

            if (!isMatchAbandoned && selectedTeam)
                payload.winningTeamId = selectedTeam.teamId;
            if (matchDetails?.tournamentId){
                payload.tournamentId = matchDetails.tournamentId;
}
            await endMatch(payload).unwrap();
            dispatch(
                showToast({
                    type: "success",
                    message: "Match ended successfully"
                })
            );

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
            handleCloseModal();
        } catch (error) {
          console.log(error)
            dispatch(
                showToast({
                    type: "error",
                    message: error?.data?.message
                })
            );
        }
    };

    return (
        <Modal
            isVisible={activeModal === "endMatch"}
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
                    <Text style={styles.modal_title}>
                        Which Team won the match?
                    </Text>
                    <View style={styles.select_team_wrapper}>
                        {[matchDetails?.teamA, matchDetails?.teamB].map(
                            (team, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.team,
                                        selectedTeam?.teamId === team?.teamId &&
                                            styles.selected
                                    ]}
                                    onPress={() => {
                                        setSelectedTeam(team);
                                        if (isMatchAbandoned)
                                            setIsMatchAbandoned(false);
                                    }}
                                >
                                    <View style={styles.team_icon_wrapper}>
                                        <Text style={styles.team_icon_text}>
                                            {team?.name[0]}
                                        </Text>
                                    </View>
                                    <Text style={styles.team_name}>
                                        {ellipsize(team?.name, 24)}
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>

                    <View style={styles.checkbox_wrapper}>
                        <CheckBox
                            options={{ label: "Match Abandoned", value: true }}
                            checkedValue={isMatchAbandoned}
                            onCheck={value => {
                                setIsMatchAbandoned(value);
                                if (value) setSelectedTeam(null);
                            }}
                        />
                    </View>
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
                        disabled={isMatchEnding}
                    >
                        <Text style={styles.ok_button_text}>ok</Text>
                        {isMatchEnding && (
                            <Spinner
                                isLoading={true}
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
        width: normalize(320),
        backgroundColor: "white",
        borderRadius: normalize(10),
        paddingTop: normalizeVertical(20),
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
        paddingVertical: normalizeVertical(15),
        gap: normalizeVertical(30)
    },
    modal_desc: {
        fontSize: normalize(18),
        fontFamily: "ubuntuRegular",
        color: "#A8ACAF",
        textAlign: "center"
    },
    select_team_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: normalize(15)
    },
    team: {
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
    team_icon_wrapper: {
        height: normalize(80),
        width: normalize(81),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F54133",
        borderRadius: normalize(82 / 2),
        elevation: 1
    },
    team_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    team_name: {
        color: "black",
        fontSize: normalize(18),
        fontFamily: "robotoMedium",
        textTransform: "capitalize",
        textAlign: "center"
    },
    checkbox_wrapper: {
        marginHorizontal: normalize(18)
    },
    modal_btn_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: normalizeVertical(22)
    },
    cancel_button: {
        width: "50%",
        height: normalizeVertical(60),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F2F2",
        borderBottomLeftRadius: normalize(10)
    },
    ok_button: {
        width: "50%",
        height: normalizeVertical(60),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: normalize(10),
        backgroundColor: "#14B492",
        borderBottomRightRadius: normalize(10)
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
    },
    selected: {
        borderWidth: 2,
        borderColor: "#14B391"
    }
});
export default EndMatchModal;
