import { StyleSheet, Text, View, StatusBar } from "react-native";

import Spinner from "./Spinner.js";

import { normalize, normalizeVertical } from "../utils/responsive.js";

const LoadingSpinner = ({ isLoading, spinnerColor, spinnerSize }) => {
    return (
        <View style={styles.loading_spinner_wrapper}>
            <Spinner
                isLoading={isLoading ? isLoading : true}
                spinnerColor={spinnerColor ? spinnerColor : "#2c3e50"}
                spinnerSize={spinnerSize ? spinnerSize : normalize(80)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    loading_spinner_wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
});

export default LoadingSpinner;
