import { useEffect } from "react";
import { useDispatch } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import { setNetworkStatus } from "../redux/networkSlice.js";

const NetworkListener = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const isOnline =
                state.isConnected === true &&
                state.isInternetReachable === true;

            dispatch(setNetworkStatus(isOnline));
        });

        return unsubscribe;
    }, [dispatch]);

    return null;
};

export default NetworkListener;