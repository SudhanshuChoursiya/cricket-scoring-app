import React, { useEffect } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { hideToast } from "../redux/toastSlice.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const ToastAlert = () => {
    const dispatch = useDispatch();
    const { message, visible } = useSelector(state => state.toast);
    const fadeAnim = new Animated.Value(0);

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
            }, 2500);
        }
        return () => clearTimeout(timeoutId);
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.toast_container, { opacity: fadeAnim }]}>
            <Text style={styles.toast_text}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toast_container: {
        position: "absolute",
        bottom: normalizeVertical(70),
        alignSelf: "center",
        backgroundColor: "#B43427",
        paddingVertical: normalizeVertical(11),
        paddingHorizontal: normalize(22),
        borderRadius: normalize(8),
        elevation: 1,
        zIndex: 9999
    },
    toast_text: {
        color: "#FFFFFF",
        fontSize: normalize(17),
        textTransform: "capitalize",
    }
});

export default ToastAlert;
