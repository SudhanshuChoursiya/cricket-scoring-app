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
import { setChangeSquadModal } from "../redux/modalSlice.js";
import { useNavigation } from "@react-navigation/native";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ChangeSquadModal = ({ matchId, matchDetails }) => {
    const changeSquadModal = useSelector(state => state.modal.changeSquadModal);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    
    const deviceWidth = Dimensions.get("window").width;

    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");

    const handleCloseModal = () => {
        dispatch(setChangeSquadModal({ isShow: false }));
    };
    const handleNavigate = teamId => {
        navigation.navigate("change-squad", {
            matchId,
            teamId
        });
        dispatch(setChangeSquadModal({ isShow: false }));
    };

    return (
        <Modal
            isVisible={changeSquadModal.isShow}
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
                        Which team squad you want to change?
                    </Text>
                    <View style={styles.select_team_wrapper}>
                        {[matchDetails?.teamA, matchDetails?.teamB].map(
                            team => (
                                <TouchableOpacity
                                    style={styles.team}
                                    onPress={() => handleNavigate(team?.teamId)}
                                    key={team?.teamId}
                                >
                                    <View style={styles.team_icon_wrapper}>
                                        <Text style={styles.team_icon_text}>
                                            {team?.name[0]}
                                        </Text>
                                    </View>
                                    <Text style={styles.team_name}>
                                        {team?.name}
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.close_btn}
                        onPress={handleCloseModal}
                    >
                        <Text style={styles.close_btn_text}>cancel</Text>
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
        fontFamily: "ubuntuBold",
        color: "#39444B",
        textAlign: "center"
    },
    modal_content: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: normalize(15),
        paddingVertical: normalizeVertical(15),
        gap: normalizeVertical(22)
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
        justifyContent: "space-between"
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
        width: normalize(80),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F54133",
        borderRadius: normalize(50),
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
        textTransform: "capitalize"
    },
    close_btn: {
        backgroundColor: "#f5f5f5",
        paddingVertical: normalizeVertical(10),
        paddingHorizontal: normalize(30),
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
export default ChangeSquadModal;
