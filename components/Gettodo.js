import { View, Button, Text, Linking, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { useState } from 'react';

export default function Gettodo({ note }){

    const [todolist, setTodolist] = useState('');
    const [depressName, setDepressName] = useState();

    console.log(note);
    const GETTODOLIST_URL_LOCAL_ADDRESS = "https://e7ad-35-185-42-206.ngrok-free.app/todo"

    const depressList = note[0][Object.keys(note[0])[0]].textDepress;

    const countEmotions = (depressList) => {
        console.log('countEmotions 함수 실행')
        console.log('depressList : ', depressList)
        const counts = {};
        try {
            depressList.forEach((emotion) => {
                counts[emotion] = (counts[emotion] || 0) + 1;
            });
            return counts;
        } catch(error){
            console.error('플레이리스트 가져오기 실패 :', error);
            return;
        }
    }

    const getMostFrequentEmotion = (depressList) => {
        const emotionCounts = countEmotions(depressList);
        const maxCount = Math.max(...Object.values(emotionCounts));
        const mostFrequentEmotions = Object.keys(emotionCounts).filter(
            (emotion) => emotionCounts[emotion] === maxCount
        );
        console.log('감정 이름 가져오기 성공')
        return mostFrequentEmotions[Math.floor(Math.random() * mostFrequentEmotions.length)];
    };

    const getTodolistURL = async(depressName) => {
        console.log('getTodolistURL 함수 실행 : ', depressName);
        
        try {
            const url = GETTODOLIST_URL_LOCAL_ADDRESS;
            
            const response = await axios.post(url, { depressName: depressName });
            const todolistURL = response.data;
            
            console.log('================================================')
            console.log('todolistURL : ', todolistURL);
            console.log('================================================')
            setTodolist(todolistURL.todo);
            return todolistURL;

        } catch (error) {
            console.error('플레이리스트 가져오기 실패 :', error);
            return;
        }
    }

    const getTodolist = ()=> {
        const depressName = getMostFrequentEmotion(depressList);
        getTodolistURL(depressName);
        setDepressName(depressName);
    }

    return (
        <ScrollView style={{ marginBottom: 107 }}>
            <View style={styles.topEmotionView}>
                <Text style={[styles.text, {marginBottom: 8, marginTop: 17}]}>오늘의 대표 우울 양상</Text>
                <Text style={[styles.text, {marginTop: 15}]}>{depressName}</Text>
            </View>

            <View style={styles.todoListView}>
                <Text style={[styles.text, {marginBottom: 8, marginTop: 17}]}>To Do List</Text>
                {
                    depressName ? (
                        <Text style={[styles.text, {marginTop: 15, marginBottom:10, fontSize: 15, paddingHorizontal: 10, textAlign:'left'}]}>{todolist}</Text>
                    ) : (
                        <Text style={[styles.text, {marginTop: 15, marginBottom: 10}]}>먼저 To Do List를 가져와 주세요 !</Text>
                    )
                }
            </View>

            <View style={styles.getListbtn}>
                <Button 
                    onPress={getTodolist}
                    title='할일 추천 리스트 가져오기 !'
                />
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    text: {
        textAlign: 'center',
        fontSize: 20,
        color: 'white'
    },

    getListbtn: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        backgroundColor: 'lightgrey',
        marginHorizontal: 30,
        marginBottom: 15
    },

    topEmotionView: {
        marginVertical: 30,
        backgroundColor: '#576F72',
        marginHorizontal: 30,
        height: 100,
        borderWidth: 1,
        borderColor: '#576F72',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
    },

    todoListView: {
        marginBottom: 30,
        backgroundColor: '#576F72',
        marginHorizontal: 30,
        borderWidth: 1,
        borderColor: '#576F72',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
    }
})


