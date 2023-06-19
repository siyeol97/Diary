import { useEffect, useState } from 'react';
import { StyleSheet,
            Text,
            View,
            TextInput,
            Keyboard,
            Pressable,
            ScrollView,
            TouchableOpacity,
            Alert,
            TouchableHighlight,
            SafeAreaView,
            Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {SwipeListView} from 'react-native-swipe-list-view';
import axios from 'axios';
import styles from './Writestyle';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';

//GOOGLE STT API 설정
const ENCODING = 'LINEAR16';
const SAMPLE_RATE_HERTZ = 41000;
const LANGUAGE = 'ko-KR';

//모델 돌리는 API 서버 설정
const STORAGE_KEY = "@note";

const CHATBOT_URL_LOCAL_ADDRESS = 'http://172.20.10.7:80';

const GOOGLE_STT_API_ADDRESS = CHATBOT_URL_LOCAL_ADDRESS+'/audio'

const TEXTDEPRESS_URL_LOCAL_ADDRESS = "https://ccd0-35-188-117-31.ngrok-free.app";

const AUDIODEPRESS_URL_LOCAL_ADDRESS = 'http://754e-121-174-96-133.ngrok-free.app';


export default function Write({ note, setNote, totalDepressValue, setTotalDepressValue }){

    //TextInput에 입력한 text
    const [text, setText] = useState("");
    const onChangeText = (payload) => setText(payload); 

    const [chatbotanswer, setChatbotanswer] = useState();
    const [textEmotion, setTextEmotion] = useState();
    const [textDepress, setTextDepress] = useState();
    const [audioData, setAudioData] = useState();
    
    const [transedText, setTransedText] = useState("");
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

        return () => {
        Keyboard.removeAllListeners('keyboardDidShow', handleKeyboardDidShow);
        Keyboard.removeAllListeners('keyboardDidHide', handleKeyboardDidHide);
        };
    }, []);


    useEffect(()=>{
        console.log('Write 실행')
        loadNote();
        
    }, [])

    //const [note, setNote] = useState([]);

    const saveNote = async (toSave) => {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    }
    
    const loadNote = async ()=> {
        const s = await AsyncStorage.getItem(STORAGE_KEY)
        const parsedNote = JSON.parse(s);

        if (parsedNote === null) {
            setNote([]);
        } else {
            console.log('======================일기 데이터 전부 불러오기========================')
            console.log(parsedNote);
            setNote(parsedNote);
            console.log('======================일기 데이터 전부 불러오기 완료========================')
        }
    };

    //시간 표시
    function getDurationFormatted(millis) {
        const minutes = millis / 1000 / 60;
        const minutesDisplay = Math.floor(minutes);
        const seconds = Math.round((minutes - minutesDisplay) * 60);
        const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
        return `${minutesDisplay}:${secondsDisplay}`;
    }

    //========================== GOOGLE STT ========================== 
    const [recording, setRecording] = useState();
    const [isRecording, setIsRecording] = useState(false);
    const [isGetGoogleSTT, setIsGetGoogleSTT] = useState(false);
    const [isGetAudioResult, setIsGetAudioResult] = useState(false);
    const [isGetTextResult, setIsGetTextResult] = useState(false);
    const [isGetChatResult, setIsGetChatResult] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const startRecording = async () => {
        setIsRecording(true);
        console.log('isRecording : ', isRecording);
        try {
          console.log('Requesting permissions..');
          await Audio.requestPermissionsAsync();
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
    
          console.log('Starting recording..');
          const recording = new Audio.Recording();
          await recording.prepareToRecordAsync(recordingOptions);
          await recording.startAsync();
    
          setRecording(recording);
    
        } catch (err) {
          console.error('Failed to start recording', err);
        }
      }
    
    
    const stopRecording = async() => {
        console.log('stopRecording 함수 시작!!\n===========================')
        await recording.stopAndUnloadAsync();
        setIsRecording(false);
      
        //녹음파일 객체 생성
        const {sound, status} = await recording.createNewLoadedSoundAsync();
        
        const audio = {
          sound : sound,
          file : recording.getURI(),
          duration: getDurationFormatted(status.durationMillis),
          status : status
        }
        console.log('audio 객체 생성 -> ', audio);
        const transcript = await getTranscription(audio);
        const audioDepress = await getAudioDepress(audio);

        console.log('transcript : ', transcript)
        console.log('audioDepress : ', audioDepress)
        setText(transcript);
        setAudioData(audio);
        setAudioDepress(audioDepress);
        setRecording();
        console.log('audio 객체 저장 성공')
        console.log('Recording 완료');
        return { transcript, audioDepress };
    }

    //Flask api 서버로 보냄, GOOGLE STT API 요청
    const getTranscription = async (audio) => {
        console.log('구글 API 요청 보냄');
        setIsGetGoogleSTT(true);
        const apiUrl = GOOGLE_STT_API_ADDRESS; // Flask API 서버의 업로드 엔드포인트 URL

        try {
            const formData = new FormData();
            formData.append('file', {
                uri: audio.file, // 저장된 오디오 파일의 경로
                type: 'audio/x-wav', // 오디오 파일의 MIME 타입에 맞게 설정 (wav 파일의 경우)
                name: 'recording.wav' // 오디오 파일의 이름 
            })

            const response = await axios.post(apiUrl, formData);
            setIsGetGoogleSTT(false);
            return response.data.transcript;
        } catch (error) {
            console.error('구글 STT API 요청 오류:', error);
            setIsGetGoogleSTT(false);
            throw error;
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
//====================================================

    const addNote = async ()=> {
        console.log('addNote 함수 실행')
        if(text === ""){
          return
        }
        // save to do
        const newNote = [...note]
        const newData = {[Date.now()]: {text, textEmotion, chatbotanswer, textDepress, textDepressValue, audio:audioData, audioDepress, textResult}}
        newNote.unshift(newData)
        setNote(newNote);
        await saveNote(newNote);
        setText("");
        setChatbotanswer();
        setTextEmotion();
        setTextDepress();
        setAudioData();
        setAudioDepress();
        setTextDepressValue();
        setTextResult() ;
        console.log('addNote 함수 종료')
    }

    // KoBERT 챗봇 응답
    const doKobert = async (text) => {
        setIsGetChatResult(true);
        console.log('kobert API 서버 실행 :', text)
        try {
            const url = CHATBOT_URL_LOCAL_ADDRESS;
            const user_input = text;
      
            const response = await axios.post(url, { user_input: user_input });
            const responseData = response.data;
            const chatAnswer = responseData.output_list.map(item => {
                return {
                    answer: item.answer,
                    situation: item.situation,
                    softmax_value: item.softmax_value
                };
            });
            
            console.log('================================================')
            console.log('chatAnswer : ', chatAnswer);
            console.log('================================================')
            setIsGetChatResult(false);

            return chatAnswer;

        } catch (error) {
            console.error('KoBERT 챗봇 서버 오류 :', error);
            setIsGetChatResult(false);
            return [];
        }
    };

    /////////TEXT 우울 분석/////////
    const doTextDepress = async(text) => {
        setIsGetTextResult(true);
        console.log('doTextDepress 함수 실행 : ', text);
        try {
            const url = TEXTDEPRESS_URL_LOCAL_ADDRESS;
            const user_input = text;
            
            const response = await axios.post(url, { user_input: user_input });
            const depress = response.data;
            
            console.log('================================================')
            console.log('depress : ', depress);
            console.log('================================================')
            //depress = {'emotion_list' : emotion, 'depress_list' : depress[0], 'depress_value' : depress[1]}
            setIsGetTextResult(false);
            return depress;

        } catch (error) {
            console.error('텍스트 우울 분석 오류 :', error);
            setIsGetTextResult(false);
            return [];
        }
    }

    //Flask api 서버로 보냄, 음성 우울 분석
    const getAudioDepress = async (audio) => {
        setIsGetAudioResult(true);
        const apiUrl = AUDIODEPRESS_URL_LOCAL_ADDRESS; // Flask API 서버의 업로드 엔드포인트 URL

        try {
            console.log('음성 우울 분석 API 서버 요청 실행')
            const formData = new FormData();
            formData.append('file', {
                uri: audio.file, // 저장된 오디오 파일의 경로
                type: 'audio/x-wav', // 오디오 파일의 MIME 타입에 맞게 설정 (wav 파일의 경우)
                name: 'recording.wav' // 오디오 파일의 이름 (원하는 이름으로 설정)
            })

            const response = await axios.post(apiUrl, formData);
            console.log('오디오 우울 분석 결과 : ', response)
            setIsGetAudioResult(false);
            return response.data;
        } catch (error) {
            console.error('음성 우울 분석 API 서버 요청 오류:', error);
            setIsGetAudioResult(false);
            throw error;
        }
    };

    useEffect(()=> {
        if (chatbotanswer && textEmotion && textDepress && textResult) {
            console.log('useEffect 실행')
            console.log('chatbotanswer : ', chatbotanswer)
            console.log('textEmotion : ', textEmotion)
            console.log('textDepress : ', textDepress)
            console.log('textDepressValue : ', textDepressValue)
            console.log('audioDepress : ', audioDepress)
            console.log('================================================')
            addNote();
        } else {
            console.log('useEffect 실행 안됩니다 addNote() 실행 안됨')
        }
    }, [chatbotanswer, textEmotion, textDepress, textResult])

    const handlePress = async (text) => {
        console.log('================================================')
        console.log('handlePress 함수 실행')
        console.log('text : ', text)

        const chatAnswer = await doKobert(text);
        const text_depress = await doTextDepress(text);

        console.log('챗봇 응답 : ', chatAnswer)
        console.log('텍스트 모델 결과 : ', text_depress)
        console.log('textDepressValue : ', text_depress.depress_value)

        setChatbotanswer(chatAnswer);
        setTextEmotion(text_depress.emotion_list);
        setTextDepress(text_depress.depress_list);
        setTextDepressValue(text_depress.depress_value);
        setTextResult(text_depress);
        console.log('handlePress 함수 종료')
        console.log('================================================')
    };

    const saveAudioNote = async() => {
        setIsLoading(true);
        console.log('saveAudioNote 함수 실행')
        const { transcript, response } = await stopRecording();
        await handlePress(transcript);
        setIsLoading(false);
        console.log('saveAudioNote 함수 종료\n=======================')
    }
      

    const deleteNote = async(rowMap, key) => {
        Alert.alert("일기를 삭제합니다.", "삭제하시겠습니까?",[
            { text: "취소" },
            { 
                text: "삭제",
                style: "destructive", 
                onPress: async()=> {
                    closeRow(rowMap, key);
                    let newNote = [...note]
                    newNote = newNote.filter((item) => Object.keys(item)[0] !== key);
                    setNote(newNote);
                    await saveNote(newNote);
                }
            }
        ])
    }

    const formatDate = (timestamp) => {
        const date = new Date(Number(timestamp));
        // 원하는 날짜 포맷 적용
        const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        return formattedDate;
    };

    //일기누르면 나오는 상세페이지
    const [selectedNoteKey, setSelectedNoteKey] = useState(null);

    const noteDetail = (key)=> {
        setSelectedNoteKey(key);
    }

    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    };

    const [sound, setSound] = useState(null);
    const [isAudioPlay, setIsAudioPlay] = useState(false);
    const [isAudioPause, setIsAudioPause] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(null);
    
    const playAudio = async (audioFileURL) => {
        try {
            setIsAudioPlay(true);
            if (sound !== null) {
                await sound.unloadAsync();
            }
            const newSound = new Audio.Sound();
            await newSound.loadAsync({ uri: audioFileURL });
            console.log('녹음파일 재생 !!');
            await newSound.playAsync();
            console.log('녹음파일 재생 종료 !!');
            setSound(newSound);
        } catch (error) {
            console.log('오디오 재생 중 에러 발생:', error);
        }
    };
      
    const pauseAudio = async () => {
        try {
            console.log('녹음파일 일시정지 함수 실행');
            setIsAudioPlay(false);
            setIsAudioPause(true);
            const status = await sound.getStatusAsync();
            setPlaybackPosition(status.positionMillis);
            await sound.pauseAsync();
        } catch (error) {
            console.log('오디오 일시정지 중 에러 발생:', error);
        }
    };
      
    const resumeAudio = async () => {
        try {
            console.log('녹음파일 다시 재생 함수 실행');
            setIsAudioPlay(true);
            setIsAudioPause(false);
            await sound.playFromPositionAsync(playbackPosition);
        } catch (error) {
            console.log('오디오 다시 재생 중 에러 발생:', error);
        }
    };

    const initAudio = async() => {
        if (sound !== null) {
            await sound.stopAsync();
            await sound.unloadAsync();
        }
        setSound(null);
        setIsAudioPlay(false);
        setIsAudioPause(false);
        setPlaybackPosition(null);
    }
      
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor:'#fcfdfe' }}>
            {
                //일기 클릭하면 Detail 페이지
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
                        setIsAudioPlay={setIsAudioPlay}
                        totalDepressValue={totalDepressValue}
                        setTotalDepressValue={setTotalDepressValue}
                    />
                )
                //평소에는 일기 목록 페이지 & 일기쓰기
                : (
                    <Pressable style={{ flex: 1 }} onPress={()=> Keyboard.dismiss()}>

                        <View style={{ borderBottomColor: '#416753', borderBottomWidth: 1,  }}>
                            <Text style={styles.header}>오늘 있었던 일을 말해 주세요!</Text>
                        </View>

                        {isRecording && <Recording />}
                        {isLoading && <Roading isGetGoogleSTT={isGetGoogleSTT} isGetAudioResult={isGetAudioResult} isGetTextResult={isGetTextResult} isGetChatResult={isGetChatResult} isLoading={isLoading} isRecording={isRecording} />}
                        <SwipeListView
                            data={note}
                            renderItem={ data => (
                                    <View style={styles.note}>
                                        <TouchableHighlight 
                                            activeOpacity={0.9}
                                            underlayColor="#DDDDDD"
                                            onPress={()=>noteDetail(Object.keys(data.item)[0])}>
                                                <View>
                                                    <Text style={styles.date}>{formatDate(Object.keys(data.item)[0])}</Text>
                                                    <Text>{Object.values(data.item)[0].text}</Text>
                                                </View>
                                        </TouchableHighlight>
                                    </View>
                            )}
                            renderHiddenItem={(data, rowMap) => (
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <View style={{ flex: 0.5, backgroundColor: 'white' }}></View>
                                    <View style={styles.swipeHiddenItem}>
                                        <TouchableOpacity onPress={()=>deleteNote(rowMap, Object.keys(data.item)[0])}>
                                            <Icon style={styles.swipeIcon} name='trash-outline' size={30} color='white' />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            rightOpenValue={-70}
                            style={{marginBottom: 50}}>

                            
                        </SwipeListView>

                        
                        <View style={styles.writeDiary}>
                            <View style={[styles.inputContainer, isKeyboardVisible && { bottom: 210 }]}>
                                <TextInput 
                                    onChangeText={onChangeText}
                                    value={text}
                                    multiline={true}
                                    style={styles.input}
                                    placeholder={"오늘 있었던 일을 써주세요."}
                                />
                                { //녹음버튼
                                    isRecording ? (
                                        <TouchableOpacity style={styles.recordBtn} onPress={() => { console.log('녹음 종료 버튼 눌림'); saveAudioNote(); } }>
                                                <Icon name='mic-sharp' size={30} color='red' />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity style={styles.recordBtn} onPress={() => {console.log('녹음 시작 버튼 눌림'); startRecording(); } }>
                                            <Icon name='mic-sharp' size={30} color='#576F72' />
                                        </TouchableOpacity>
                                    )
                                }
                                <TouchableOpacity onPress={ ()=> { handlePress(text); Keyboard.dismiss(); } }>
                                    <Icon style={styles.send} name='arrow-up-circle' size={35} color='#576F72' />
                                </TouchableOpacity>
                            </View>
                        </View>

                        

                    </Pressable>
                )
            }
        </SafeAreaView>
    )
}

function Recording(){
    return(
        <View style={roadingstyles.container}>
            <View style={ {flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Icon name='radio-button-on' size={60} color='red' />
                <Text style={roadingstyles.text}>녹음중 입니다...</Text>
                <Text style={roadingstyles.text}>녹음을 종료하시려면 아이콘을 한번더 터치해주세요.</Text>
            </View>
        </View>
    )
}

function Roading({ isGetGoogleSTT, isGetAudioResult, isGetTextResult, isGetChatResult, isRecording }){

    return(
        <View style={roadingstyles.container}>
            <View style={ {flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Image 
                    source={require('./../assets/loading.gif')}
                    style={{ width: 150, height: 150, opacity: 1}}
                />
                { isGetGoogleSTT && <Text style={[roadingstyles.text, { opacity: 1 }]}>텍스트로 변환중입니다...</Text> }
                { isGetAudioResult && <Text style={[roadingstyles.text, { opacity: 1 }]}>음성 분석중입니다....</Text> }
                { isGetChatResult && <Text style={[roadingstyles.text, { opacity: 1 }]}>챗봇이 응답중입니다...</Text> }
                { isGetTextResult && <Text style={[roadingstyles.text, { opacity: 1 }]}>텍스트 분석중입니다....</Text> }
            </View>
        </View>
    ) 
}

const roadingstyles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(128, 128, 128, 0.8)',
        zIndex: 1,
        marginVertical: 180,
    },

    text: {
        color: 'white',
        fontSize: 18
    }
});

/////////////////////Detail 페이지///////////////////////
function Detail(props){
    const chartConfig = {
        backgroundGradientFrom: "#f9f9f9",
        backgroundGradientTo: "#f9f9f9",
        color: (opacity = 1) => `rgba(41, 44, 61, ${opacity})`,
        strokeWidth: 3,    
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        style: {
          borderRadius: 16,
        },
    };
    const screenWidth = Dimensions.get('window').width
    const date = new Date(Number(props.selectedNoteKey));
    const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const selectedNote = props.note.find(item => Object.keys(item)[0] === props.selectedNoteKey);
    const chatbotanswerArray = selectedNote[props.selectedNoteKey].chatbotanswer
    const textemotionArray = selectedNote[props.selectedNoteKey].textEmotion
    const textDepressArray = selectedNote[props.selectedNoteKey].textDepress
    const textDepressValue = selectedNote[props.selectedNoteKey].textDepressValue
    const audioEmotion = selectedNote[props.selectedNoteKey].audioDepress.emotion
    const audioDepressValue = selectedNote[props.selectedNoteKey].audioDepress.sigmoid_value[0][0]
    const totalDepressValuetemp = ((textDepressValue*0.8)+(audioDepressValue*0.2)) * 100
    
    let audioDepressData = selectedNote[props.selectedNoteKey].audioDepress
    
    const textemotionCounts = textemotionArray.reduce((counts, emotion) => {
        counts[emotion] = (counts[emotion] || 0) + 1;
        return counts;
    }, {});
    const textDepressCount = textDepressArray.reduce((counts, textdepress) => {
        counts[textdepress] = (counts[textdepress] || 0) + 1;
        return counts;
    }, {});


    //Detail page 텍스트 우울 그래프
    const colors = {'감정조절이상': '#222831', '불면': '#746272', '분노': '#B3685C', '불안': '#D4B85F', '초조': '#90A243', '슬픔': '#82AF99', '외로움': '#89A0A9', '우울': '#4F6C8C', '의욕상실': '#869b92', '무기력': '#F38181', '자살': '#424874', '자존감저하': '#B7C4CF', '절망': '#E84545', '죄책감': '#E23E57', '집중력저하': '#FFCFDF', '피로': '#F07B3F', '식욕저하': '#753422', '식욕증가': '#F9ECEC', '일상': '#FFB6B6'};
    const [textDepressChartdata, setTextDepressChartdata] = useState([]);
    const getTextDepressChartdata = ()=> {
        const tempData = [];
        const totalCount = Object.values(textDepressCount).reduce((a, b) => a + b, 0);
        Object.entries(textDepressCount).map(([textdepress, count], index, arr) => {
            const percent = (count / totalCount) * 100;
            tempData.push({ name: textdepress, color: colors[textdepress], percent: percent});
      })
      setTextDepressChartdata(tempData);
    };
    useEffect(()=>{
        getTextDepressChartdata();
        props.setTotalDepressValue(totalDepressValuetemp);
    }, [])
    
    console.log('======================!!!!! 데이터 확인 !!!!!==============================')
    console.log('KEY : ', props.selectedNoteKey)
    console.log('데이터 : ', selectedNote[props.selectedNoteKey])
    console.log('textDepressValue : ', textDepressValue)
    console.log('textDepressChartdata : ', textDepressChartdata)
    console.log('totalDepressValuetemp : ', totalDepressValuetemp)
    console.log('===========================================================================')
    return (
        <SafeAreaView style={{ flex: 1 , backgroundColor: 'white' }}>
            <View style={{ flexDirection: 'row'}}>
                <TouchableOpacity style={styles.backbtn} onPress={()=>{props.setSelectedNoteKey(null); props.initAudio()}}>
                    <Icon name='chevron-back-outline' size={40} color='#576F72' />
                </TouchableOpacity>
                <Text style={styles.detailHeader}>일기 상세 페이지</Text>
            </View>

            <View style={styles.detailNote}>
                <Text style={styles.detailDate}>{formattedDate} 작성</Text>
                <Text selectable={true}>{selectedNote[props.selectedNoteKey].text}</Text>
                    {
                        selectedNote[props.selectedNoteKey].audio ? (
                            props.isAudioPause ? (
                                <View style={styles.playaudio}>
                                  <TouchableOpacity onPress={() => { props.resumeAudio() }}>
                                    <Icon name='ios-play' size={35} color='#576F72' />
                                  </TouchableOpacity>
                                </View>
                                ) : (
                                    props.isAudioPlay ? (
                                        <View style={styles.playaudio}>
                                            <TouchableOpacity onPress={() => { props.pauseAudio() }}>
                                            <Icon name='md-pause' size={35} color='#576F72' />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.playaudio}>
                                            <TouchableOpacity onPress={() => { props.playAudio(selectedNote[props.selectedNoteKey].audio.file) }}>
                                            <Icon name='ios-play' size={35} color='#576F72' />
                                            </TouchableOpacity>
                                        </View>
                                    )
                                )  
                        ) : (
                            null
                        )
                    }
            </View>

            <ScrollView>
                <View style={styles.detailChatbot}>

                    <Text style={styles.detailChatbotAnswerHeader}>위로형 챗봇 응답</Text>
                    <View style={styles.detailChatbotAnswer}>
                        <Text>
                            {
                                chatbotanswerArray
                                .sort((a, b) => b.softmax_value - a.softmax_value) // softmax_value를 내림차순으로 정렬
                                .reduce((uniqueAnswers, currentAnswer) => {
                                    const isAmbiguous = uniqueAnswers.some((a) => a.situation === '모호함');
                                    if (isAmbiguous && currentAnswer.situation === '모호함') {
                                        return uniqueAnswers;
                                    }
                                    if (
                                    (!uniqueAnswers.some((a) => a.answer === currentAnswer.answer) ||
                                        (isAmbiguous && currentAnswer.situation !== '모호함')) &&
                                        currentAnswer.softmax_value > 0.07 
                                    ) {
                                        uniqueAnswers.push(currentAnswer.answer);
                                    }
                                        return uniqueAnswers;
                                }, [])
                                .slice(0, Math.min(chatbotanswerArray.length, 3)) 
                                .join(' ') || "긍정적인 내용인 것 같아서 위로해 드릴게 없네요!"
                            }
                        </Text>
                    </View>

                    <Text style={styles.detailChatbotSituationHeader}>오늘의 대표 감정</Text>
                    <View style={styles.detailChatbotSituation}>
                        {
                            Object.entries(textemotionCounts).map(([emotion, count], index, arr) => {
                            // 가장 많이 등장한 감정만 표시
                            if (count === Math.max(...Object.values(textemotionCounts))) {
                                return (
                                <Text key={index}>
                                    {emotion}, {audioEmotion}
                                </Text>
                                );
                            }
                                return null; // 다른 감정은 표시하지 않음
                            })
                        }
                        {

                        }
                    </View>

                    <Text style={styles.detailChatbotSituationHeader}>텍스트,음성 우울감 분석</Text>
                    <View style={styles.detailChatbotSituation}>
                        <Text>우울감 정도: {totalDepressValuetemp.toFixed(2)}%</Text>
                        {
                            (textDepressValue >= 0.6) ? (
                                <>
                                <Text>우울 양상을 보이는 문장의 비율이 높습니다!</Text>
                                    <View style={chartstyles.container}>
                                        {
                                            textDepressChartdata.map((item, index) => (
                                                <View
                                                    key={index}
                                                    style={{
                                                        ...chartstyles.barSegment,
                                                        backgroundColor: item.color,
                                                        flex: item.percent,
                                                        marginTop: 5
                                                }}>
                                                <Text style={chartstyles.text}>{item.name}</Text>
                                                </View>
                                            ))
                                        }
                                    </View>
                                </>

                            ) : (
                                null
                            )
                        }
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const chartstyles = StyleSheet.create({
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
  