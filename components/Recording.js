import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LoadingStyles from '../styles/LoadingStyles';

// 일기 녹음 버튼 클릭 시 렌더링
export default function Recording() {
  return (
    <View style={LoadingStyles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Icon
          name='radio-button-on'
          size={60}
          color='red'
        />
        <Text style={LoadingStyles.text}>녹음중 입니다...</Text>
        <Text style={LoadingStyles.text}>
          녹음을 종료하시려면 아이콘을 한번더 터치해주세요.
        </Text>
      </View>
    </View>
  );
}
