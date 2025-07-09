import { memo } from "react";
import { View, Text } from "react-native";
import { Marquee } from "@animatereactnative/marquee";
import { normalize, normalizeVertical } from "../utils/responsive.js";

const ScrollingText = ({ text, style, fitWidth }) => (
    <>
        <View
            style={{
                flex: 1,
                alignItems: "flexStart",
                overflow: "hidden"
            }}
        >
            {text.length <= 27 ? (
                <Text style={style}>{text}</Text>
            ) : (
                <Marquee spacing={25} speed={0.6}>
                    <Text style={style}>{text}</Text>
                </Marquee>
            )}
        </View>
    </>
);

export default memo(ScrollingText);
