import React, { useEffect, useState, useRef } from 'react';
import {
  Dimensions, SafeAreaView,
  ScrollView,
  StatusBar, StyleSheet, useColorScheme,
  LayoutAnimation,
  View,
  Easing,
  Text
} from 'react-native';
import { LineChart, ProgressChart, PieChart } from 'react-native-chart-kit';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useEmotionData } from './emotionData';

export default function Statistics({ note, setNote, totalDepressValue, setTotalDepressValue }){
    const screenWidth = Dimensions.get('window').width
    const chartConfig = {
        backgroundGradientFrom: "#f9f9f9",
        backgroundGradientTo: "#f9f9f9",
        color: (opacity = 1) => `rgba(41, 44, 61, ${opacity})`,
        strokeWidth: 3, // optional, default 3    
        barPercentage: 0.5,
        useShadowColorFromDataset: false, // optional
        style: {
          borderRadius: 16,
        },
    };

    const [emotionData, setEmotionData] = useEmotionData();
    const [textDepressCount, setTextDepressCount] = useState({});
    const [textDepressValue, setTextDepressValue] = useState();
    const [depressData, setDepressData] = useState({
        labels: ["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15"],
        datasets: [
          {
            data: [30, 9, 0, 56, 23, 98, 54],
          }
        ]
    });

    useEffect(() => {
        getTextEmotion();
        getTextDepress();
        getDepressValue();
    }, [note]);
    
    const getTextEmotion = ()=> {
        let t_EmotionCount = {두려움: 0, 놀람: 0, 화남: 0, 슬픔: 0, 중립: 0, 행복함: 0, 모멸감: 0}
        let newEmotionData = [...emotionData]

        note.forEach((item, i)=>{
            const t_Emotion = item[Object.keys(item)]['textEmotion'];
            t_Emotion.map((emotions)=>{
                if (t_EmotionCount.hasOwnProperty(emotions)) {
                    t_EmotionCount[emotions]++;
                }
            })
        })
        //console.log('7가지 감정 카운팅 : ', t_EmotionCount)
        newEmotionData.forEach((emotionObj) => {
            const emotionName = emotionObj.name;
            if (t_EmotionCount.hasOwnProperty(emotionName)) {
              emotionObj.Count = t_EmotionCount[emotionName];
            }
        })
        setEmotionData(newEmotionData);
    };


    const getTextDepress = ()=> {
        const depress_state = ['감정조절이상', '불면', '분노', '불안', '초조', '슬픔', '외로움', '우울', '의욕상실', '무기력', '자살', '자존감저하', '절망', '죄책감', '집중력저하', '피로', '식욕저하', '식욕증가', '일상'];
        let t_DepressCount = {}
        //let newTextDepressData = {...textDepressData}
    
        for(var i=0; i < depress_state.length; i++){
            t_DepressCount[depress_state[i]] = 0;
        }
        
        note.forEach((item, i)=>{
            const t_Depress = item[Object.keys(item)]['textDepress'];
            t_Depress.map((depress)=>{
                if (t_DepressCount.hasOwnProperty(depress)) {
                    t_DepressCount[depress]++;
                }
            })
        })
        setTextDepressCount(t_DepressCount);
        //console.log('텍스트 우울 종류 카운팅 : ', t_DepressCount);
    }

    const getDepressValue = ()=> {
        console.log('우울 수치 가져오기 함수 실행');
        const labelDate = [];
        const textDepressValue = [];
        const audioDepressValue = [];
        const totalDepressValue = [];
        note.map((item, i)=> {
            const noteDate = new Date(Number(Object.keys(item)[0]));
            const newDate = `${(noteDate.getMonth() + 1).toString().padStart(2, '0')}-${noteDate.getDate().toString().padStart(2, '0')}`;
            labelDate.push(newDate);
            textDepressValue.push(item[Object.keys(item)[0]].textDepressValue);
            audioDepressValue.push(item[Object.keys(item)[0]].audioDepress.sigmoid_value[0][0]);
        })
        textDepressValue.map((data, i)=> {
            const tempValue = (0.6*data) + (0.4*audioDepressValue[i]);
            totalDepressValue.push(tempValue);
        })
        console.log('textDepressValue : ', textDepressValue);
        console.log('labelDate : ', labelDate);
        console.log('audioDepressValue : ', audioDepressValue);
        console.log('totalDepressValue : ', totalDepressValue);

        const updatedDepressData = {
            //수정
            labels: ["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15"],
            datasets: [
                {
                    data: [0.343435, 0.58347, 0.23857, 0.8757632, 0.66452, 0.283287327, 0.799657154083252, 0.6028970554471016, 0.4113091230392456, 0.4045874799117446, 0.7197580099105835, 0.7152678608894348, 0.7447169351577758, 0.46742027997970576],
                },
            ],
        };
          
        setDepressData(updatedDepressData);
        console.log(updatedDepressData);
    }
    




    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
            <ScrollView

                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{
                    alignItems: "center",
                    paddingHorizontal: 20
                }}
                style={{ flex: 1 }}>
                <View style={styles.piechart}>
                    <Text style={styles.chartheader}>감정 분석 통계</Text>
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
                </View>

                <View style={styles.linechart}>
                    <Text style={styles.chartheader}>우울감 분석 통계(%)</Text>
                    <LineChart
                        data={depressData}
                        width={screenWidth}
                        height={256}
                        verticalLabelRotation={0}
                        chartConfig={chartConfig}
                        bezier
                    />
                </View>
    
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({ 
    piechart: {
        marginVertical: 30
    },

    linechart: {
        marginTop: 10
    },
    chartheader: {
        textAlign: 'center',
        fontSize: 25
    }
})