import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import { useDispatch } from "react-redux";
import { showAlert } from "../redux/alertSlice.js";

import AlertToast from "../components/AlertToast.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const AddNewPlayersScreen = ({ navigation, route }) => {
    const [players, setPlayers] = useState([{ name: "" }]);
    const [teamId, setTeamId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [showSpinner, setShowSpinner] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const dispatch = useDispatch();
    const playersRefs = useRef([]);
    const scrollViewRef = useRef();

    const addPlayerInput = () => {
        setPlayers([...players, { name: "" }]);
    };

    const removePlayerInput = index => {
        const existedInputs = [...players];
        existedInputs.splice(index, 1);
        setPlayers(existedInputs);
    };

    const handlePlayerChange = (text, index) => {
        let updatedInputs = [...players];

        updatedInputs[index].name = text;
        setPlayers(updatedInputs);
    };

    const removeEmptyValueFromArray = array => {
        return array.filter(item => item.name.trim() !== "");
    };

    useEffect(() => {
        let playerSetTimeoutId;

        if (playersRefs.current.length > 0 && players.length > 1) {
            playerSetTimeoutId = setTimeout(() => {
                playersRefs.current[players.length - 1]?.focus();
            }, 0);
        }

        return () => clearTimeout(playerSetTimeoutId);
    }, [players.length]);

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

    const HandleAddPlayers = async () => {
        try {
            setShowSpinner(true);
            const filteredPlayers = await removeEmptyValueFromArray(players);

            if (filteredPlayers.length === 0) {
                scrollViewRef.current.scrollTo({ y: 0, animated: true });
                dispatch(
                    showAlert({
                        value: true,
                        severity: "error",
                        type: "normal_alert",
                        msg: "add atleast one player"
                    })
                );
                return;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/add-new-players/${route.params.teamId}`,

                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ players: filteredPlayers })
                }
            );

            const data = await response.json();

            if (response.status !== 200) {
                scrollViewRef.current.scrollTo({ y: 0, animated: true });
                dispatch(
                    showAlert({
                        value: true,
                        severity: "error",
                        type: "normal_alert",
                        msg: data.message
                    })
                );
            } else {
                scrollViewRef.current.scrollTo({ y: 0, animated: true });
                dispatch(
                    showAlert({
                        value: true,
                        severity: "success",
                        type: "normal_alert",
                        msg: data.message
                    })
                );
            }
        } catch (error) {
            console.log(error);
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
            dispatch(
                showAlert({
                    value: true,
                    severity: "error",
                    type: "normal_alert",
                    msg: "unexpected error occured,please try again latter"
                })
            );
        } finally {
            setShowSpinner(false);
        }
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView
                vertical={true}
                showsVerticalScrollIndicator={true}
                ref={scrollViewRef}
                keyboardShouldPersistTaps={"handled"}
            >
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
                    <Text style={styles.label}>add new players</Text>
                </View>

                <View style={styles.add_players_wrapper}>
                    {players.map((player, index) => (
                        <View style={styles.dynamic_input_wrapper} key={index}>
                            <View style={styles.serial_no_container}>
                                <Text style={styles.serial_no}>
                                    {index + 1}
                                </Text>
                            </View>
                            <TextInput
                                style={styles.player_input}
                                value={player.name}
                                onChangeText={text =>
                                    handlePlayerChange(text, index)
                                }
                                ref={el => (playersRefs.current[index] = el)}
                            />

                            <TouchableOpacity
                                style={styles.remove_button}
                                onPress={() => removePlayerInput(index)}
                            >
                                <Icon
                                    name="cancel"
                                    size={normalize(25)}
                                    color="#E21F26"
                                />
                            </TouchableOpacity>
                        </View>
                    ))}

                    <View style={styles.add_input_btn_wrapper}>
                        <TouchableOpacity
                            style={styles.plus_button}
                            onPress={addPlayerInput}
                        >
                            <Icon
                                name="add"
                                size={normalize(22)}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.add_to_team_btn_wrapper}>
                <TouchableOpacity
                    style={styles.add_to_team_btn}
                    onPress={HandleAddPlayers}
                >
                    {!showSpinner ? (
                        <Text style={styles.add_to_team_btn_text}>
                            add to team
                        </Text>
                    ) : (
                        <Spinner
                            isLoading={showSpinner}
                            label="adding..."
                            spinnerColor="white"
                            labelColor="white"
                            labelSize={19}
                            spinnerSize={28}
                        />
                    )}
                </TouchableOpacity>
            </View>
            <AlertToast
                topOffSet={15}
                successToastStyle={{ borderLeftColor: "green" }}
                errorToastStyle={{ borderLeftColor: "red" }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        width: "100%"
    },
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
    },

    add_players_wrapper: {
        marginVertical: normalizeVertical(30)
    },
    dynamic_input_wrapper: {
        width: "88%",
        marginHorizontal: "auto",
        flexDirection: "row",
        paddingBottom: normalizeVertical(20),
        position: "relative"
    },
    serial_no_container: {
        backgroundColor: "#1A4DA1",
        borderRadius: normalize(8),
        height: normalizeVertical(45),
        width: normalize(35),
        justifyContent: "center",
        alignItems: "center",
        marginRight: normalize(6),
        position: "absolute",
        top: normalize(1),
        left: normalize(1),
        zIndex: 1
    },
    serial_no: {
        fontSize: normalize(15),
        color: "white",
        fontFamily: "robotoBold"
    },

    player_input: {
        height: normalizeVertical(45),
        flex: 1,
        backgroundColor: "white",
        color: "#474646",
        borderRadius: normalize(8),
        paddingLeft: normalize(42),
        paddingRight: normalize(9),
        fontSize: normalize(17),
        fontFamily: "latoBold"
    },
    add_input_btn_wrapper: {
        width: "88%",
        marginHorizontal: "auto",
        alignItems: "flex-end"
    },

    plus_button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A4DA1",
        height: normalizeVertical(45),
        width: normalize(45),

        borderRadius: normalize(8)
    },
    remove_button: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        borderRadius: normalize(8),
        height: normalizeVertical(45),
        width: normalize(45),
        marginLeft: normalize(11)
    },
    add_to_team_btn_wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0
    },
    add_to_team_btn: {
        backgroundColor: "#14B391",
        paddingVertical: normalizeVertical(18)
    },
    add_to_team_btn_text: {
        fontSize: normalize(19),
        textAlign: "center",
        color: "white",
        textTransform: "capitalize",
        fontFamily: "robotoBold"
    }
});

export default AddNewPlayersScreen;
