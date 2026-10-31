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
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useEndMatchMutation } from "../services/matchApi.js";
import Spinner from "./Spinner.js";

const MatchCompletionModal = ({
    matchDetails,
    handleUndoScore,
    isMatchResultReady
}) => {
    const { activeModal } = useSelector(state => state.modal);

    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [isEnding, setIsEnding] = useState(false);

    const [endMatch, { isLoading: isMatchEnding }] = useEndMatchMutation();

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

    const handleEndMatch = async () => {
        if (isEnding || isMatchEnding) return;

        const matchId = matchDetails?._id || matchDetails?.matchId;

        if (!matchId) {
            dispatch(
                showToast({
                    type: "error",
                    message: "Match ID not found"
                })
            );
            return;
        }

        const matchResult = matchDetails?.matchResult;
        const winningTeamName = matchResult?.winningTeam;

        // Find the winning team from the match details.
        const winningTeam = [matchDetails?.teamA, matchDetails?.teamB].find(
            team =>
                team?.name && winningTeamName && team.name === winningTeamName
        );

        // A normal win or Super Over win must have a matching team.
        if (
            (matchResult?.status === "Win" ||
                matchResult?.status === "Super Over") &&
            !winningTeam?.teamId
        ) {
            dispatch(
                showToast({
                    type: "error",
                    message:
                        "Winning team could not be identified. Please check match details."
                })
            );
            return;
        }

        setIsEnding(true);

        try {
            const payload = {
                matchId,
                isMatchAbandoned: false
            };

            if (winningTeam?.teamId) {
                payload.winningTeamId = winningTeam.teamId;
            }

            const response = await endMatch(payload).unwrap();

            dispatch(
                showToast({
                    type: "success",
                    message: response?.message || "Match ended successfully"
                })
            );

            handleNavigate();
        } catch (error) {
            console.log("End match API error:", error?.data || error);

            dispatch(
                showToast({
                    type: "error",
                    message:
                        error?.data?.message ||
                        error?.error ||
                        "Failed to end match. Please try again."
                })
            );
        } finally {
            setIsEnding(false);
        }
    };

    const handleContinueOver = () => {
        if (handleUndoScore) {
            handleUndoScore();
        }

        dispatch(closeModal());
    };

    const isLoading = isEnding || isMatchEnding;

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
                        {isMatchResultReady && matchDetails?.matchResult
                            ? matchDetails.matchResult.status === "Win"
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
                                : "Match Completed"
                            : "Match Completed"}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.start_new_inning_btn,
                            isLoading && styles.disabled_button
                        ]}
                        onPress={handleEndMatch}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Spinner
                                isLoading={true}
                                spinnerColor="white"
                                spinnerSize={24}
                            />
                        ) : (
                            <Text style={styles.start_new_inning_btn_text}>
                                End Match
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.continue_over_btn,
                        isLoading && styles.disabled_button
                    ]}
                    onPress={handleContinueOver}
                    disabled={isLoading}
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
        elevation: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: normalizeVertical(50)
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
        elevation: 1,
        alignItems: "center"
    },
    continue_over_btn_text: {
        color: "#AF2B1C",
        fontSize: normalize(17),
        fontFamily: "ubuntuMedium",
        textTransform: "uppercase",
        textAlign: "center"
    },
    disabled_button: {
        opacity: 0.6
    }
});

export default MatchCompletionModal;
