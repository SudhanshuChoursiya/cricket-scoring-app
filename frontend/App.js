import "react-native-gesture-handler";
import * as React from "react";

import {
    Text,
    View,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    StyleSheet
} from "react-native";
import { useFonts } from "expo-font";
//fonts imports
import kittenBold from "./assets/KittenBold.ttf";
import ubuntuRegular from "./assets/Ubuntu-Regular.ttf";
import ubuntuMedium from "./assets/Ubuntu-Medium.ttf";
import ubuntuBold from "./assets/Ubuntu-Bold.ttf";

import robotoRegular from "./assets/Roboto-Regular.ttf";
import robotoMedium from "./assets/Roboto-Medium.ttf";
import robotoBold from "./assets/Roboto-Bold.ttf";

import poppinsBold from "./assets/Poppins-Bold.ttf";
import latoBold from "./assets/Lato-Bold.ttf";

import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { createStackNavigator } from "@react-navigation/stack";
import ReduxProvider from "./redux/Provider.js";
const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();

import Icon from "react-native-vector-icons/MaterialIcons";

import HomeScreen from "./screens/HomeScreen.js";

import ProfileScreen from "./screens/ProfileScreen.js";

import SignInScreen from "./screens/SignInScreen.js";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuth } from "./redux/authSlice.js";
import { normalize, normalizeVertical } from "./utils/responsive.js";
SplashScreen.preventAutoHideAsync();

const CustomHeader = ({ title, navigation, route }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.back_btn}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={normalize(26)} color="white" />
            </TouchableOpacity>
            <Text style={styles.label}>
                {title} {route.params.selectFor}
            </Text>
        </View>
    );
};

function StackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home-screen" component={HomeScreen} />
        </Stack.Navigator>
    );
}

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#E21F26"
            }}
        >
            <Tab.Screen
                name="home"
                component={StackNavigator}
                options={{
                    tabBarLabel: ({ color }) => (
                        <Text
                            style={{
                                color: color,
                                fontFamily: "ubuntuMedium",
                                fontSize: normalize(16)
                            }}
                        >
                            Home
                        </Text>
                    ),
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" size={size} color={color} />
                    )
                }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: ({ color }) => (
                        <Text
                            style={{
                                color: color,
                                fontFamily: "ubuntuMedium",
                                fontSize: normalize(16)
                            }}
                        >
                            Profile
                        </Text>
                    ),
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-circle" size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
}

export const Layout = () => {
    const [fontsLoaded] = useFonts({
        ubuntuRegular,
        ubuntuMedium,
        ubuntuBold,
        robotoRegular,
        robotoMedium,
        robotoBold,
        kittenBold,
        poppinsBold,
        latoBold
    });

    const dispatch = useDispatch();
    const { isLoading, isLoggedin, user } = useSelector(state => state.auth);

    React.useEffect(() => {
        dispatch(fetchAuth());
    }, []);

    const onLayoutRootView = React.useCallback(async () => {
        if (!isLoading) {
            await SplashScreen.hideAsync();
        }
    }, [isLoading]);

    if (!fontsLoaded) {
        return null;
    }

    if (isLoading) {
        return null;
    }

    return (
        <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <NavigationContainer>
                {!isLoggedin ? (
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen
                            name="signInScreen"
                            component={SignInScreen}
                        />
                    </Stack.Navigator>
                ) : (
                    <TabNavigator />
                )}
            </NavigationContainer>
        </SafeAreaView>
    );
};

export default function App() {
    return (
        <ReduxProvider>
            <Layout />
        </ReduxProvider>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: normalizeVertical(50),
        paddingBottom: normalizeVertical(20),
        backgroundColor: "#E21F26",
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(45),
        paddingHorizontal: normalize(20)
    },
    label: {
        fontSize: normalize(20),
        color: "white",
        paddingHorizontal: normalize(13),
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    }
});
