import { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StatusBar
} from "react-native";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { setFielder } from "../redux/matchSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import CheckBox from "../components/CheckBox.js";
import { getCurrentInning } from "../utils/matchUtils.js";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useHideTabBar } from "../utils/useHideTabBar.js";
import {
    useGetMatchDetailsQuery,
    useUpdateScoreMutation
} from "../services/matchApi.js";

const HitWicketOutAssign = ({ navigation, route }) => {
    const [isWideBall, setIsWideBall] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    useHideTabBar(navigation, isScreenFocused);
    const { accessToken } = useSelector(state => state.auth);

    const { fielder } = useSelector(state => state.match);

    const { data, isLoading } = useGetMatchDetailsQuery(route.params?.matchId);

    const [updateScore, { isLoading: isUpdating }] = useUpdateScoreMutation();

    useEffect(() => {
        setIsScreenFocused(true);
        return () => setIsScreenFocused(false);
    }, []);

    const matchDetails = data?.data || null;
    const currentInningDetails = matchDetails
        ? getCurrentInning(matchDetails)
        : null;

    const strikeBatsman = currentInningDetails?.currentBatsmen?.find(
        batsman => batsman.onStrike
    );

    const handleConfirm = async () => {
        try {
            const payload = {
                ...route.params?.payload,
                isWide: isWideBall
            };

            if (
                payload.runs === undefined ||
                payload.isWide === undefined ||
                payload.isNoball === undefined ||
                payload.isBye === undefined ||
                payload.isLegBye === undefined ||
                payload.isWicket === undefined ||
                payload.isDeadBall === undefined
            ) {
                throw new Error("plz provide all the required field");
            }

            await updateScore({
                matchId: route.params?.matchId,
                payload
            }).unwrap();

            navigation.goBack();
        } catch (error) {
            console.log(error);
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
                <Text style={styles.label}>Hit wicket </Text>
            </View>
            {!isLoading ? (
                <>
                    <View style={styles.select_out_batsman_wrapper}>
                        <Text style={styles.heading}>Who</Text>
                        <View style={styles.out_batsman_wrapper}>
                            <View style={styles.out_batsman}>
                                <View style={styles.batsman_icon_wrapper}>
                                    <Text style={styles.batsman_icon_text}>
                                        {strikeBatsman?.name[0]}
                                    </Text>
                                </View>
                                <Text
                                    style={styles.batsman_name}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {strikeBatsman?.name}
                                </Text>
                                <Text style={styles.current_end}>striker</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.checkbox_wrapper}>
                        <CheckBox
                            options={{
                                label: "wide ball",
                                value: true
                            }}
                            checkedValue={isWideBall}
                            onCheck={setIsWideBall}
                        />
                    </View>

                    <View style={styles.confirm_btn_wrapper}>
                        <TouchableOpacity
                            style={styles.confirm_btn}
                            onPress={handleConfirm}
                        >
                            {!isUpdating ? (
                                <Text style={styles.confirm_btn_text}>out</Text>
                            ) : (
                                <Spinner
                                    isLoading={true}
                                    label="processing..."
                                    spinnerColor="white"
                                    labelColor="white"
                                    labelSize={19}
                                    spinnerSize={28}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
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
        paddingTop: normalizeVertical(38),
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
    },
    heading: {
        fontSize: normalize(20),
        color: "black",
        fontFamily: "robotoMedium"
    },
    select_out_batsman_wrapper: {
        justifyContent: "center",
        gap: normalizeVertical(20),
        marginHorizontal: normalize(22),
        marginVertical: normalizeVertical(25)
    },
    out_batsman_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flexStart",
        gap: normalize(20)
    },
    out_batsman: {
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(18),
        backgroundColor: "#FFFFFF",
        width: normalize(158),
        height: normalizeVertical(200),
        borderRadius: normalize(7),
        borderWidth: 2,
        borderColor: "white",
        elevation: 2
    },
    batsman_icon_wrapper: {
        height: normalize(90),
        width: normalize(91),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F54133",
        borderRadius: normalize(92 / 2),
        elevation: 1
    },
    batsman_icon_text: {
        fontSize: normalize(28),
        color: "white",
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    batsman_name: {
        width: "100%",
        paddingHorizontal: normalize(5),
        color: "black",
        fontSize: normalize(18),
        fontFamily: "robotoMedium",
        textTransform: "capitalize",
        textAlign: "center"
    },
    current_end: {
        color: "grey",
        fontSize: normalize(17),
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },
    checkbox_wrapper: {
        marginHorizontal: normalize(22),
        marginVertical: normalizeVertical(20)
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
    bg_flash_white: {
        backgroundColor: "#E7E8EA"
    }
});

export default HitWicketOutAssign;
