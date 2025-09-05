import "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
SplashScreen.preventAutoHideAsync();
import * as React from "react";
import {
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet
} from "react-native";
import {
  useFonts
} from "expo-font";
// Font imports
import kittenBold from "./assets/KittenBold.ttf";
import ubuntuRegular from "./assets/Ubuntu-Regular.ttf";
import ubuntuMedium from "./assets/Ubuntu-Medium.ttf";
import ubuntuBold from "./assets/Ubuntu-Bold.ttf";
import robotoRegular from "./assets/Roboto-Regular.ttf";
import robotoMedium from "./assets/Roboto-Medium.ttf";
import robotoBold from "./assets/Roboto-Bold.ttf";
import poppinsBold from "./assets/Poppins-Bold.ttf";
import latoBold from "./assets/Lato-Bold.ttf";

import {
  NavigationContainer,
  useRoute
} from "@react-navigation/native";
import {
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs";
import {
  createMaterialTopTabNavigator
} from "@react-navigation/material-top-tabs";
import {
  createStackNavigator
} from "@react-navigation/stack";

import ReduxProvider from "./redux/Provider.js";
import ToastAlert from "./components/ToastAlert.js";

import Icon from "react-native-vector-icons/MaterialIcons";

import HomeScreen from "./screens/HomeScreen.js";
import ProfileScreen from "./screens/ProfileScreen.js";
import SignInScreen from "./screens/SignInScreen.js";
import SelectTwoTeamScreen from "./screens/SelectTwoTeamScreen.js";
import ChooseTeamScreen from "./screens/ChooseTeamsScreen.js";
import AddTeamScreen from "./screens/AddTeamScreen.js";
import TeamSquadScreen from "./screens/TeamSquadScreen.js";
import AddNewPlayersScreen from "./screens/AddNewPlayersScreen.js";
import CreateMatchScreen from "./screens/CreateMatchScreen.js";
import TossScreen from "./screens/TossScreen.js";
import InitialPlayersAssignScreen from "./screens/InitialPlayersAssignScreen.js";
import SelectInitialPlayerScreen from "./screens/SelectInitialPlayerScreen.js";
import ManageScoreBoardScreen from "./screens/ManageScoreBoard.js";
import SelectNewBowler from "./screens/SelectNewBowler.js";
import SelectNewBatsman from "./screens/SelectNewBatsman.js";
import CaughtOutFielderAssign from "./screens/CaughtOutFielderAssign.js";
import RunOutFielderAssign from "./screens/RunOutFielderAssign.js";
import RetiredHurtAssign from "./screens/RetiredHurtAssign.js";
import RetiredOutAssign from "./screens/RetiredOutAssign.js";
import HitWicketOutAssign from "./screens/HitWicketOutAssign.js";
import SelectFielder from "./screens/SelectFielder.js";
import SelectCaptain from "./screens/SelectCaptain.js";
import ChangeSquad from "./screens/ChangeSquad.js";
import SelectReplacementPlayer from "./screens/SelectReplacementPlayer.js";

import {
  useDispatch,
  useSelector
} from "react-redux";
import {
  fetchAuth
} from "./redux/authSlice.js";
import {
  normalize,
  normalizeVertical
} from "./utils/responsive.js";



const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

const CustomHeader = ({
  title, navigation, route
}) => {
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

function TopTabNavigator() {
  const route = useRoute();
  return (
    <TopTab.Navigator
      screenOptions={ {
        tabBarStyle: { backgroundColor: "#E21F26" },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#d9b0ac",
        tabBarIndicatorStyle: {
          backgroundColor: "#FFBC01",
          height: normalizeVertical(7)
        },
        tabBarLabelStyle: {
          fontSize: normalize(17),
          fontFamily: "ubuntuMedium"
        }
      }}
      >
      <TopTab.Screen
        name="my teams"
        initialParams={route.params}
        component={ChooseTeamScreen}
        />
      <TopTab.Screen name="add team" component={AddTeamScreen} />
    </TopTab.Navigator>
  );
}

function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={ { headerShown: false }}>
      <Stack.Screen name="home-screen" component={HomeScreen} />
      <Stack.Screen name="select-teams" component={SelectTwoTeamScreen} />
      <Stack.Screen
        name="choose-team"
        component={TopTabNavigator}
        options={({ navigation, route }) => ({
          headerShown: true,
          header: () => (
            <CustomHeader title="Select" navigation={navigation} route={route} />
          )
        })}
        />
      <Stack.Screen name="team-squad" component={TeamSquadScreen} />
      <Stack.Screen name="add-players" component={AddNewPlayersScreen} />
      <Stack.Screen name="select-captain" component={SelectCaptain} />
      <Stack.Screen name="create-match" component={CreateMatchScreen} />
      <Stack.Screen name="toss-screen" component={TossScreen} />
      <Stack.Screen name="initial-players-assign-screen" component={InitialPlayersAssignScreen} />
      <Stack.Screen name="select-initial-player-screen" component={SelectInitialPlayerScreen} />
      <Stack.Screen name="manage-scoreboard" component={ManageScoreBoardScreen}
        />
      <Stack.Screen name="select-new-bowler" component={SelectNewBowler} />
      <Stack.Screen name="select-new-batsman" component={SelectNewBatsman} />
      <Stack.Screen name="caught-out-fielder-assign" component={CaughtOutFielderAssign} />
      <Stack.Screen name="run-out-fielder-assign" component={RunOutFielderAssign} />
      <Stack.Screen name="retired-hurt-assign" component={RetiredHurtAssign} />
      <Stack.Screen name="retired-out-assign" component={RetiredOutAssign} />
      <Stack.Screen name="hit-wicket-out-assign" component={HitWicketOutAssign} />
      <Stack.Screen name="select-fielder" component={SelectFielder} />
      <Stack.Screen name="change-squad" component={ChangeSquad} />
      <Stack.Screen name="select-replacement-player" component={SelectReplacementPlayer} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={ {
        headerShown: false,
        tabBarActiveTintColor: "#E21F26",
        tabBarStyle: {
          position: "absolute",
          height: normalizeVertical(60),
        },
      }}
      >
      <Tab.Screen
        name="home"
        component={StackNavigator}
        options={ {
          tabBarLabel: ({ color }) => (
            <Text style={ { color, fontFamily: "ubuntuMedium", fontSize: normalize(16) }}>
              Home
            </Text>
          ),
          tabBarIcon: ({
            color, size
          }) => <Icon name="home" size={size} color={color} />
        }}
        />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={ {
          tabBarLabel: ({ color }) => (
            <Text style={ { color, fontFamily: "ubuntuMedium", fontSize: normalize(16) }}>
              Profile
            </Text>
          ),
          tabBarIcon: ({
            color, size
          }) => (
            <Icon name="account-circle" size={size} color={color} />
          )
        }}
        />
    </Tab.Navigator>
  );
}

export const Layout = () => {
  const [appReady,
    setAppReady] = React.useState(false);
  const [fontsLoaded] = useFonts( {
    ubuntuRegular,
    ubuntuMedium,
    ubuntuBold,
    robotoRegular,
    robotoMedium,
    robotoBold,
    kittenBold,
    poppinsBold,
    latoBold,
  });

  const dispatch = useDispatch();
  const {
    isLoading,
    isLoggedin
  } = useSelector((state) => state.auth);

  React.useEffect(() => {
    dispatch(fetchAuth());
  }, []);

  React.useEffect(() => {
    if (fontsLoaded && !isLoading) {
      setAppReady(true);
    }
  },
    [fontsLoaded,
      isLoading]);

  const onLayoutRootView = React.useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  },
    [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaView style={ { flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <NavigationContainer>
        {!isLoggedin ? (
          <Stack.Navigator screenOptions={ { headerShown: false }}>
            <Stack.Screen name="signInScreen" component={SignInScreen} />
          </Stack.Navigator>
        ): (
          <TabNavigator />
        )}
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <ReduxProvider>
      <ToastAlert />
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
      gap: normalize(15),
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