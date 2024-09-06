import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useEmotionData } from '../hooks/useEmotionData';

export default function Statistics({ note }) {
  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundGradientFrom: '#f9f9f9',
    backgroundGradientTo: '#f9f9f9',
    color: (opacity = 1) => `rgba(41, 44, 61, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    style: {
      borderRadius: 16,
    },
  };

  const [emotionData, setEmotionData] = useEmotionData();
  const [textDepressCount, setTextDepressCount] = useState({});
  const [depressData, setDepressData] = useState({
    // mock data
    labels: [
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
    ],
    datasets: [
      {
        data: [30, 9, 0, 56, 23, 98, 54],
      },
    ],
  });

  useEffect(() => {
    getTextEmotion();
    getTextDepress();
    getDepressValue();
  }, [note]);

  const getTextEmotion = () => {
    let t_EmotionCount = {
      두려움: 0,
      놀람: 0,
      화남: 0,
      슬픔: 0,
      중립: 0,
      행복함: 0,
      모멸감: 0,
    };
    let newEmotionData = [...emotionData];

    note.forEach((item) => {
      const t_Emotion = item[Object.keys(item)]['textEmotion'];
      t_Emotion.map((emotions) => {
        if (t_EmotionCount.hasOwnProperty(emotions)) {
          t_EmotionCount[emotions]++;
        }
      });
    });
    console.log('7가지 감정 카운팅 : ', t_EmotionCount);
    newEmotionData.forEach((emotionObj) => {
      const emotionName = emotionObj.name;
      if (t_EmotionCount.hasOwnProperty(emotionName)) {
        emotionObj.Count = t_EmotionCount[emotionName];
      }
    });
    setEmotionData(newEmotionData);
  };

  const getTextDepress = () => {
    const depress_state = [
      '감정조절이상',
      '불면',
      '분노',
      '불안',
      '초조',
      '슬픔',
      '외로움',
      '우울',
      '의욕상실',
      '무기력',
      '자살',
      '자존감저하',
      '절망',
      '죄책감',
      '집중력저하',
      '피로',
      '식욕저하',
      '식욕증가',
      '일상',
    ];
    let t_DepressCount = {};

    for (var i = 0; i < depress_state.length; i++) {
      t_DepressCount[depress_state[i]] = 0;
    }

    note.forEach((item, i) => {
      const t_Depress = item[Object.keys(item)]['textDepress'];
      t_Depress.map((depress) => {
        if (t_DepressCount.hasOwnProperty(depress)) {
          t_DepressCount[depress]++;
        }
      });
    });
    setTextDepressCount(t_DepressCount);
  };

  const getDepressValue = () => {
    const labelDate = [];
    const textDepressValue = [];
    const audioDepressValue = [];
    const totalDepressValue = [];
    note.map((item, i) => {
      const noteDate = new Date(Number(Object.keys(item)[0]));
      const newDate = `${(noteDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${noteDate.getDate().toString().padStart(2, '0')}`;
      labelDate.push(newDate);
      textDepressValue.push(item[Object.keys(item)[0]].textDepressValue);
      audioDepressValue.push(
        item[Object.keys(item)[0]].audioDepress.sigmoid_value[0][0]
      );
    });
    textDepressValue.map((data, i) => {
      const tempValue = 0.6 * data + 0.4 * audioDepressValue[i];
      totalDepressValue.push(tempValue);
    });

    // mock data
    const updatedDepressData = {
      labels: [
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
      ],
      datasets: [
        {
          data: [
            0.463435,
            0.58347,
            0.65857,
            0.8757632,
            0.66452,
            0.593287327,
            0.458,
            ...totalDepressValue,
          ],
        },
      ],
    };

    setDepressData(updatedDepressData);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
        style={{ flex: 1 }}
      >
        <View style={styles.pieChart}>
          <Text style={styles.chartHeader}>감정 분석 통계</Text>
          <PieChart
            data={emotionData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor={'Count'}
            backgroundColor={'transparent'}
            paddingLeft={'15'}
            center={[0, 0]}
          />
        </View>
        <View style={styles.lineChart}>
          <Text style={styles.chartHeader}>우울감 분석 통계(%)</Text>
          <LineChart
            data={depressData}
            width={screenWidth}
            height={256}
            verticalLabelRotation={0}
            chartConfig={chartConfig}
            bezier
          />
        </View>
        <Text>높은 우울감 수치가 지속됩니다 !</Text>
        <Text>Selfcare 탭의 우울 척도 검사를 권장합니다.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pieChart: {
    marginVertical: 30,
  },

  lineChart: {
    marginTop: 10,
  },
  chartHeader: {
    textAlign: 'center',
    fontSize: 25,
  },
});
