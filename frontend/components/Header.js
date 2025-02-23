import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Keyboard
} from "react-native";
import { useEffect, useRef } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import appLogo from "../assets/icon.png";
import { useNavigation } from "@react-navigation/native";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const Header = ({ searchQuery, setSearchQuery }) => {
    const navigation = useNavigation();
    const searchInputRef = useRef(null);

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            () => {
                if (
                    searchInputRef.current &&
                    searchInputRef.current.isFocused()
                ) {
                    searchInputRef.current.blur();
                }
            }
        );

        return () => {
            keyboardDidHideListener.remove();
        };
    }, []);
    return (
        <View style={styles.wrapper}>
            <View style={styles.top_container}>
                <View style={styles.app_logo_wrapper}>
                    <Image
                        style={styles.app_logo}
                        resizeMode="cover"
                        source={appLogo}
                    />
                    <Text style={styles.app_logo_title}>CricPro</Text>
                </View>
                <View style={styles.notification_icon_wrapper}>
                    <TouchableOpacity style={styles.bell_icon_wrepper}>
                        <Icon name="notifications" size={23} color="#f7f7f7" />

                        <View style={styles.notification_indicator}></View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchbar_wrapper}>
                <View style={styles.searchbar}>
                    <TextInput
                        style={styles.search_input}
                        placeholder="Search a match"
                        value={searchQuery}
                        onChangeText={text => setSearchQuery(text)}
                        ref={searchInputRef}
                    />

                    <View style={styles.search_button}>
                        <Icon name="search" size={20} color="white" />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#E21F26",
        justifyContent: "center",
        paddingHorizontal: normalize(10),

        height: normalizeVertical(124),
        position: "relative",
        zIndex: 2000
    },

    top_container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    app_logo_wrapper: {
        flexDirection: "row",
        alignItems: "center"
    },
    app_logo: {
        height: normalize(50),
        width: normalize(50)
    },
    app_logo_title: {
        color: "#f1f1f1",
        fontSize: normalize(24),
        marginHorizontal: normalize(8),
        fontFamily: "kittenBold",
        letterSpacing: 1,
        marginTop: normalizeVertical(10)
    },
    searchbar_wrapper: {
        position: "absolute",
        bottom: normalizeVertical(-35),
        left: normalize(20)
    },
    searchbar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: normalizeVertical(17),
        position: "relative"
    },
    search_input: {
        height: normalizeVertical(47),
        width: "95%",
        fontSize: normalize(17),
        backgroundColor: "white",
        color: "black",
        borderRadius: normalize(8),
        paddingHorizontal: normalize(11),
        fontFamily: "ubuntuMedium",
        elevation: 3
    },
    search_button: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E21F26",

        borderRadius: normalize(8),
        height: normalizeVertical(38),
        width: normalize(38),

        position: "absolute",
        right: normalize(15)
    },

    suggestions_box: {
        backgroundColor: "whitesmoke",
        width: "95%",
        position: "absolute",
        top: normalizeVertical(64),
        left: normalizeVertical(10),
        zIndex: 2,
        borderRadius: normalize(8),
        elevation: 1
    },
    suggestion: {
        fontSize: normalize(16),
        color: "#878383",
        paddingHorizontal: normalize(11),
        paddingVertical: normalizeVertical(8),
        fontFamily: "ubuntuMedium"
    },
    notification_icon_wrapper: {},
    bell_icon_wrepper: {
        position: "relative",
        marginRight: normalize(7),
        backgroundColor: "rgba(250,250,250,0.2)",
        borderRadius: normalize(7),
        paddingHorizontal: normalize(6),

        paddingVertical: normalizeVertical(6)
    },
    cart_icon_wrepper: {
        position: "relative",
        marginRight: normalize(7),
        backgroundColor: "rgba(250,250,250,0.2)",
        borderRadius: normalize(7),
        paddingHorizontal: normalize(6),

        paddingVertical: normalizeVertical(6)
    },
    notification_indicator: {
        backgroundColor: "#1A4DA1",
        borderRadius: normalize(100),
        height: normalizeVertical(8),
        width: normalize(8),
        position: "absolute",
        top: normalizeVertical(8),
        right: normalize(9)
    },
    cart_indicator: {
        backgroundColor: "#d31515",
        borderRadius: normalize(100),
        height: normalizeVertical(8),
        width: normalize(8),
        position: "absolute",
        top: normalizeVertical(8),
        right: normalize(6)
    }
});

export default Header;
