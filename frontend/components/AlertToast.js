import { useState, useEffect } from "react";
import { View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { clearAlert } from "../redux/alertSlice.js";

import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const AlertToast = ({ topOffSet, successToastStyle, errorToastStyle }) => {
    const [showToast, setShowToast] = useState(false);
    const dispatch = useDispatch();

    const showAlert = useSelector(state => state.alert.alertToast);

    useEffect(() => {
        if (showAlert.type === "normal_alert") {
            setShowToast(true);
        }
    }, [showAlert]);

    useEffect(() => {
        if (showAlert.value && showToast) {
            Toast.show({
                type: showAlert.severity,
                text1: showAlert.msg
            });
        }

        const timeout = setTimeout(() => {
            dispatch(clearAlert());
        }, 3000);

        return () => {
            setShowToast(false);
            clearTimeout(timeout);
        };
    }, [showToast]);

    const toastConfig = {
        success: props => (
            <BaseToast
                {...props}
                style={successToastStyle}
                contentContainerStyle={{ paddingHorizontal: normalize(15) }}
                text1Style={{
                    fontSize: normalize(15),
                    textTransform: "capitalize"
                }}
            />
        ),

        error: props => (
            <ErrorToast
                {...props}
                style={errorToastStyle}
                contentContainerStyle={{ paddingHorizontal: normalize(15) }}
                text1Style={{
                    fontSize: normalize(15),
                    textTransform: "capitalize"
                }}
                text2Style={{
                    fontSize: normalize(15),
                    textTransform: "capitalize"
                }}
            />
        )
    };

    return (
        <Toast
            config={toastConfig}
            swipeable={false}
            topOffset={normalizeVertical(topOffSet)}
        />
    );
};

export default AlertToast;
