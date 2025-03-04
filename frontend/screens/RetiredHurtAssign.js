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
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { setFielder } from "../redux/matchSlice.js";
import Icon from "react-native-vector-icons/MaterialIcons";

import Spinner from "../components/Spinner.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import CheckBox from "../components/CheckBox.js";
import { getCurrentInning } from "../utils/matchUtils.js";
import { ellipsize } from "../utils/textUtils.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const RetiredHurtAssign = ({ navigation, route }) => {
    const [currentInningDetails, setCurrentInningDetails] = useState(null);
    const [outEnd, setOutEnd] = useState(null);
    const [deliveryType, setDeliveryType] = useState(null);
    const [runScored, setRunScored] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
    const [runsInput, setRunsInput] = useState({ isShow: false, value: "" });
    const [isDeadBall, setIsDeadBall] = useState(false);
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
                        const currentInning = getCurrentInning(data.data);
                        setCurrentInningDetails(currentInning);
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
                outEnd: outEnd,
                isDeadBall: isDeadBall
            };
            if (runScored) {
                payload.runs = Number(runScored);
            }

            if (runsInput.value.trim() !== "") {
                payload.runs = Number(runsInput.value);
            }

            if (deliveryType === "WD") {
                payload.isWide = true;
            }
            if (deliveryType === "NB") {
                payload.isNoBall = true;
            }
            if (deliveryType === "BY") {
                payload.isBye = true;
            }
            if (deliveryType === "LB") {
                payload.isLegBye = true;
            }

            if (
                payload.runs === undefined ||
                payload.isWide === undefined ||
                payload.isNoball === undefined ||
                payload.isBye === undefined ||
                payload.isLegBye === undefined ||
                payload.isWicket === undefined ||
                !outEnd
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
                <Text style={styles.label}>retired hurt</Text>
            </View>
            {!isLoading ? (
                <>
                    <View style={styles.select_out_batsman_wrapper}>
                        <Text style={styles.heading}>Who</Text>
                        <View style={styles.out_batsman_wrapper}>
                            {currentInningDetails?.currentBatsmen?.map(
                                batsman => (
                                    <TouchableOpacity
                                        style={[
                                            styles.out_batsman,
                                            outEnd ===
                                                (batsman.onStrike
                                                    ? "striker"
                                                    : "nonStriker") &&
                                                styles.selected
                                        ]}
                                        key={batsman._id}
                                        onPress={() =>
                                            setOutEnd(
                                                batsman.onStrike
                                                    ? "striker"
                                                    : "nonStriker"
                                            )
                                        }
                                    >
                                        <View
                                            style={styles.batsman_icon_wrapper}
                                        >
                                            <Text
                                                style={styles.batsman_icon_text}
                                            >
                                                {batsman?.name[0]}
                                            </Text>
                                        </View>
                                        <Text style={styles.batsman_name}>
                                            {ellipsize(batsman?.name, 28)}
                                        </Text>
                                        <Text style={styles.current_end}>
                                            {batsman.onStrike
                                                ? "striker"
                                                : "non striker"}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </View>
                    {!isDeadBall && (
                        <>
                            <View style={styles.select_ball_type_wrapper}>
                                <Text style={styles.heading}>
                                    Delivery Type
                                </Text>
                                <View style={styles.ball_type_wrapper}>
                                    {["WD", "NB", "LB", "BY"].map(
                                        (ball, index) => (
                                            <TouchableOpacity
                                                style={[
                                                    styles.ball_type,
                                                    deliveryType === ball &&
                                                        styles.selected
                                                ]}
                                                key={index}
                                                onPress={() =>
                                                    setDeliveryType(
                                                        deliveryType === ball
                                                            ? null
                                                            : ball
                                                    )
                                                }
                                            >
                                                <Text style={styles.ball_name}>
                                                    {ball}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    )}
                                </View>
                            </View>

                            <View style={styles.select_runs_scored_wrapper}>
                                <Text style={styles.heading}>Runs Scored</Text>
                                <View style={styles.runs_scored_wrapper}>
                                    {[0, 1, 2, 3, 4, "+"].map((run, index) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.runs_scored,
                                                runScored === run &&
                                                    styles.selected
                                            ]}
                                            key={index}
                                            onPress={() => {
                                                run === "+"
                                                    ? setRunsInput({
                                                          isShow: true
                                                      })
                                                    : setRunsInput({
                                                          isShow: false,
                                                          value: ""
                                                      });
                                                setRunScored(
                                                    runScored === run
                                                        ? null
                                                        : run
                                                );
                                            }}
                                        >
                                            <Text style={styles.run_name}>
                                                {run}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    {runsInput.isShow && (
                                        <TextInput
                                            style={styles.runs_input}
                                            keyboardType="numeric"
                                            value={runsInput.value}
                                            onChangeText={text =>
                                                setRunsInput(preVal => ({
                                                    ...preVal,
                                                    value: text
                                                }))
                                            }
                                        />
                                    )}
                                </View>
                            </View>
                        </>
                    )}
                    <View style={styles.checkbox_wrapper}>
                        <CheckBox
                            options={{
                                label: "*ball don’t count",
                                value: true
                            }}
                            checkedValue={isDeadBall}
                            onCheck={setIsDeadBall}
                        />
                    </View>
                    {outEnd && (
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

    select_out_batsman_wrapper: {
        justifyContent: "center",
        gap: normalizeVertical(20),
        marginHorizontal: normalize(22),
        marginVertical: normalizeVertical(25)
    },
    out_batsman_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: normalize(20)
    },
    out_batsman: {
        alignItems: "center",
        justifyContent: "center",
        gap: normalizeVertical(18),
        backgroundColor: "#FFFFFF",
        width: normalize(158),
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
        borderRadius: normalize(45),
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
    current_end: {
        color: "grey",
        fontSize: normalize(17),
        fontFamily: "robotoMedium",
        textTransform: "capitalize"
    },

    select_ball_type_wrapper: {
        justifyContent: "center",
        gap: normalizeVertical(20),
        marginHorizontal: normalize(22),
        marginVertical: normalizeVertical(20)
    },
    ball_type_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(15)
    },
    ball_type: {
        height: normalizeVertical(42),
        width: normalize(70),
        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "white",
        borderRadius: normalize(15),
        borderWidth: 2,
        borderColor: "white",
        elevation: 1
    },
    ball_name: {
        color: "black",
        fontSize: normalize(17),
        fontFamily: "robotoMedium"
    },
    select_runs_scored_wrapper: {
        justifyContent: "center",
        gap: normalizeVertical(20),
        marginHorizontal: normalize(22),
        marginVertical: normalizeVertical(20)
    },
    runs_scored_wrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(10)
    },
    runs_scored: {
        height: normalizeVertical(40),
        width: normalize(40),
        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "white",
        borderRadius: normalize(15),
        borderWidth: 2,
        borderColor: "white",
        elevation: 1
    },
    run_name: {
        color: "black",
        fontSize: normalize(17),
        fontFamily: "robotoRegular"
    },
    runs_input: {
        width: normalize(45),
        borderWidth: 1.1,
        borderColor: "black",
        borderRadius: normalize(5),
        paddingHorizontal: normalize(10)
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
    selected: {
        borderWidth: 2,
        borderColor: "#14B391"
    },
    bg_flash_white: {
        backgroundColor: "#E7E8EA"
    }
});

export default RetiredHurtAssign;
