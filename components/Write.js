import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/Ionicons';
import Loading from './Loading';
import Recording from './Recording';
import Detail from './Detail';
import styles from '../styles/WriteStyle';

export default function Write({ note, setNote, setTotalDepressValue }) {
  // TextInput에 입력한 text
  const [text, setText] = useState('');
  const onChangeText = (payload) => setText(payload);

  const [chatbotAnswer, setChatbotAnswer] = useState();
  const [textEmotion, setTextEmotion] = useState();
  const [textDepress, setTextDepress] = useState();
  const [audioData, setAudioData] = useState();
  const [audioDepress, setAudioDepress] = useState();
  const [textDepressValue, setTextDepressValue] = useState();
  const [textResult, setTextResult] = useState();

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const handleKeyboardDidShow = () => {
    setKeyboardVisible(true);
  };

  const handleKeyboardDidHide = () => {
    setKeyboardVisible(false);
  };

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

    loadNote();

    return () => {
      Keyboard.removeAllListeners('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeAllListeners('keyboardDidHide', handleKeyboardDidHide);
    };
  }, []);

  const saveNote = async (toSave) => {
    await AsyncStorage.setItem(EXPO_PUBLIC_STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadNote = async () => {
    const s = await AsyncStorage.getItem(EXPO_PUBLIC_STORAGE_KEY);
    const parsedNote = JSON.parse(s);

    if (parsedNote === null) {
      setNote([]);
    } else {
      setNote(parsedNote);
    }
  };

  // 시간 표시
  function getDurationFormatted(millisec) {
    const minutes = millisec / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesDisplay) * 60);
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutesDisplay}:${secondsDisplay}`;
  }

  // GOOGLE STT
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [isGetGoogleSTT, setIsGetGoogleSTT] = useState(false);
  const [isGetAudioResult, setIsGetAudioResult] = useState(false);
  const [isGetTextResult, setIsGetTextResult] = useState(false);
  const [isGetChatResult, setIsGetChatResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startRecording = async () => {
    setIsRecording(true);
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    await recording.stopAndUnloadAsync();
    setIsRecording(false);

    // 녹음파일 객체 생성
    const { sound, status } = await recording.createNewLoadedSoundAsync();

    const audio = {
      sound: sound,
      file: recording.getURI(),
      duration: getDurationFormatted(status.durationMillisec),
      status: status,
    };
    const transcript = await getTranscription(audio);
    const audioDepress = await getAudioDepress(audio);

    setText(transcript);
    setAudioData(audio);
    setAudioDepress(audioDepress);
    setRecording();
    return { transcript, audioDepress };
  };

  //Flask api 서버 요청, GOOGLE STT API 요청
  const getTranscription = async (audio) => {
    setIsGetGoogleSTT(true);
    const apiUrl = EXPO_PUBLIC_GOOGLE_STT_URL;

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audio.file,
        type: 'audio/x-wav',
        name: 'recording.wav',
      });

      const response = await axios.post(apiUrl, formData);
      setIsGetGoogleSTT(false);
      return response.data.transcript;
    } catch (error) {
      console.error('구글 STT API 요청 오류:', error);
      setIsGetGoogleSTT(false);
    }
  };

  const recordingOptions = {
    android: {
      extension: '.m4a',
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: '.wav',
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  };

  const addNote = async () => {
    if (text === '') {
      return;
    }
    // save
    const newNote = [...note];
    const newData = {
      [Date.now()]: {
        text,
        textEmotion,
        chatbotAnswer,
        textDepress,
        textDepressValue,
        audio: audioData,
        audioDepress,
        textResult,
      },
    };
    newNote.unshift(newData);
    setNote(newNote);
    await saveNote(newNote);
    setText('');
    setChatbotAnswer();
    setTextEmotion();
    setTextDepress();
    setAudioData();
    setAudioDepress();
    setTextDepressValue();
    setTextResult();
  };

  // KoBERT 챗봇 응답
  const doKobert = async (text) => {
    setIsGetChatResult(true);
    try {
      const url = EXPO_PUBLIC_CHATBOT_URL_;
      const user_input = text;
      const response = await axios.post(url, { user_input: user_input });
      const responseData = response.data;
      const chatAnswer = responseData.output_list.map((item) => {
        return {
          answer: item.answer,
          situation: item.situation,
          softmax_value: item.softmax_value,
        };
      });
      setIsGetChatResult(false);

      return chatAnswer;
    } catch (error) {
      console.error('KoBERT 챗봇 서버 오류 :', error);
      setIsGetChatResult(false);
      return [];
    }
  };

  // TEXT 우울 분석
  const doTextDepress = async (text) => {
    setIsGetTextResult(true);
    try {
      const url = EXPO_PUBLIC_TEXT_DEPRESS_URL;
      const user_input = text;
      const response = await axios.post(url, { user_input: user_input });
      const depress = response.data;
      setIsGetTextResult(false);
      return depress;
    } catch (error) {
      console.error('텍스트 우울 분석 오류 :', error);
      setIsGetTextResult(false);
      return [];
    }
  };

  // Flask api 서버 요청, 음성 우울 분석
  const getAudioDepress = async (audio) => {
    setIsGetAudioResult(true);
    const apiUrl = EXPO_PUBLIC_AUDIO_DEPRESS_URL;

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audio.file,
        type: 'audio/x-wav',
        name: 'recording.wav',
      });

      const response = await axios.post(apiUrl, formData);
      setIsGetAudioResult(false);
      return response.data;
    } catch (error) {
      console.error('음성 우울 분석 API 서버 요청 오류:', error);
      setIsGetAudioResult(false);
    }
  };

  useEffect(() => {
    if (chatbotAnswer && textEmotion && textDepress && textResult) {
      addNote();
    }
  }, [chatbotAnswer, textEmotion, textDepress, textResult]);

  const handlePress = async (text) => {
    const chatAnswer = await doKobert(text);
    const text_depress = await doTextDepress(text);

    setChatbotAnswer(chatAnswer);
    setTextEmotion(text_depress.emotion_list);
    setTextDepress(text_depress.depress_list);
    setTextDepressValue(text_depress.depress_value);
    setTextResult(text_depress);
  };

  const saveAudioNote = async () => {
    setIsLoading(true);
    const { transcript } = await stopRecording();
    await handlePress(transcript);
    setIsLoading(false);
  };

  const deleteNote = async (rowMap, key) => {
    Alert.alert('일기를 삭제합니다.', '삭제하시겠습니까?', [
      { text: '취소' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          closeRow(rowMap, key);
          let newNote = [...note];
          newNote = newNote.filter((item) => Object.keys(item)[0] !== key);
          setNote(newNote);
          await saveNote(newNote);
        },
      },
    ]);
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    // 원하는 날짜 포맷 적용
    const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return formattedDate;
  };

  // 일기 클릭 상세페이지 이동 설정
  const [selectedNoteKey, setSelectedNoteKey] = useState(null);

  const noteDetail = (key) => {
    setSelectedNoteKey(key);
  };

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const [sound, setSound] = useState(null);
  const [isAudioPlay, setIsAudioPlay] = useState(false);
  const [isAudioPause, setIsAudioPause] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(null);

  // 녹음 파일 재생
  const playAudio = async (audioFileURL) => {
    try {
      setIsAudioPlay(true);
      if (sound !== null) {
        await sound.unloadAsync();
      }
      const newSound = new Audio.Sound();
      await newSound.loadAsync({ uri: audioFileURL });
      await newSound.playAsync();
      setSound(newSound);
    } catch (error) {
      console.log('오디오 재생 중 에러 발생:', error);
    }
  };

  // 녹음 파일 일시정지
  const pauseAudio = async () => {
    try {
      setIsAudioPlay(false);
      setIsAudioPause(true);
      const status = await sound.getStatusAsync();
      setPlaybackPosition(status.positionMillisec);
      await sound.pauseAsync();
    } catch (error) {
      console.log('오디오 일시정지 중 에러 발생:', error);
    }
  };

  // 녹음 파일 다시 재생
  const resumeAudio = async () => {
    try {
      setIsAudioPlay(true);
      setIsAudioPause(false);
      await sound.playFromPositionAsync(playbackPosition);
    } catch (error) {
      console.log('오디오 다시 재생 중 에러 발생:', error);
    }
  };

  const initAudio = async () => {
    if (sound !== null) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    setSound(null);
    setIsAudioPlay(false);
    setIsAudioPause(false);
    setPlaybackPosition(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfdfe' }}>
      {
        // 일기 클릭시 나오는 상세페이지
        selectedNoteKey ? (
          <Detail
            selectedNoteKey={selectedNoteKey}
            setSelectedNoteKey={setSelectedNoteKey}
            note={note}
            playAudio={playAudio}
            pauseAudio={pauseAudio}
            resumeAudio={resumeAudio}
            initAudio={initAudio}
            isAudioPlay={isAudioPlay}
            isAudioPause={isAudioPause}
            setTotalDepressValue={setTotalDepressValue}
          />
        ) : (
          // 평소에는 일기 목록 페이지 & 일기쓰기
          <Pressable
            style={{ flex: 1 }}
            onPress={() => Keyboard.dismiss()}
          >
            <View
              style={{ borderBottomColor: '#416753', borderBottomWidth: 1 }}
            >
              <Text style={styles.header}>오늘 있었던 일을 말해 주세요!</Text>
            </View>
            {isRecording && <Recording />}
            {isLoading && (
              <Loading
                isGetGoogleSTT={isGetGoogleSTT}
                isGetAudioResult={isGetAudioResult}
                isGetTextResult={isGetTextResult}
                isGetChatResult={isGetChatResult}
              />
            )}
            <SwipeListView
              data={note}
              renderItem={(data) => (
                <View style={styles.note}>
                  <TouchableHighlight
                    activeOpacity={0.9}
                    underlayColor='#DDDDDD'
                    onPress={() => noteDetail(Object.keys(data.item)[0])}
                  >
                    <View>
                      <Text style={styles.date}>
                        {formatDate(Object.keys(data.item)[0])}
                      </Text>
                      <Text>{Object.values(data.item)[0].text}</Text>
                    </View>
                  </TouchableHighlight>
                </View>
              )}
              renderHiddenItem={(data, rowMap) => (
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <View style={{ flex: 0.5, backgroundColor: 'white' }}></View>
                  <View style={styles.swipeHiddenItem}>
                    <TouchableOpacity
                      onPress={() =>
                        deleteNote(rowMap, Object.keys(data.item)[0])
                      }
                    >
                      <Icon
                        style={styles.swipeIcon}
                        name='trash-outline'
                        size={30}
                        color='white'
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              rightOpenValue={-70}
              style={{ marginBottom: 50 }}
            />
            <View style={styles.writeDiary}>
              <View
                style={[
                  styles.inputContainer,
                  isKeyboardVisible && { bottom: 210 },
                ]}
              >
                <TextInput
                  onChangeText={onChangeText}
                  value={text}
                  multiline={true}
                  style={styles.input}
                  placeholder={'오늘 있었던 일을 써주세요.'}
                />
                {
                  // 녹음버튼
                  isRecording ? (
                    <TouchableOpacity
                      style={styles.recordBtn}
                      onPress={() => {
                        saveAudioNote();
                      }}
                    >
                      <Icon
                        name='mic-sharp'
                        size={30}
                        color='red'
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.recordBtn}
                      onPress={() => {
                        startRecording();
                      }}
                    >
                      <Icon
                        name='mic-sharp'
                        size={30}
                        color='#576F72'
                      />
                    </TouchableOpacity>
                  )
                }
                <TouchableOpacity
                  onPress={() => {
                    handlePress(text);
                    Keyboard.dismiss();
                  }}
                >
                  <Icon
                    style={styles.send}
                    name='arrow-up-circle'
                    size={35}
                    color='#576F72'
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        )
      }
    </SafeAreaView>
  );
}
