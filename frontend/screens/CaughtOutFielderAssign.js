import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    StatusBar
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { setFielder } from "../redux/matchSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";

import Spinner from "../components/Spinner.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import { getCurrentInning } from "../utils/matchUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const CaughtOutFielderAssign = ({ navigation, route }) => {
    const [currentInningDetails, setCurrentInningDetails] = useState(null);
    const [outBastman, setOutBatsman] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();
    const { accessToken } = useSelector(state => state.auth);

    const { fielder } = useSelector(state => state.match);

    useEffect(() => {
        setIsScreenFocused(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: "none" }
            });

            return () => {
                navigation.getParent()?.setOptions({
                    tabBarStyle: { display: "flex" }
                });
            };
        }, [isScreenFocused])
    );

    useFocusEffect(
        useCallback(() => {
            const getMatchDetails = async () => {
                try {
                    const response = await fetch(
                        `${process.env.EXPO_PUBLIC_BASE_URL}/get-match-details/${route.params?.matchId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        }
                    );

                    const data = await response.json();

                    if (response.status === 200) {
                        currentInning = getCurrentInning(data.data);
                setCurrentInningDetails(currentInning);

                        setOutBatsman(
                            currentInning.currentBatsmen.find(
                                player => player.onStrike
                            )
                        );
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            };
            getMatchDetails();
        }, [isScreenFocused])
    );

    const handleConfirm = async () => {
        try {
            setShowSpinner(true);
            const payload = {
                ...route.params?.payload,
                fielderId: fielder.playerId
            };

            if (
                payload.runs === undefined ||
                payload.isWide === undefined ||
                payload.isNoball === undefined ||
                payload.isBye === undefined ||
                payload.isLegBye === undefined ||
                payload.isWicket === undefined
            ) {
                throw new Error("plz provide all the required field");
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/update-score/${route.params?.matchId}`,

                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();
            if (response.status !== 200) {
                throw new Error(data.message);
            } else {
                navigation.navigate("manage-scoreboard", {
                    matchId: route.params?.matchId
                });

                dispatch(setFielder({ playerId: null, name: null }));
            }
        } catch (error) {
            console.log(error);
        } finally {
            setShowSpinner(false);
        }
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.back_btn}
                    onPress={() => navigation.goBack()}
                >
                    <Icon
                        name="arrow-back"
                        size={normalize(26)}
                        color="white"
                    />
                </TouchableOpacity>
                <Text style={styles.label}>
                    {route.params?.payload.outMethod} out
                </Text>
            </View>

            {!isLoading ? (
                <>
                    <View style={styles.out_batsman_wrapper}>
                        <Text style={styles.heading}>Who</Text>

                        <View style={styles.out_batsman}>
                            <View style={styles.batsman_icon_wrapper}>
                                <Text style={styles.batsman_icon_text}>
                                    {outBastman.name && outBastman.name[0]}
                                </Text>
                            </View>
                            <Text style={styles.batsman_name}>
                                {outBastman.name && outBastman.name}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.select_fielder_wrapper}>
                        <Text style={styles.heading}>Select Fielder</Text>

                        {!fielder.playerId ? (
                            <TouchableOpacity
                                style={styles.fielder}
                                onPress={() =>
                                    navigation.navigate("select-fielder", {
                                        matchId: route.params?.matchId,

                                        payload: route.params?.payload
                                    })
                                }
                            >
                                <View
                                    style={[
                                        styles.fielder_icon_wrapper,
                                        !fielder.playerId &&
                                            styles.bg_flash_white
                                    ]}
                                >
                                    <Icon
                                        name="add"
                                        size={normalize(34)}
                                        color="black"
                                    />
                                </View>
                                <Text style={styles.fielder_name}>fielder</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.fielder}
                                onPress={() =>
                                    navigation.navigate("select-fielder", {
                                        matchId: route.params?.matchId,
                                        payload: route.params?.payload
                                    })
                                }
                            >
                                <View style={styles.fielder_icon_wrapper}>
                                    <Text style={styles.fielder_icon_text}>
                                        {fielder.name && fielder.name[0]}
                                    </Text>
                                </View>
                                <Text style={styles.fielder_name}>
                                    {fielder.name && fielder.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {fielder.playerId && (
                        <View style={styles.confirm_btn_wrapper}>
                            <TouchableOpacity
                                style={styles.confirm_btn}
                                onPress={handleConfirm}
                            >
                                {!showSpinner ? (
                                    <Text style={styles.confirm_btn_text}>
                                        out
                                    </Text>
                                ) : (
                                    <Spinner
                                        isLoading={showSpinner}
                                        label="processing..."
                                        spinnerColor="white"
                                        labelColor="white"
                                        labelSize={19}
                                        spinnerSize={28}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            ) : (
                <LoadingSpinner />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#F2F2F2",
        width: "100%"
    },
    header: {
        paddingTop: normalizeVertical(50),
        paddingBottom: normalizeVertical(20),
        backgroundColor: "#E21F26",
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(20),
        paddingHorizontal: normalize(20)
    },
    label: {
        fontSize: normalize(20),
        color: "white",
        paddingHorizontal: normalize(13),
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    },
    heading: {
        fontSize: normalize(20),
        color: "black",
        fontFamily: "robotoMedium"
    },

    out_batsman_wrapper: {
        gap: normalizeVertical(20),
        marginHorizontal: normalize(22),
        marginVertical: normalizeVertical(30)
    },
    out_batsman: {
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(18),
        backgroundColor: "#FFFFFF",
        width: normalize(155),
        height: normalizeVertical(210),
        borderRadius: normalize(7),
        borderWidth: 2,
        borderColor: "white",
        elevation: 2
    },

    batsman_icon_wrapper: {
        height: normalize(90),
        width: normalize(90),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F54133",
        borderRadius: normalize(50),
        elevation: 1
    },
    batsman_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    batsman_name: {
        color: "black",
        fontSize: normalize(18),
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    select_fielder_wrapper: {
        gap: normalizeVertical(20),
        marginHorizontal: normalize(22),
        marginVertical: normalizeVertical(30)
    },

    fielder: {
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(18),
        backgroundColor: "#FFFFFF",
        width: normalize(155),
        height: normalizeVertical(210),
        borderRadius: normalize(7),
        borderWidth: 2,
        borderColor: "white",
        elevation: 2
    },
    fielder_icon_wrapper: {
        height: normalize(90),
        width: normalize(90),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F54133",
        borderRadius: normalize(50),
        elevation: 1
    },
    fielder_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    fielder_name: {
        color: "black",
        fontSize: normalize(18),
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    confirm_btn_wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0
    },
    confirm_btn: {
        backgroundColor: "#14B391",
        height: normalizeVertical(60),
        justifyContent: "center",
        alignItems: "center"
    },
    confirm_btn_text: {
        fontSize: normalize(19),
        textAlign: "center",
        color: "white",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    },
    selected: {
        borderWidth: 2,
        borderColor: "#14B391"
    },
    bg_flash_white: {
        backgroundColor: "#E7E8EA"
    }
});

export default CaughtOutFielderAssign;
