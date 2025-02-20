import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Platform
} from "react-native";
import React, { useEffect, useRef } from "react";
import Modal from "react-native-modal";
import ExtraDimensions from "react-native-extra-dimensions-android";
import { useDispatch } from "react-redux";
import {
    setReplaceBatsmanModal,
    setReplaceBowlerModal,
    setChangeSquadModal,
    setEndInningModal,
    setEndMatchModal
} from "../redux/modalSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const Sidebar = ({ currentInning, showSidebar, setShowSidebar }) => {
    const dispatch = useDispatch();
    const deviceWidth = Dimensions.get("window").width;

    const deviceHeight =
        Platform.OS === "ios"
            ? Dimensions.get("window").height
            : ExtraDimensions.get("REAL_WINDOW_HEIGHT");

    const handleCloseSideBar = () => {
        setShowSidebar(false);
    };

    const handleLinkPress = link => {
        setShowSidebar(false);
        if (link === "replaceBatsman") {
            dispatch(setReplaceBatsmanModal({ isShow: true }));
        }
        if (link === "replaceBowler") {
            dispatch(setReplaceBowlerModal({ isShow: true }));
        }
        if (link === "changeSquad") {
            dispatch(setChangeSquadModal({ isShow: true }));
        }
        if (link === "endInning") {
            dispatch(setEndInningModal({ isShow: true }));
        }
        if (link === "endMatch") {
            dispatch(setEndMatchModal({ isShow: true }));
        }
    };

    return (
        <Modal
            isVisible={showSidebar}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
            backdropOpacity={0.6}
            animationIn="slideInRight"
            animationOut="slideOutRight"
            animationInTiming={200}
            animationOutTiming={200}
            onBackdropPress={handleCloseSideBar}
            onBackButtonPress={handleCloseSideBar}
            backdropTransitionOutTiming={0}
            coverScreen={false}
            style={styles.modal_wrapper}
        >
            <View style={styles.sidebar_container}>
                <View style={styles.cross_btn_wrapper}>
                    <TouchableOpacity
                        style={styles.cross_btn}
                        onPress={() => setShowSidebar(false)}
                    >
                        <Icon name="close" size={normalize(26)} color="#333" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={styles.sidebar_link}
                    onPress={() => handleLinkPress("replaceBatsman")}
                >
                    <Text style={styles.sidebar_link_text}>
                        replace batsman
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.sidebar_link}
                    onPress={() => handleLinkPress("replaceBowler")}
                >
                    <Text style={styles.sidebar_link_text}>replace bowler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sidebar_link}
                    onPress={() => handleLinkPress("changeSquad")}
                >
                    <Text style={styles.sidebar_link_text}>change squad</Text>
                </TouchableOpacity>
                {currentInning !== 2 && (
                    <TouchableOpacity
                        style={styles.sidebar_link}
                        onPress={() => handleLinkPress("endInning")}
                    >
                        <Text style={styles.sidebar_link_text}>
                            end innings
                        </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.sidebar_link}
                    onPress={() => handleLinkPress("endMatch")}
                >
                    <Text style={styles.sidebar_link_text}>end match</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal_wrapper: {
        flex: 1,
        position: "relative",
        margin: 0,
        marginTop: StatusBar.currentHeight
    },
    sidebar_container: {
        width: normalize(250),
        height: "100%",
        backgroundColor: "#FFFFFF",
        position: "absolute",
        top: 0,
        right: 0,
        paddingVertical: normalizeVertical(20),
        paddingHorizontal: normalize(20),
        elevation: 5,
        zIndex: 10
    },
    cross_btn_wrapper: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: normalizeVertical(10)
    },
    cross_btn: {
        backgroundColor: "#F2F2F2",
        height: normalize(30),
        width: normalize(30),
        borderRadius: normalize(5),
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#333",
        elevation: 1
    },
    sidebar_link: {
        marginBottom: normalizeVertical(20)
    },
    sidebar_link_text: {
        fontSize: normalize(19),
        color: "#333",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    }
});

export default Sidebar;
