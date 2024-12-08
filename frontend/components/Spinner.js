import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const Spinner = ({
    isLoading,
    label,
    spinnerColor,
    labelColor,
    spinnerSize,
    labelSize,
    fontFamily
}) => {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: normalize(7)
            }}
        >
            {label && (
                <Text
                    style={{
                        fontSize: labelSize
                            ? normalize(labelSize)
                            : normalize(15),
                        color: labelColor ? labelColor : "black",

                        fontFamily: fontFamily ? fontFamily : "robotoBold",
                        textTransform: "capitalize"
                    }}
                >
                    {label}
                </Text>
            )}

            <ActivityIndicator
                size={spinnerSize ? normalize(spinnerSize) : "small"}
                color={spinnerColor ? spinnerColor : "#0000ff"}
                animating={isLoading}
            />
        </View>
    );
};

export default Spinner;
