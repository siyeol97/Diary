import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Button, Touchable, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { SimpleLineIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

//녹음 설정
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

export default function AudioRecorder() {
  const [recording, setRecording] = useState();

  //녹음 시작
  async function startRecording() {
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
      console.log('Recording started');

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  //녹음 종료
  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
  
    //녹음파일 객체 생성
    const {sound, status} = await recording.createNewLoadedSoundAsync();
    
    const audio = {
      sound : sound,
      file : recording.getURI(),
      duration: getDurationFormatted(status.durationMillis),
      status : status
    }

    //스토리지 저장
    await AsyncStorage.setItem("audio", JSON.stringify(audio))
  }

  //시간 표시
  function getDurationFormatted(millis) {
    const minutes = millis / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesDisplay) * 60);
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutesDisplay}:${secondsDisplay}`;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={{justifyContent:'center', alignItems:'center'}} onPress={recording ? stopRecording : startRecording}>
        {recording ?
          <>
            <MaterialCommunityIcons name="stop" size={24} color="black" />
            <Text style={styles.noteText}>녹음종료</Text>
          </>
          :
          <>
            <SimpleLineIcons name="microphone" size={24} color="black" />
            <Text style={styles.noteText}>음성일기</Text>          
          </>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width:44,
    height:44,
  },
  noteText:{
    fontSize:12,
    marginTop:5,
  },
  button: {
    width:50,
    margin: 16
  }
});