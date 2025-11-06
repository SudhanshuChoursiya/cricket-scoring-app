import { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    StatusBar,
    TouchableOpacity
} from "react-native";
import { useDispatch } from "react-redux";
import { fetchAuth } from "../redux/authSlice.js";
import { useFocusEffect } from "@react-navigation/native";
import {
    GoogleSignin,
    statusCodes
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import prviewImg from "../assets/preview.png";
import googleIconImg from "../assets/google-icon.png";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useLoginWithGoogleMutation } from "../services/authApi.js";

const SignInScreen = () => {
    const dispatch = useDispatch();
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    const [loginWithGoogle, { isLoading }] = useLoginWithGoogleMutation();

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            StatusBar.setBarStyle("light-content");
            return () => {
                StatusBar.setBarStyle("default");
            };
        }, [isScreenFocused])
    );

    useEffect(() => {
        configureSignIn();
    }, []);

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

            const data = await loginWithGoogle(
                userInfo.serverAuthCode
            ).unwrap();

            // Save tokens
            await AsyncStorage.setItem("accessToken", data.data.accessToken);
            await AsyncStorage.setItem("refreshToken", data.data.refreshToken);

            // Refresh auth state
            dispatch(fetchAuth());
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled login
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // sign in already in progress
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available
            } else {
                console.log("Login error:", error);
            }
        }
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.img_wrapper}>
                <Image source={prviewImg} style={styles.prview_img} />
            </View>

            <View style={styles.other_details_wrapper}>
                <View style={styles.welcome_paragraph_container}>
                    <Text style={styles.welcome_paragraph}>
                        Welcome to{" "}
                        <Text style={styles.brown_text}>CricPro </Text>
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
                    <Text style={styles.signin_btn_text}>
                        Sign in with Google
                    </Text>
                </TouchableOpacity>

                <View style={styles.tagline_container}>
                    <Text style={styles.tagline}>
                        Keep The Score — Live The Game
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "flex-start"
    },
    img_wrapper: {
        flex: 1,
        width: "100%",
        borderBottomLeftRadius: normalizeVertical(75),
        borderBottomRightRadius: normalizeVertical(75),
        overflow: "hidden",
        elevation: 2
    },
    prview_img: {
        width: "100%",
        height: "100%",
        resizeMode: "cover"
    },
    other_details_wrapper: {
        flex: 1,
        width: "100%",
        paddingHorizontal: normalize(20),
        alignItems: "center",
        justifyContent: "space-evenly"
    },
    welcome_paragraph_container: {
        width: "90%"
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
        width: "95%"
    },
    about_us_paragraph: {
        fontSize: normalize(17),
        color: "#8d8989",
        textAlign: "center",
        fontFamily: "ubuntuRegular"
    },
    btn_wraaper: {
        width: "90%",
        height: normalizeVertical(46),
        backgroundColor: "#E21F26",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: normalize(25),
        elevation: 2
    },
    google_icon: {
        height: normalize(25),
        width: normalize(25)
    },
    signin_btn_text: {
        color: "white",
        fontSize: normalize(18),
        fontFamily: "robotoBold",
        marginLeft: normalize(10)
    },
    tagline_container: {
        width: "85%"
    },
    tagline: {
        fontSize: normalize(17),
        color: "#424242",
        textAlign: "center",
        fontFamily: "robotoBold"
    }
});

export default SignInScreen;
