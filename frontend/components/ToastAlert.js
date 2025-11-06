import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { hideToast } from "../redux/toastSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ToastAlert = () => {
    const dispatch = useDispatch();
    const { type, message, visible } = useSelector(state => state.toast);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let timeoutId;
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();

            timeoutId = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }).start(() => {
                    dispatch(hideToast());
                });
            }, 3000);
        }
        return () => clearTimeout(timeoutId);
    }, [visible, fadeAnim, dispatch]);

    const toastData = {
        success: { name: "check-circle", color: "#14B492" },
        error: { name: "error", color: "#E21F26" },
        warning: { name: "warning", color: "#f48441" },
        info: { name: "info", color: "#007AFF" }
    };

    const { name: iconName, color: backgroundColor } =
        toastData[type] || toastData.info;

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.toast_container,
                {
                    opacity: fadeAnim,
                    backgroundColor
                }
            ]}
        >
            <Icon name={iconName} size={26} color="#f7f7f7" />
            <Text style={styles.toast_text}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toast_container: {
        position: "absolute",
        bottom: normalizeVertical(70),
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        gap: normalize(10),
        paddingVertical: normalizeVertical(10),
        paddingHorizontal: normalize(22),
        borderRadius: normalize(8),
        elevation: 1,
        zIndex: 9999
    },
    toast_text: {
        color: "#FFFFFF",
        fontSize: normalize(17),
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    }
});

export default ToastAlert;
