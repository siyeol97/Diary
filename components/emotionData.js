import { useState } from 'react';

const initialEmotionData = [
    {
        name: "두려움",
        Count: 0,
        color: "#BEAEE2",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
    },
    {
        name: "놀람",
        Count: 0,
        color: "#F5EBE0",
        legendFontColor: "#7F7F7F",
        legendFontSize: 0
    },
    {
        name: "화가남",
        Count: 0,
        color: "#F0DBDB",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
    },
    {
        name: "슬픔",
        Count: 0,
        color: "#DBA39A",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
    },
    {
        name: "중립",
        Count: 0,
        color: "#CDF0EA",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
    },
    {
        name: "행복함",
        Count: 0,
        color: "#CCD5AE",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
    },
    {
        name: "모멸감",
        Count: 0,
        color: "#F7DBF0",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
    }
]

export const useEmotionData = () => {
    const [emotionData, setEmotionData] = useState(initialEmotionData);
  
    return [emotionData, setEmotionData];
};