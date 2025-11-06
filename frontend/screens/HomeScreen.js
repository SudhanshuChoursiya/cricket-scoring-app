import { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    View,
    Keyboard,
    TouchableWithoutFeedback,
    BackHandler
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Header from "../components/Header.js";
import MatchesScreen from "./MatchesScreen.js";
import TournamentsScreen from "./TournamentsScreen.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const TopTab = createMaterialTopTabNavigator();

const HomeTopTabs = ({ setActiveTab }) => {
    return (
        <TopTab.Navigator
            screenOptions={{
                tabBarStyle: { backgroundColor: "#E21F26" },
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "#d9b0ac",
                tabBarIndicatorStyle: {
                    backgroundColor: "#FFBC01",
                    height: normalizeVertical(6)
                },
                tabBarLabelStyle: {
                    fontSize: normalize(17),
                    fontFamily: "ubuntuMedium"
                }
            }}
        >
            <TopTab.Screen
                name="matches"
                component={MatchesScreen}
                listeners={{
                    focus: () => setActiveTab("matches")
                }}
            />
            <TopTab.Screen
                name="tournaments"
                component={TournamentsScreen}
                listeners={{
                    focus: () => setActiveTab("tournaments")
                }}
            />
        </TopTab.Navigator>
    );
};

const HomeScreen = () => {
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [activeTab, setActiveTab] = useState("matches");
    const navigation = useNavigation();

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => backHandler.remove();
        }, [isScreenFocused])
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.wrapper}>
                <Header activeTab={activeTab} />
                <View style={styles.topTabsWrapper}>
                    <HomeTopTabs setActiveTab={setActiveTab} />
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#F2F2F2"
    },
    topTabsWrapper: {
        flex: 1
    }
});

export default HomeScreen;
