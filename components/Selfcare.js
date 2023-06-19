import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Getplaylist from './Getplaylist';
import Gettodo from './Gettodo';

export default function Selfcare({ note }){

    const [isPhq, setIsPhq] = useState(false);
    const [isMusic, setIsMusic] = useState(false);
    const [isTodo, setIsTodo] = useState(false);

    const goBack = ()=> {
        if(isPhq){
            setIsPhq(false);
        } else if(isMusic) {
            setIsMusic(false);
        } else if(isTodo) {
            setIsTodo(false);
        }
    }

    useEffect(()=> {
        setIsPhq(false);
        setIsMusic(false);
        setIsTodo(false);
    }, [])

    const goPhq = ()=> {
        setIsPhq(true);
    }

    const goMusic = ()=> {
        setIsMusic(true);
    }

    const goTodo = () => {
        setIsTodo(true);
    }

    if (isPhq) {
        return <Phq goBack={goBack} />
    }

    if (isMusic) {
        return <Music goBack={goBack} note={note} />
    }

    if (isTodo) {
        return <Todo goBack={goBack} note={note} />
    }

    return (

        <View>
            <TouchableOpacity
                onPress={()=>goPhq()}
                activeOpacity={0.7}
                style={[ styles.menu, {marginTop: 30} ]}>
                <Text style={[styles.menuText, {color: 'white'}]}>PHQ-9 검사하러 가기 !</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={()=>goMusic()}
                activeOpacity={0.7}
                style={styles.menu}>
                <Text style={[styles.menuText, {color: 'white'}]}>음악 추천 받기 !</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={()=>goTodo()}
                activeOpacity={0.7}
                style={styles.menu}>
                <Text style={[styles.menuText, {color: 'white'}]}>할일 추천 받기 !</Text>
            </TouchableOpacity>
        </View>
    )
}

function Todo({ goBack, note }){
    return(
        <View>
            <View>
                <TouchableOpacity style={styles.backbtn} onPress={()=>{goBack()}}>
                        <Icon name='chevron-back-outline' size={40} color='#576F72' />
                </TouchableOpacity>
                <Text style={styles.playlistheader}>오늘의 대표감정에 따라 퀘스트를 추천해 드려요!</Text>
            </View>
            
            <Gettodo note={note} />
        </View>
    )
}

function Phq({ goBack }){
    return(
        <View>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.backbtn} onPress={()=>{goBack()}}>
                        <Icon name='chevron-back-outline' size={40} color='#576F72' />
                </TouchableOpacity>
                <Text style={styles.questionHeader}>PHQ-9 검사</Text>
            </View>
            <Question />
        </View>
    )
}

//PHQ-9 검사 페이지
function Question(){
    const data = [
        '기분이 가라앉거나, 우울하거나, 희망이 없다고 \n느꼈다.',
        '평소 하던 일에 대한 흥미가 없어지거나 즐거움을 \n느끼지 못했다.',
        '잠들기가 어렵거나 자주 깼다 \n혹은 너무 많이 잤다.',
        '평소보다 식욕이 줄었다 혹은 \n평소보다 많이 먹었다.',
        '다른 사람들이 눈치챌 정도로 평소보다 \n말과 행동이 느려졌다`\n`혹은 너무 안절부절 못해서 가만히 앉아있을 수 없었다.',
        '피곤하고 기운이 없었다.',
        '내가 잘못 했거나, 실패했다는 생각이 들었다 \n혹은 자신과 가족을 실망시켰다고 생각했다',
        '신문을 읽거나 TV를 보는 것과 같은 일상적인 \n일에도 집중할 수가 없었다.',
        '차라리 죽는 것이 더 낫겠다고 생각했다 \n혹은 자해 할 생각을 했다'
    ];
    const score = [0, 1, 2, 3];


    useEffect(()=>{
        setResult(0);
    }, [])

    const [result, setResult] = useState(0);
    const sumScore = (score)=> {
        let newResult = result;
        setResult(newResult+score);
        console.log(score, '눌림')
        console.log('총합 : ', newResult+score);
    }

    return (
        <ScrollView style={styles.Phqscroll}>
            {
                data.map((item, i)=> {
                    return(
                        <View key={i}>
                            <View style={styles.questionArea}>
                                <Text style={styles.questionItem}>{item}</Text>
                            </View>
                            <View style={styles.scoreArea}>
                                <TouchableOpacity style={styles.s_area} onPress={()=>sumScore(score[0])}>
                                    <Text style={styles.score}>{score[0]}</Text>
                                </TouchableOpacity >
                                <TouchableOpacity style={styles.s_area} onPress={()=>sumScore(score[1])}>
                                    <Text style={styles.score}>{score[1]}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.s_area} onPress={()=>sumScore(score[2])}>
                                    <Text style={styles.score}>{score[2]}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.s_area} onPress={()=>sumScore(score[3])}>
                                    <Text style={styles.score}>{score[3]}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                    )
                })
            }
        </ScrollView>
    )
}

//음악 추천 페이지
function Music({ goBack, note }){
    return(
        <View>
            <View>
                <TouchableOpacity style={styles.backbtn} onPress={()=>{goBack()}}>
                        <Icon name='chevron-back-outline' size={40} color='#576F72' />
                </TouchableOpacity>
                <Text style={styles.playlistheader}>오늘의 대표감정에 따라 음악을 추천해 드려요!</Text>
            </View>
            
            <Getplaylist note={note} />
        </View>
    )
}

const styles = StyleSheet.create({
    menu: {
        backgroundColor: '#576F72',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 5,
        flexDirection: 'colonm',
        marginBottom: 30,
        marginHorizontal: 25,
        borderWidth: 1,
        borderColor: 'black',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        color: 'white'
    },

    Phqscroll: {
        marginBottom: 43
    },

    menuText: {
        fontSize: 16
    },

    backbtn: {
    },

    questionHeader: {
        height: 25,
        marginTop: 10,
        fontSize: 22,
        marginLeft: 100
    },

    questionArea: {
        backgroundColor: '#C2CEC7',
        borderRadius: 5,
        borderColor: '#4A6654',
        borderWidth: 1,
        marginHorizontal: 30,
    },

    questionItem: {
        textAlign: 'center',
        paddingHorizontal: 30,
        paddingVertical: 10,
    },

    scoreArea: {
        flexDirection: 'row',
        justifyContent: 'center'
    },

    s_area: {
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 15,
    },

    score: {
        fontSize: 20,
        
    },

    playlistheader: {
        textAlign: 'center',
        fontSize: 20,
        marginTop: 30,
        marginBottom: 10
    }
})