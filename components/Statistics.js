import React, { useEffect, useState, useRef } from 'react';
import {
  Dimensions, SafeAreaView,
  ScrollView,
  StatusBar, StyleSheet, useColorScheme, Animated,
  LayoutAnimation,
  View,
  Easing
} from 'react-native';
import { LineChart, ProgressChart, PieChart } from 'react-native-chart-kit';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function Statistics({ navigation }){
    const screenWidth = Dimensions.get('window').width
    const emotionData = [
        {
          name: "두려움",
          population: 10,
          color: "#b8b674",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        },
        {
          name: "놀람",
          population: 15,
          color: "#7e93bf",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        },
        {
          name: "화가남",
          population: 4,
          color: "#c45a4f",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        },
        {
          name: "슬픔",
          population: 25,
          color: "#4b60ad",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        },
        {
          name: "중립",
          population: 6,
          color: "#565963",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        },
        {
            name: "행복함",
            population: 14,
            color: "#7aa178",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        },
        {
            name: "모멸감",
            population: 19,
            color: "#7a5b8c",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        }
    ];
    const chartConfig = {
        backgroundGradientFrom: '#556379',
        backgroundGradientTo: '#556379',
        color: (opacity = 1) => `rgba(96, 207, 255, ${opacity})`,
        strokeWidth: 2, // optional, default 3    
        barPercentage: 0.5,
        useShadowColorFromDataset: false, // optional
        style: {
          borderRadius: 16,
        },
    };

    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
      flex: 1,
      paddingHorizontal: 20,
    };

    const animatedValues = useRef(emotionData.map(() => new Animated.Value(0))).current;
    useEffect(() => {
        const animations = animatedValues.map((animatedValue, index) => {
          return Animated.timing(animatedValue, {
            toValue: emotionData[index]["population"],
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false,
          });
        });
    
        Animated.stagger(200, animations).start();
    }, []);

    const animatedData = animatedValues.map((animatedValue, index) => {
        const interpolatedValue = animatedValue.interpolate({
          inputRange: [0, emotionData[index]["population"]],
          outputRange: [0, emotionData[index]["population"]],
        });
        
        const newData = { ...emotionData[index] };
        newData["population"] = interpolatedValue;
        return newData;
    });

    return (
        <SafeAreaView style={backgroundStyle}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <ScrollView

                // contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{
                    alignItems: "center",
                    paddingHorizontal: 20
                }}
                style={backgroundStyle}>
                
                {console.log(animatedData)}

                <PieChart
                    data={animatedData}
                    width={screenWidth}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[0, 0]}
                    
                />
    
                <LineChart
                    data={{
                        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                        datasets: [
                            {
                                data: [0.1, 0.5, 0.9],
                            },
                        ],
                    }}
                    formatYLabel={yLabel => {
                        return yLabel;
                    }}
                    hideLegend={true}
                    width={screenWidth - 20}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={{
                        backgroundColor: '#e26a00',
                        backgroundGradientFrom: '#fb8c00',
                        backgroundGradientTo: '#ffa726',
                        decimalPlaces: 2, // optional, defaults to 2dp
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: '6',
                            strokeWidth: '2',
                            stroke: '#ffa726',
                        },
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                />

                <ProgressChart
                    data={{ data : [0.1]}}
                    width={screenWidth - 20}
                    height={250}
                    strokeWidth={22}
                    radius={100}
                    chartConfig={chartConfig}
                    hideLegend={false}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                />
    
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({ 
    chart: {
        justifyContent: 'center',
        alignContent: 'center',
    }
})