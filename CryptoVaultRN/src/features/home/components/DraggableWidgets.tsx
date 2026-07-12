import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MARGIN = 10;
const CONTAINER_MARGIN = 20;
const WIDGET_WIDTH = (SCREEN_WIDTH - CONTAINER_MARGIN * 2 - MARGIN) / 2;

export type HomeWidgetData = {
    id: string;
    label: string;
    amount: string;
    trend: string;
    trendUp: boolean;
};

const defaultWidgets: HomeWidgetData[] = [
    {
        id: 'portfolio',
        label: 'Portfolio value',
        amount: '$0.00',
        trend: '0.00%',
        trendUp: true,
    },
    {
        id: 'top-asset',
        label: 'Top asset',
        amount: '-',
        trend: 'No data',
        trendUp: true,
    },
];

const DraggableWidgets: React.FC<{ widgets?: HomeWidgetData[] }> = ({ widgets }) => {
    const sourceWidgets = widgets && widgets.length >= 2 ? widgets.slice(0, 2) : defaultWidgets;
    const order = useSharedValue([0, 1]);

    return (
        <View style={styles.container}>
            
            <View style={styles.row}>
                <Widget
                    id={sourceWidgets[0].id}
                    label={sourceWidgets[0].label}
                    amount={sourceWidgets[0].amount}
                    trend={sourceWidgets[0].trend}
                    trendUp={sourceWidgets[0].trendUp}
                    order={order}
                    myOriginalIndex={0}
                />
                <Widget
                    id={sourceWidgets[1].id}
                    label={sourceWidgets[1].label}
                    amount={sourceWidgets[1].amount}
                    trend={sourceWidgets[1].trend}
                    trendUp={sourceWidgets[1].trendUp}
                    order={order}
                    myOriginalIndex={1}
                />
            </View>
        </View>
    );
};

const Widget = ({
    label,
    amount,
    trend,
    trendUp,
    order,
    myOriginalIndex,
}: {
    id: string;
    label: string,
    amount: string,
    trend: string,
    trendUp: boolean,
    order: Animated.SharedValue<number[]>,
    myOriginalIndex: number,
}) => {
    const isDragging = useSharedValue(false);
    const translateX = useSharedValue(myOriginalIndex * (WIDGET_WIDTH + MARGIN));

    useDerivedValue(() => {
        if (!isDragging.value) {
            const currentPos = order.value.indexOf(myOriginalIndex);
            translateX.value = withSpring(currentPos * (WIDGET_WIDTH + MARGIN));
        }
    });

    const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number }>({
        onStart: (_, ctx) => {
            isDragging.value = true;
            ctx.startX = translateX.value;
        },
        onActive: (event, ctx) => {
            const newX = ctx.startX + event.translationX;
            translateX.value = newX;

            const currentPos = order.value.indexOf(myOriginalIndex);
            const otherPos = 1 - currentPos;
            const threshold = (WIDGET_WIDTH + MARGIN) / 2;

            if (currentPos === 0 && newX > threshold) {
                order.value = [order.value[1], order.value[0]];
            } else if (currentPos === 1 && newX < threshold) {
                order.value = [order.value[1], order.value[0]];
            }
        },
        onEnd: () => {
            isDragging.value = false;
            const currentPos = order.value.indexOf(myOriginalIndex);
            translateX.value = withSpring(currentPos * (WIDGET_WIDTH + MARGIN));
        },
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: withSpring(isDragging.value ? 1.05 : 1) },
        ],
        zIndex: isDragging.value ? 10 : 1,
        position: 'absolute',
    }));

    return (
        <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.card, animatedStyle]}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.amount}>{amount}</Text>
                <View style={styles.trend}>
                    <Text style={{ color: trendUp ? '#34C759' : '#FF3B30', fontSize: 12 }}>{trend}</Text>
                </View>
            </Animated.View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 5,
        height: 160,
        marginBottom: -8
    },
    header: {
        marginHorizontal: 20,
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    row: {
        marginHorizontal: 20,
        height: 100,
        position: 'relative',
    },
    card: {
        backgroundColor: '#131435',
        borderRadius: 15,
        padding: 15,
        width: WIDGET_WIDTH,
        height: 100,
        borderWidth: 1,
        borderColor: '#1D1E4E',
    },
    label: {
        fontSize: 12,
        color: '#8F9BB3',
        marginBottom: 8,
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    trend: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default DraggableWidgets;
