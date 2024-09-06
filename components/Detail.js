import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../styles/WriteStyle';

export default function Detail({
  selectedNoteKey,
  setSelectedNoteKey,
  note,
  playAudio,
  pauseAudio,
  resumeAudio,
  initAudio,
  isAudioPlay,
  isAudioPause,
  setTotalDepressValue,
}) {
  const date = new Date(Number(selectedNoteKey));
  const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date
    .getHours()
    .toString()
    .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  const selectedNote = note.find(
    (item) => Object.keys(item)[0] === selectedNoteKey
  );
  const chatbotAnswerArray = selectedNote[selectedNoteKey].chatbotAnswer;
  const textEmotionArray = selectedNote[selectedNoteKey].textEmotion;
  const textDepressArray = selectedNote[selectedNoteKey].textDepress;
  const textDepressValue = selectedNote[selectedNoteKey].textDepressValue;
  const audioEmotion = selectedNote[selectedNoteKey].audioDepress.emotion;
  const audioDepressValue =
    selectedNote[selectedNoteKey].audioDepress.sigmoid_value[0][0];
  const totalDepressValueTemp =
    (textDepressValue * 0.8 + audioDepressValue * 0.2) * 100;

  const textEmotionCounts = textEmotionArray.reduce((counts, emotion) => {
    counts[emotion] = (counts[emotion] || 0) + 1;
    return counts;
  }, {});
  const textDepressCount = textDepressArray.reduce((counts, textDepress) => {
    counts[textDepress] = (counts[textDepress] || 0) + 1;
    return counts;
  }, {});

  // Detail page 텍스트 우울 그래프
  const colors = {
    감정조절이상: '#222831',
    불면: '#746272',
    분노: '#B3685C',
    불안: '#D4B85F',
    초조: '#90A243',
    슬픔: '#82AF99',
    외로움: '#89A0A9',
    우울: '#4F6C8C',
    의욕상실: '#869b92',
    무기력: '#F38181',
    자살: '#424874',
    자존감저하: '#B7C4CF',
    절망: '#E84545',
    죄책감: '#E23E57',
    집중력저하: '#FFCFDF',
    피로: '#F07B3F',
    식욕저하: '#753422',
    식욕증가: '#F9ECEC',
    일상: '#FFB6B6',
  };
  const [textDepressChartData, setTextDepressChartData] = useState([]);
  const getTextDepressChartData = () => {
    const tempData = [];
    const totalCount = Object.values(textDepressCount).reduce(
      (a, b) => a + b,
      0
    );
    Object.entries(textDepressCount).map(([textDepress, count], index, arr) => {
      const percent = (count / totalCount) * 100;
      tempData.push({
        name: textDepress,
        color: colors[textDepress],
        percent: percent,
      });
    });
    setTextDepressChartData(tempData);
  };
  useEffect(() => {
    getTextDepressChartData();
    setTotalDepressValue(totalDepressValueTemp);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            setSelectedNoteKey(null);
            initAudio();
          }}
        >
          <Icon
            name='chevron-back-outline'
            size={40}
            color='#576F72'
          />
        </TouchableOpacity>
        <Text style={styles.detailHeader}>일기 상세 페이지</Text>
      </View>
      <View style={styles.detailNote}>
        <Text style={styles.detailDate}>{formattedDate} 작성</Text>
        <Text selectable={true}>{selectedNote[selectedNoteKey].text}</Text>
        {selectedNote[selectedNoteKey].audio ? (
          isAudioPause ? (
            <View style={styles.playAudio}>
              <TouchableOpacity
                onPress={() => {
                  resumeAudio();
                }}
              >
                <Icon
                  name='ios-play'
                  size={35}
                  color='#576F72'
                />
              </TouchableOpacity>
            </View>
          ) : isAudioPlay ? (
            <View style={styles.playAudio}>
              <TouchableOpacity
                onPress={() => {
                  pauseAudio();
                }}
              >
                <Icon
                  name='md-pause'
                  size={35}
                  color='#576F72'
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.playAudio}>
              <TouchableOpacity
                onPress={() => {
                  playAudio(selectedNote[selectedNoteKey].audio.file);
                }}
              >
                <Icon
                  name='ios-play'
                  size={35}
                  color='#576F72'
                />
              </TouchableOpacity>
            </View>
          )
        ) : null}
      </View>
      <ScrollView>
        <View style={styles.detailChatbot}>
          <Text style={styles.detailChatbotAnswerHeader}>위로형 챗봇 응답</Text>
          <View style={styles.detailChatbotAnswer}>
            <Text>
              {chatbotAnswerArray
                .sort((a, b) => b.softmax_value - a.softmax_value)
                .reduce((uniqueAnswers, currentAnswer) => {
                  const isAmbiguous = uniqueAnswers.some(
                    (a) => a.situation === '모호함'
                  );
                  if (isAmbiguous && currentAnswer.situation === '모호함') {
                    return uniqueAnswers;
                  }
                  if (
                    (!uniqueAnswers.some(
                      (a) => a.answer === currentAnswer.answer
                    ) ||
                      (isAmbiguous && currentAnswer.situation !== '모호함')) &&
                    currentAnswer.softmax_value > 0.07
                  ) {
                    uniqueAnswers.push(currentAnswer.answer);
                  }
                  return uniqueAnswers;
                }, [])
                .slice(0, Math.min(chatbotAnswerArray.length, 3))
                .join(' ') || '긍정적인 내용인 것 같아서 위로해 드릴게 없네요!'}
            </Text>
          </View>
          <Text style={styles.detailChatbotSituationHeader}>
            오늘의 대표 감정
          </Text>
          <View style={styles.detailChatbotSituation}>
            {Object.entries(textEmotionCounts).map(
              ([emotion, count], index, arr) => {
                // 가장 많이 등장한 감정만 표시
                if (count === Math.max(...Object.values(textEmotionCounts))) {
                  return (
                    <Text key={index}>
                      {emotion}, {audioEmotion}
                    </Text>
                  );
                }
                return null; // 다른 감정은 표시하지 않음
              }
            )}
            {}
          </View>
          <Text style={styles.detailChatbotSituationHeader}>
            텍스트,음성 우울감 분석
          </Text>
          <View style={styles.detailChatbotSituation}>
            <Text>우울감 정도: {totalDepressValueTemp.toFixed(2)}%</Text>
            {textDepressValue >= 0.6 ? (
              <>
                <Text>우울 양상을 보이는 문장의 비율이 높습니다!</Text>
                <View style={chartStyles.container}>
                  {textDepressChartData.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        ...chartStyles.barSegment,
                        backgroundColor: item.color,
                        flex: item.percent,
                        marginTop: 5,
                      }}
                    >
                      <Text style={chartStyles.text}>{item.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 30,
  },
  barSegment: {
    height: '100%',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
});
