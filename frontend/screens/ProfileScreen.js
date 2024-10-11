import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuth } from "../redux/authSlice.js";

import { normalize, normalizeVertical } from "../utils/responsive.js";
import Svg, { Path } from "react-native-svg";
const ProfileScreen = ({ navigation }) => {
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();
    const { isLoading, isLoggedin, user } = useSelector(state => state.auth);

    useEffect(() => {
        setIsScreenFocused(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            StatusBar.setBarStyle("dark-content");
            return () => {
                StatusBar.setBarStyle("default");
            };
        }, [isScreenFocused])
    );
    const logoutUser = async () => {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");

        await GoogleSignin.signOut();
        dispatch(fetchAuth());
    };

    useEffect(() => {
        const configureSignIn = () => {
            GoogleSignin.configure({
                webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,

                iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
                androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
                offlineAccess: true
            });
        };
        configureSignIn();
    }, []);

    const menuList = [
        {
            menuName: "update address",
            menuIconName: "place",
            action: () => {
                navigation.navigate("update-address");
            }
        },
        {
            menuName: "notifications",
            menuIconName: "notifications",
            action: () => {
                navigation.navigate("add-cake");
            }
        },
        {
            menuName: "my orders",
            menuIconName: "receipt-long",
            action: () => {
                navigation.navigate("my-orders");
            }
        },
        {
            menuName: "orders delivered",
            menuIconName: "task-alt",
            action: () => {
                navigation.navigate("orders-delivered");
            }
        },
        {
            menuName: "add cake",
            menuIconName: "add-circle",
            action: () => {
                navigation.navigate("add-cake");
            }
        },
        {
            menuName: "manage cake",
            menuIconName: "cake",
            action: () => {
                navigation.navigate("manage-cake");
            }
        },
        {
            menuName: "logout",
            menuIconName: "exit-to-app",
            action: logoutUser
        }
    ];

    const filteredMenuList = user.is_admin
        ? menuList
        : menuList.filter(
              menu => !["add cake", "manage cake"].includes(menu.menuName)
          );

    return (
        <View style={styles.wrapper}>
            <View style={styles.profile_img_section}>
                <Text style={styles.page_title}>profile</Text>

                <View style={styles.profile_img_wrapper}>
                    <Image
                        source={{ uri: user.picture }}
                        style={styles.profile_img}
                    />
                </View>

                <Svg viewBox="0 0 1440 320" style={styles.curve_background}>
                    <Path
                        fill="#F3F3F3"
                        fill-opacity="1"
                        d="M0,128L60,117.3C120,107,240,85,360,96C480,107,600,149,720,149.3C840,149,960,107,1080,96C1200,85,1320,107,1380,117.3L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
                    ></Path>
                </Svg>
            </View>
            <View style={styles.profile_details_section}>
                <View style={styles.profile_detail}>
                    <Text style={styles.username}>{user.name}</Text>
                </View>

                <View style={styles.profile_detail}>
                    <Text style={styles.email}>{user.email}</Text>
                </View>
            </View>

            <View style={styles.others_page_link_section}>
                {filteredMenuList.map((menu, index) => (
                    <TouchableOpacity
                        style={styles.page_link}
                        onPress={menu.action}
                        key={index}
                    >
                        <View style={styles.page_link_first_half}>
                            <Icon
                                name={menu.menuIconName}
                                size={23}
                                style={
                                    menu.menuName === "logout"
                                        ? [
                                              styles.page_link_icon,
                                              styles.icon_red
                                          ]
                                        : styles.page_link_icon
                                }
                            />
                            <Text
                                style={
                                    menu.menuName === "logout"
                                        ? [
                                              styles.page_link_text,
                                              styles.text_red
                                          ]
                                        : styles.page_link_text
                                }
                            >
                                {menu.menuName}
                            </Text>
                        </View>
                        {menu.menuName !== "logout" && (
                            <View style={styles.page_link_second_half}>
                                <Icon
                                    name="chevron-right"
                                    size={23}
                                    style={styles.page_link_icon}
                                />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "white"
    },
    profile_img_section: {
        paddingTop: normalizeVertical(35),
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(18),
        width: "100%",
        height: normalizeVertical(240),
        position: "relative",
        backgroundColor: "#F3F3F3"
    },
    page_title: {
        fontSize: normalize(20),
        fontFamily: "robotoBold",
        textTransform: "capitalize"
    },
    curve_background: {
        height: normalizeVertical(100),
        width: "100%",
        position: "absolute",
        top: normalizeVertical(230)
    },
    profile_img_wrapper: {
        backgroundColor: "white",
        height: normalize(130),
        width: normalize(130),
        borderRadius: normalize(100),
        padding: normalize(7)
    },
    profile_img: {
        height: "100%",
        width: "100%",
        borderRadius: normalize(100)
    },
    profile_details_section: {
        alignItems: "center",
        marginTop: normalizeVertical(50)
    },
    profile_detail: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: normalizeVertical(10)
    },

    username: {
        fontSize: normalize(23),
        fontFamily: "robotoBold"
    },
    email: {
        fontSize: normalize(17),
        fontFamily: "ubuntuRegular"
    },
    others_page_link_section: {
        marginVertical: normalizeVertical(30)
    },

    page_link: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        backgroundColor: "#F3F3F3",
        borderRadius: normalize(15),

        paddingHorizontal: normalize(15),
        paddingVertical: normalizeVertical(10),
        marginHorizontal: normalize(18),
        marginBottom: normalizeVertical(25),
        elevation: 1
    },
    page_link_first_half: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(8)
    },

    page_link_text: {
        fontSize: normalize(17),
        textTransform: "capitalize",
        fontFamily: "robotoBold",
        color: "grey"
    },
    page_link_icon: {
        color: "grey"
    },
    text_red: {
        color: "#ee4848"
    },
    icon_red: {
        color: "#ee4848"
    }
});

export default ProfileScreen;
