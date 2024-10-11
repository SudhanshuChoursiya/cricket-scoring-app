import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Pressable,
    StatusBar
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import Header from "../components/Header.js";

import { normalize, normalizeVertical } from "../utils/responsive.js";

const HomeScreen = ({ navigation }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={"handled"}
            style={styles.screen_wrapper}
        >
            <Pressable
                onPressOut={() => {
                    showSuggestions === true && setShowSuggestions(false);
                }}
            >
                <View>
                    <Header
                        showSuggestions={showSuggestions}
                        setShowSuggestions={setShowSuggestions}
                    />

                    <View style={styles.section_wrapper}>
                        <TouchableOpacity style={styles.create_new_match_btn} onPress={()=>navigation.navigate("select-teams")}>
                            <Text style={styles.create_new_match_btn_text}>
                                create new match
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen_wrapper: {
        flex: 1,
        backgroundColor: "#FFFFFF"
    },
    section_wrapper: {
        marginTop: normalizeVertical(22),
        marginBottom: normalizeVertical(8),
        zIndex: -1
    },
    create_new_match_btn: {
        backgroundColor: "#1A4DA1",
       marginVertical: normalizeVertical(25),
       marginHorizontal: normalize(18),
        paddingHorizontal: normalize(5),
        paddingVertical: normalizeVertical(15),
        borderRadius: normalize(12),
    },
    create_new_match_btn_text: {
        fontSize: normalize(18),
        textAlign: "center",
        color: "white",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    }
});

export default HomeScreen;
