import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
    TouchableWithoutFeedback
} from "react-native";
import React, { useEffect, useRef } from "react";
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
    const sidebarAnim = useRef(new Animated.Value(-250)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(sidebarAnim, {
            toValue: showSidebar ? 0 : -250,
            duration: 200,
            useNativeDriver: false
        }).start();

        Animated.timing(overlayOpacity, {
            toValue: showSidebar ? 1 : 0,
            duration: 200,
            useNativeDriver: false
        }).start();
    }, [showSidebar]);

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
        <>
            {/* Overlay */}
            {showSidebar && (
                <TouchableWithoutFeedback onPress={() => setShowSidebar(false)}>
                    <Animated.View
                        style={[styles.overlay, { opacity: overlayOpacity }]}
                    />
                </TouchableWithoutFeedback>
            )}

            {/* Sidebar */}
            <Animated.View style={[styles.sidebar, { right: sidebarAnim }]}>
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
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 9
    },
    sidebar: {
        marginTop: StatusBar.currentHeight,
        position: "absolute",
        top: 0,
        right: normalize(-250),
        width: normalize(250),
        height: "100%",
        backgroundColor: "#fff",
        elevation: 5,
        paddingVertical: normalizeVertical(20),
        paddingHorizontal: normalize(20),
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
