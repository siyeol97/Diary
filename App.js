import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import Statistics from './components/Statistics';
import Setting from './components/Setting';
import Tabs from './components/Tab';
import Icon from 'react-native-vector-icons/Ionicons';
import Write from './components/Write';

const Tab = createBottomTabNavigator();

export default function App() {

  const [note, setNote] = useState([]);

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
            } else if (route.name === 'Setting') {
              iconName = focused
                ? 'settings'
                : 'settings-outline';
            } else if (route.name === 'Write') {
              iconName = focused
                ? 'book'
                : 'book-outline';
            }
            
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Statistics" children={()=><Statistics note={note} setNote={setNote} />} />
        <Tab.Screen name="Write" children={()=><Write note={note} setNote={setNote} />} />
        <Tab.Screen name="Setting" component={Setting} />
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {

  },
});
