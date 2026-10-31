import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Ionicons from "@expo/vector-icons/Ionicons";

const NetworkStatusBanner = () => {
    const [status, setStatus] = useState("online");
    const previousStatus = useRef("online");
    const timerRef = useRef(null);

    const translateY = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const isOnline =
                state.isConnected === true &&
                state.isInternetReachable !== false;

            const nextStatus = isOnline ? "online" : "offline";

            if (nextStatus === previousStatus.current) {
                return;
            }

            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            previousStatus.current = nextStatus;

            if (nextStatus === "offline") {
                setStatus("offline");
            } else {
                setStatus("restored");

                timerRef.current = setTimeout(() => {
                    setStatus("online");
                }, 2500);
            }
        });

        return () => {
            unsubscribe();

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: status === "online" ? -100 : 0,
            useNativeDriver: true,
            tension: 80,
            friction: 12
        }).start();
    }, [status, translateY]);

    if (status === "online") {
        return null;
    }

    const isOffline = status === "offline";

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.container,
                {
                    backgroundColor: isOffline ? "#B91C1C" : "#15803D",
                    transform: [{ translateY }]
                }
            ]}
        >
            <Ionicons
                name={
                    isOffline ? "cloud-offline-outline" : "cloud-done-outline"
                }
                size={23}
                color="#FFFFFF"
            />

            <View style={styles.content}>
                <Text style={styles.title}>
                    {isOffline
                        ? "No Internet Connection"
                        : "Connection Restored"}
                </Text>

                <Text style={styles.subtitle}>
                    {isOffline
                        ? "Check your internet connection."
                        : "You're back online. Reconnecting..."}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: Platform.OS === "ios" ? 50 : 8,
        left: 12,
        right: 12,
        zIndex: 9999,
        elevation: 20,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderRadius: 12,
        gap: 12
    },
    content: {
        flex: 1
    },
    title: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700"
    },
    subtitle: {
        color: "#FEE2E2",
        fontSize: 11,
        marginTop: 3
    }
});

export default NetworkStatusBanner;
