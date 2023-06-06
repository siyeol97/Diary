import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, Keyboard, Pressable, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {SwipeListView} from 'react-native-swipe-list-view';

const STORAGE_KEY = "@note"

export default function Write({ navigation }){

    //TextInput에 입력한 text
    const [text, setText] = useState("");
    const onChangeText = (payload) => setText(payload);

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
        if(text === ""){
          return
        }
        // save to do
        const newNote = [...note]
        const newData = {[Date.now()]: {text}}
        newNote.push(newData)
        setNote(newNote);
        await saveNote(newNote);
        setText("");
    }

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

      

    return (
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
                    <TouchableOpacity onPress={ ()=> { addNote(); Keyboard.dismiss(); } }>
                        <Icon style={styles.send} name='arrow-down-circle' size={35} color='green' />
                    </TouchableOpacity>
            </View>
            
            <SwipeListView 
                closeOnRowPress={true}
                closeOnScroll={true}
                data={note}
                renderItem={ data => (
                    <View style={styles.note}>
                        <Text style={styles.date}>{formatDate(Object.keys(data.item)[0])}</Text>
                        <Text>{Object.values(data.item)[0].text}</Text>
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

const styles = StyleSheet.create({
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: 25,
        marginTop: 13,
        marginBottom: -7
    },

    writeDiary: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    input: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 30,
        marginVertical: 20,
        marginRight: 5,
        fontSize: 16,
        marginHorizontal: 15,
        borderWidth: 1,
        borderColor: 'green',
        borderRadius: 25,
    },

    send: {
        marginHorizontal: 3,
        marginRight: 10
    },

    note: {
        flex: 1,
        backgroundColor: 'white',
        marginBottom: 15,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15,
        flexDirection: 'colonm',
        marginHorizontal: 15,
    },

    swipeHiddenItem: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    swipeIcon: {
        marginRight: 8,
        marginTop: -15
    },

    date: {
        fontSize: 16,
        marginBottom: 5,
    }
})