import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { normalize, normalizeVertical } from "../utils/responsive.js";
const CheckBox = ({ options, checkedValue, onCheck }) => {
    return (
        <View style={styles.wrapper}>
            <TouchableOpacity onPress={() => onCheck(!checkedValue)}>
                {checkedValue ? (
                    <Icon
                        name="check"
                        size={normalize(24)}
                        style={styles.check_box_active}
                    />
                ) : (
                    <Icon
                        name="check-box-outline-blank"
                        size={normalize(24)}
                        color="#E21F26"
                    />
                )}
            </TouchableOpacity>
            <Text style={styles.label}>{options.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(8)
    },
    check_box_active: {
        backgroundColor: "#E21F26",
        borderRadius: normalize(5),
        color: "white"
    },
    label: {
        fontSize: normalize(18),
        fontFamily: "robotoMedium",
    }
});

export default CheckBox;
