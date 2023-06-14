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
import { useEmotionData } from './emotionData';

export default function Statistics({ note, setNote }){
    const screenWidth = Dimensions.get('window').width
    const chartConfig = {
        backgroundGradientFrom: '#FFE3E1',
        backgroundGradientTo: '#FFE3E1',
        color: (opacity = 1) => `rgba(26, 46, 36, ${opacity})`,
        strokeWidth: 5, // optional, default 3    
        barPercentage: 0.5,
        useShadowColorFromDataset: false, // optional
        style: {
          borderRadius: 16,
        },
    };

    const [emotionData, setEmotionData] = useEmotionData();

    useEffect(() => {
        getTextEmotion();
    }, []);


    const getTextEmotion = ()=> {
        let t_EmotionCount = {두려움: 0, 놀람: 0, 화가남: 0, 슬픔: 0, 중립: 0, 행복함: 0, 모멸감: 0}
        let newEmotionData = [...emotionData]

        note.forEach((item, i)=>{
            const t_Emotion = item[Object.keys(item)]['textEmotion'];
            t_Emotion.map((emotions)=>{
                if (t_EmotionCount.hasOwnProperty(emotions)) {
                    t_EmotionCount[emotions]++;
                }
            })
        })
        console.log('7가지 감정 카운팅 : ', t_EmotionCount)
        newEmotionData.forEach((emotionObj) => {
            const emotionName = emotionObj.name;
            if (t_EmotionCount.hasOwnProperty(emotionName)) {
              emotionObj.Count = t_EmotionCount[emotionName];
            }
        })
        setEmotionData(newEmotionData);
    };

    
    const depressData = {
        labels: ["06-07", "06-08", "06-09", "06-10", "06-11", "06-12", "06-13"],
        datasets: [
          {
            data: [30, 9, 0, 56, 23, 98, 54],
          }
        ]
    };
    

    
    
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(255, 227, 225, 0.4)" }}>
            <ScrollView

                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{
                    alignItems: "center",
                    paddingHorizontal: 20
                }}
                style={{ flex: 1 }}>
 
                <PieChart
                    data={emotionData}
                    width={screenWidth}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"Count"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[0, 0]}
                />

                <LineChart
                    data={depressData}
                    width={screenWidth}
                    height={256}
                    verticalLabelRotation={0}
                    chartConfig={chartConfig}
                    bezier
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