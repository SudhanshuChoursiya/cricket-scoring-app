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
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../redux/toastSlice.js";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Spinner from "../components/Spinner.js";
import ToastAlert from "../components/ToastAlert.js";
import { normalize, normalizeVertical } from "../utils/responsive.js";
import { useHideTabBar } from "../utils/useHideTabBar.js";
import { useAddNewPlayersMutation } from "../services/teamApi.js";

const AddNewPlayersScreen = ({ navigation, route }) => {
    const [players, setPlayers] = useState([
        {
            name: ""
        }
    ]);

    const [isScreenFocused, setIsScreenFocused] = useState(false);
    useHideTabBar(navigation, isScreenFocused);
    const { accessToken } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const playersRefs = useRef([]);

    const [addPlayers, { isLoading: isAdding }] = useAddNewPlayersMutation();

    const addPlayerInput = () => {
        setPlayers([
            ...players,
            {
                name: ""
            }
        ]);
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
        return () => setIsScreenFocused(false);
    }, []);

    const removeEmptyValueFromArray = array => {
        return array.filter(item => item.name.trim() !== "");
    };

    const HandleAddPlayers = async () => {
        const filteredPlayers = players.filter(item => item.name.trim() !== "");
        if (filteredPlayers.length === 0) {
            dispatch(
                showToast({
                    type: "error",
                    message: "Add at least one player"
                })
            );
            return;
        }
        try {
            await addPlayers({
                teamId: route.params.teamId,
                players: filteredPlayers
            }).unwrap();

            navigation.goBack();
        } catch (error) {
            console.log(error);
            dispatch(
                showToast({
                    type: "error",
                    message:
                        error?.data?.message ||
                        "Unexpected error occurred, try again later"
                })
            );
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
                <Text style={styles.label}>add new players</Text>
            </View>

            <ScrollView
                vertical={true}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps={"handled"}
            >
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
                    disabled={isAdding}
                >
                    {!isAdding ? (
                        <Text style={styles.add_to_team_btn_text}>
                            add to team
                        </Text>
                    ) : (
                        <Spinner
                            isLoading={isAdding}
                            label="adding..."
                            spinnerColor="white"
                            labelColor="white"
                            labelSize={19}
                            spinnerSize={28}
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
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
    add_players_wrapper: {
        marginTop: normalizeVertical(30),
        marginBottom: normalizeVertical(82)
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
        height: normalizeVertical(60),
        justifyContent: "center",
        alignItems: "center"
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
