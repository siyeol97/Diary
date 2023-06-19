import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import Statistics from './components/Statistics';
import Selfcare from './components/Selfcare';
import Icon from 'react-native-vector-icons/Ionicons';
import Write from './components/Write';

const Tab = createBottomTabNavigator();

export default function App() {

  const [note, setNote] = useState([]);
  const [totalDepressValue, setTotalDepressValue] = useState();

  return (
    <NavigationContainer>
      <StatusBar style="black" />
      
      <Tab.Navigator
        initialRouteName="Write"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Statistics') {
              iconName = focused
                ? 'ios-stats-chart'
                : 'ios-stats-chart-outline';
            } else if (route.name === 'Selfcare') {
              iconName = focused
                ? 'heart'
                : 'heart-outline';
            } else if (route.name === 'Write') {
              iconName = focused
                ? 'book'
                : 'book-outline';
            }
            
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4C6050',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Statistics" children={()=><Statistics note={note} setNote={setNote} totalDepressValue={totalDepressValue} setTotalDepressValue={setTotalDepressValue} />} />
        <Tab.Screen name="Write" children={()=><Write note={note} setNote={setNote} totalDepressValue={totalDepressValue} setTotalDepressValue={setTotalDepressValue} />} />
        <Tab.Screen name="Selfcare" children={()=><Selfcare note={note} />} />
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}
