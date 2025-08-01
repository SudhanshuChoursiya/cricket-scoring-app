import {
    StyleSheet,
    Text,
    View,
    Image,
    StatusBar,
    TouchableOpacity
} from "react-native";
import {
    GoogleSignin,
    statusCodes
} from "@react-native-google-signin/google-signin";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useEffect, useCallback } from "react";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import prviewImg from "../assets/preview.png";

import googleIconImg from "../assets/google-icon.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuth } from "../redux/authSlice.js";

const SignInScreen = () => {
    const dispatch = useDispatch();

    const [isScreenFocused, setIsScreenFocused] = useState(false);
    useEffect(() => {
        setIsScreenFocused(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            StatusBar.setBarStyle("light-content");
            return () => {
                StatusBar.setBarStyle("default");
            };
        }, [isScreenFocused])
    );

    const configureSignIn = () => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,

            iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
            androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
            offlineAccess: true
        });
    };

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ authCode: userInfo.serverAuthCode })
                }
            );
            const data = await response.json();

            if (response.status === 200) {
                await AsyncStorage.setItem(
                    "accessToken",
                    data.data.accessToken
                );

                await AsyncStorage.setItem(
                    "refreshToken",
                    data.data.refreshToken
                );
                dispatch(fetchAuth());
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                // some other error happened
                console.log(error);
            }
        }
    };

    useEffect(() => {
        configureSignIn();
    }, []);

    return (
        <View style={styles.wrapper}>
            <View style={styles.img_wrapper}>
                <Image source={prviewImg} style={styles.prview_img} />
            </View>

            <View style={styles.welcome_paragraph_container}>
                <Text style={styles.welcome_paragraph}>
                    Welcome to <Text style={styles.brown_text}>CricPro </Text>
                    Your hub for live cricket scoring!
                </Text>
            </View>

            <View style={styles.about_us_paragraph_container}>
                <Text style={styles.about_us_paragraph}>
                    CricPro is your ultimate app for live cricket scoring.
                    Update match scores in real-time and keep your audience
                    informed with every moment of the game.
                </Text>
            </View>

            <TouchableOpacity style={styles.btn_wraaper} onPress={signIn}>
                <Image source={googleIconImg} style={styles.google_icon} />
                <Text style={styles.signin_btn_text}>Sign in with Google</Text>
            </TouchableOpacity>
            <View style={styles.tagline_container}>
                <Text style={styles.tagline}>
                    Keep The Score — Live The Game
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "white"
    },
    img_wrapper: {
        width: "100%",
        height: "50%",
        borderBottomLeftRadius: normalizeVertical(75),
        borderBottomRightRadius: normalizeVertical(75),
        overflow: "hidden",
        elevation: 2
    },
    prview_img: {
        resizeMode: "cover",
        width: "100%",
        height: "100%"
    },
    welcome_paragraph_container: {
        marginVertical: normalizeVertical(28),
        width: "75%"
    },
    welcome_paragraph: {
        textAlign: "center",
        fontSize: normalize(24),
        fontFamily: "poppinsBold"
    },
    brown_text: {
        color: "#864912"
    },
    about_us_paragraph_container: {
        width: "85%"
    },
    about_us_paragraph: {
        fontSize: normalize(17),
        color: "#8d8989",
        textAlign: "center",
        fontFamily: "ubuntuRegular"
    },
    tagline_container: {
        width: "85%"
    },
    tagline: {
        fontSize: normalize(17),
        color: "#424242",
        textAlign: "center",
        fontFamily: "robotoBold"
    },
    btn_wraaper: {
        width: "85%",
        height: normalizeVertical(45),
        backgroundColor: "#E21F26",
        color: "white",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: normalize(25),
        marginVertical: normalizeVertical(30),
        elevation: 2
    },
    google_icon: {
        height: normalize(25),
        width: normalize(25)
    },
    signin_btn_text: {
        color: "white",
        fontSize: normalize(18),
        fontFamily: "poppinsBold",
        fontWeight: "bold",
        marginLeft: normalize(10)
    }
});

export default SignInScreen;
