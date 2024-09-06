import { useState } from 'react';

const initialEmotionData = [
  {
    name: '두려움',
    Count: 0,
    color: '#746272',
    legendFontColor: '#595959',
    legendFontSize: 15,
  },
  {
    name: '놀람',
    Count: 0,
    color: '#B78A89',
    legendFontColor: '#595959',
    legendFontSize: 0,
  },
  {
    name: '화남',
    Count: 0,
    color: '#B3685C',
    legendFontColor: '#595959',
    legendFontSize: 15,
  },
  {
    name: '슬픔',
    Count: 0,
    color: '#4F6C8C',
    legendFontColor: '#595959',
    legendFontSize: 15,
  },
  {
    name: '중립',
    Count: 0,
    color: '#D4B85F',
    legendFontColor: '#595959',
    legendFontSize: 15,
  },
  {
    name: '행복함',
    Count: 0,
    color: '#82AF99',
    legendFontColor: '#595959',
    legendFontSize: 15,
  },
  {
    name: '모멸감',
    Count: 0,
    color: '#90A243',
    legendFontColor: '#595959',
    legendFontSize: 15,
  },
];

export const useEmotionData = () => {
  const [emotionData, setEmotionData] = useState(initialEmotionData);
  return [emotionData, setEmotionData];
};
