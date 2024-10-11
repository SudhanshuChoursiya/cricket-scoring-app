import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    StatusBar
} from "react-native";
import { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import appLogo from "../assets/icon.png";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const HeaderComponent = ({ showSuggestions, setShowSuggestions }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const getSuggestions = async text => {
        try {
            setQuery(text);
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/get-searched-cakes?searched=${text}`
            );
            const data = await response.json();

            if (response.status === 200) {
                const titles = data.data.cakesDetails
                    .map(item => item.name.toLowerCase())
                    .filter(item => item.includes(text.toLowerCase()));
                setSuggestions(titles);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (query === "" || query === undefined) {
            setShowSuggestions(false);
        }
    }, [query, suggestions]);

    useEffect(() => {
        if (!isFocused) {
            setQuery("");
            setShowSuggestions(false);
        }
    }, [isFocused]);
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
                        value={query}
                        onChangeText={text => getSuggestions(text)}
                    />

                    <View style={styles.suggestions_box}>
                        {suggestions.length > 0 &&
                            showSuggestions &&
                            suggestions.map((suggestion, index) => (
                                <Text
                                    style={styles.suggestion}
                                    key={index}
                                    onPress={() => {
                                        setShowSuggestions(false);
                                        setQuery(suggestion);
                                    }}
                                >
                                    {suggestion}
                                </Text>
                            ))}
                    </View>
                    <TouchableOpacity
                        style={styles.search_button}
                        onPress={() =>
                            navigation.navigate("searched-cakes-screen", {
                                searchedQuery: query
                            })
                        }
                    >
                        <Icon name="search" size={20} color="white" />
                    </TouchableOpacity>
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
        height: normalize(44),
        width: normalize(44)
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

export default HeaderComponent;
