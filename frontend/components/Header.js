import { useState, useEffect, useRef } from "react";
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
import { useDispatch } from "react-redux";
import { openModal } from "../redux/modalSlice.js";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import appLogo from "../assets/icon.png";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const Header = ({activeTab}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
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

    const handleSearchPress = () => {
        navigation.navigate("search-screen", { activeTab });
    };

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

                <TouchableOpacity
                    style={styles.search_icon_wrapper}
                    onPress={handleSearchPress}
                >
                    <Icon name="search" size={23} color="#f7f7f7" />
                </TouchableOpacity>
            </View>

            {/* <View style={styles.searchbar_wrapper}>
                <View style={styles.bar}>
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
            </View>*/}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: "#E21F26",
        justifyContent: "center",
        paddingHorizontal: normalize(10),
        borderBottomWidth: 1,
        borderBottomColor: "#E21F26",
        position: "relative"
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
    search_icon_wrapper: {
        position: "relative",
        marginRight: normalize(7),
        backgroundColor: "rgba(250,250,250,0.2)",
        borderRadius: normalize(7),
        paddingHorizontal: normalize(8),
        paddingVertical: normalizeVertical(6)
    }
});

export default Header;
