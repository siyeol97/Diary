import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import LoadingStyles from '../styles/LoadingStyles';

export default function Loading({
  isGetGoogleSTT,
  isGetAudioResult,
  isGetTextResult,
  isGetChatResult,
}) {
  return (
    <View style={LoadingStyles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('./../assets/loading.gif')}
          style={{ width: 150, height: 150, opacity: 1 }}
        />
        {isGetGoogleSTT && (
          <Text style={[LoadingStyles.text, { opacity: 1 }]}>
            텍스트로 변환중입니다...
          </Text>
        )}
        {isGetAudioResult && (
          <Text style={[LoadingStyles.text, { opacity: 1 }]}>
            음성 분석중입니다....
          </Text>
        )}
        {isGetChatResult && (
          <Text style={[LoadingStyles.text, { opacity: 1 }]}>
            챗봇이 응답중입니다...
          </Text>
        )}
        {isGetTextResult && (
          <Text style={[LoadingStyles.text, { opacity: 1 }]}>
            텍스트 분석중입니다....
          </Text>
        )}
      </View>
    </View>
  );
}
