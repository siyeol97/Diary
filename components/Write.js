import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet,
            Text,
            View,
            Button,
            TextInput,
            Keyboard,
            Pressable,
            ScrollView,
            TouchableOpacity,
            Alert,
            TouchableHighlight,
            SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {SwipeListView} from 'react-native-swipe-list-view';
import axios from 'axios';
import styles from './Writestyle';
import AudioRecorder from './AudioRecoder';
import AudioPlayer from './AudioPlayer';

const STORAGE_KEY = "@note"

export default function Write({ navigation }){

    //TextInput에 입력한 text
    const [text, setText] = useState("");
    const onChangeText = (payload) => setText(payload);

    const [textEmotion, setTextEmotion] = useState([]);

    useEffect(()=>{
        loadNote();
    }, [])

    const [note, setNote] = useState([]);

    const saveNote = async (toSave) => {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    }
    
    const loadNote = async ()=> {
        const s = await AsyncStorage.getItem(STORAGE_KEY)
        const parsedNote = JSON.parse(s);

        if (parsedNote === null) {
            setNote([]);
        } else {
            setNote(parsedNote);
        }
    };

    const addNote = async ()=> {
        console.log('addNote 함수 실행')
        if(text === ""){
          return
        }
        // save to do
        const newNote = [...note]
        const newData = {[Date.now()]: {text, textEmotion}}
        newNote.unshift(newData)
        setNote(newNote);
        await saveNote(newNote);
        setText("");
        setTextEmotion([]);
    }

    const doKobert = async (text) => {
        console.log('kobert 모델 실행 :', text)
        try {
          const url = 'http://192.168.0.90:5000';
          const user_input = text;
      
          const response = await axios.post(url, { user_input: user_input });
          const responseData = response.data;
          const transformedData = responseData.output_list.map(item => {
            return {
              answer: item.answer,
              situation: item.situation,
              softmax_value: item.softmax_value
            };
          });
          
          console.log('transformedData : ', transformedData);
          console.log('================================================')

          return transformedData;

        } catch (error) {
          console.error('Request error:', error);
          return [];
        }
    };

    useEffect(()=> {
        if (textEmotion.length > 0) {
            console.log('useEffect 실행')
            console.log('TextEmotion : ', textEmotion)
            console.log('--------------------------------------------')
            addNote();
        }
    }, [textEmotion])

    const handlePress = async (text) => {
        console.log('================================================')
        console.log('handlePress 함수 실행')
        const transformedData = await doKobert(text);

        setTextEmotion(transformedData);
        console.log('handlePress 함수 종료')
        console.log('================================================')
    };
      

    const deleteNote = async(key) => {
        Alert.alert("일기를 삭제합니다.", "삭제하시겠습니까?",[
            { text: "취소" },
            { 
                text: "삭제",
                style: "destructive", 
                onPress: async()=> {
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
        const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
        return formattedDate;
    };

    const [selectedNoteKey, setSelectedNoteKey] = useState(null);

    const noteDetail = (key)=> {
        setSelectedNoteKey(key);
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {
                selectedNoteKey ? (
                    <Detail selectedNoteKey={selectedNoteKey} setSelectedNoteKey={setSelectedNoteKey} note={note} />
                )
                : (
                    <Pressable style={{ flex: 1 }} onPress={()=> Keyboard.dismiss()}>
                        <Text style={styles.header}>오늘의 일기 쓰기</Text>
                        <View style={styles.writeDiary}>
                                <TextInput 
                                    onChangeText={onChangeText}
                                    value={text}
                                    multiline={true}
                                    style={styles.input}
                                    placeholder={"오늘 있었던 일을 써주세요."}
                                />
                                <TouchableOpacity onPress={ ()=> { handlePress(text); Keyboard.dismiss(); } }>
                                    <Icon style={styles.send} name='arrow-down-circle' size={35} color='green' />
                                </TouchableOpacity>
                        </View>

                        <AudioRecorder></AudioRecorder>
                        <AudioPlayer></AudioPlayer>
                        
                        <SwipeListView 
                            closeOnRowPress={true}
                            closeOnScroll={true}
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
                                <View style={styles.swipeHiddenItem}>
                                    <TouchableOpacity onPress={()=>deleteNote(Object.keys(data.item)[0])}>
                                            <Icon style={styles.swipeIcon} name='ios-close' size={40} color='red' />
                                    </TouchableOpacity>
                                </View>
                            )}
                            rightOpenValue={-40}
                        />
                    </Pressable>
                )
            }
        </SafeAreaView>
    )
}

function Detail(props){
    const date = new Date(Number(props.selectedNoteKey));
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    const selectedNote = props.note.find(item => Object.keys(item)[0] === props.selectedNoteKey);
    const textEmotionArray = selectedNote[props.selectedNoteKey].textEmotion
    console.log(textEmotionArray)
    return (
        <SafeAreaView style={{ flex: 1 , backgroundColor: 'rgba(245, 255, 250, 0.5)' }}>
            <Text style={styles.detailHeader}>일기 상세 페이지</Text>
            <View style={styles.detailNote}>
                <Text style={styles.detailDate}>{formattedDate} 작성</Text>
                <Text selectable={true}>{selectedNote[props.selectedNoteKey].text}</Text>
            </View>

            <View style={styles.detailChatbot}>
                <Text style={styles.detailChatbotAnswerHeader}>위로형 챗봇 응답 - 부정적인 내용일 때</Text>
                <View style={styles.detailChatbotAnswer}>
                    <Text>
                        {
                            textEmotionArray
                            .sort((a, b) => b.softmax_value - a.softmax_value) // softmax_value를 내림차순으로 정렬
                            .reduce((uniqueAnswers, currentAnswer) => {
                                const isAmbiguous = uniqueAnswers.some((a) => a.situation === '모호함');
                                if (isAmbiguous && currentAnswer.situation === '모호함') {
                                return uniqueAnswers;
                                }
                                if (
                                (!uniqueAnswers.some((a) => a.answer === currentAnswer.answer) ||
                                    (isAmbiguous && currentAnswer.situation !== '모호함')) &&
                                currentAnswer.softmax_value > 0.15 // softmax_value가 0.15 이상인 경우에만 추가
                                ) {
                                uniqueAnswers.push(currentAnswer.answer);
                                }
                                return uniqueAnswers;
                            }, [])
                            .slice(0, Math.min(textEmotionArray.length, 2)) // 배열 길이가 2 이상이면 최대 2개의 요소만 선택
                            .join(' ') || "긍정적인 내용인 것 같아서 위로해 드릴게 없네요!"
                        }
                    </Text>
                </View>
                
                <Text style={styles.detailChatbotSituationHeader}>예측되는 상황</Text>
                <View style={styles.detailChatbotSituation}>
                    <Text>
                        {
                            textEmotionArray
                            .sort((a, b) => b.softmax_value - a.softmax_value) // softmax_value를 내림차순으로 정렬
                            .reduce((uniqueSituations, currentAnswer) => {
                                const isAmbiguous = uniqueSituations.some((a) => a === '모호함');
                                if (isAmbiguous && currentAnswer.situation === '모호함') {
                                return uniqueSituations;
                                }
                                if (
                                (!uniqueSituations.includes(currentAnswer.situation) ||
                                    (isAmbiguous && currentAnswer.situation !== '모호함')) &&
                                currentAnswer.softmax_value > 0.15 // softmax_value가 0.15 이상인 경우에만 추가
                                ) {
                                uniqueSituations.push(currentAnswer.situation);
                                }
                                return uniqueSituations;
                            }, [])
                            .slice(0, Math.min(textEmotionArray.length, 2)) // 배열 길이가 2 이상이면 최대 2개의 요소만 선택
                            .join(', ') || "긍정적인 내용인것 같아요"
                        }
                    </Text>
                </View>
            </View>

            <Button
                title="뒤로가기"
                onPress={() => props.setSelectedNoteKey(null)}
            />
        </SafeAreaView>
    );
      
}
