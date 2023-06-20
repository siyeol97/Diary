import { View, Button, Text, Linking, StyleSheet } from 'react-native';
import axios from 'axios';
import { useState } from 'react';

export default function Getplaylist({ note }){
    const [playlist, setPlaylist] = useState('');
    const [depressName, setDepressName] = useState();

    console.log(note);
    const GETPLAYLIST_URL_LOCAL_ADDRESS = "https://e7ad-35-185-42-206.ngrok-free.app/playlist"
    
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


    const getPlaylistURL = async(depressName) => {
        console.log('getPlaylistURL 함수 실행 : ', depressName);
        
        try {
            const url = GETPLAYLIST_URL_LOCAL_ADDRESS;
            
            const response = await axios.post(url, { depressName: depressName });
            const playlistURL = response.data;
            
            console.log('================================================')
            console.log('playlistURL : ', playlistURL);
            console.log('================================================')
            setPlaylist(playlistURL.user_playlist);
            return playlistURL;

        } catch (error) {
            console.error('플레이리스트 가져오기 실패 :', error);
            return;
        }
    }
    
    const getPlaylist = ()=> {
        const depressName = getMostFrequentEmotion(depressList);
        getPlaylistURL(depressName);
        setDepressName(depressName);
    }

    return (
        <View>
            <View style={styles.topEmotionView}>
                <Text style={[styles.text, {marginBottom: 8, marginTop: 17}]}>오늘의 대표 우울 양상</Text>
                <Text style={[styles.text, {marginTop: 15}]}>{depressName}</Text>
            </View>

            <View style={styles.playListView}>
                <Text style={[styles.text, {marginBottom: 8, marginTop: 17}]}>플레이리스트</Text>
                {
                    depressName ? (
                        <Text style={[styles.text, {marginTop: 15}]} onPress={() => Linking.openURL(playlist)}>{depressName}에 어울리는 플리보러 가기!</Text>
                    ) : (
                        <Text style={[styles.text, {marginTop: 15}]}>먼저 플레이 리스트를 가져와 주세요 !</Text>
                    )
                }
                
            </View>

            <View style={styles.getListbtn}>
                <Button 
                    onPress={getPlaylist}
                    title='추천 플레이 리스트 가져오기 !'
                />
            </View>
        </View>
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
        marginHorizontal: 30
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

    playListView: {
        marginBottom: 30,
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
    }
})


