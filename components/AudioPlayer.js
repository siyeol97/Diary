import { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AudioPlayer() {
    const [audioData, setAudioData] = useState({});

    useEffect(() => {
        getData()
    }, [])

    //스토리지 audio 객체 가져오기
    const getData = async () => {
        try {
            const audio = await AsyncStorage.getItem("audio")
            if (audio) {
                setAudioData(JSON.parse(audio))
            }
        } catch (e) {
            console.log(e)
        }
    }

    const playAudio = async () => {
        const sound = new Audio.Sound();
        await sound.loadAsync({ uri: audioData.file });
        console.log('Playing Sound');
        await sound.replayAsync();
    }

    return (
        <View style={{ width: 200, height: 200 }}>
            {audioData.sound &&
                <>
                    <Text>{audioData.duration}</Text>
                    <Button style={styles.button} onPress={playAudio} title="Play"></Button>
                </>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 44,
        height: 44,
    },
    noteText: {
        fontSize: 12,
        marginTop: 5,
    },
    button: {
        width: 50,
        margin: 16
    }
});