import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: 25,
        marginTop: 13,
        marginBottom: -7
    },

    writeDiary: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    input: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 30,
        marginVertical: 20,
        marginRight: 5,
        marginLeft: 17,
        fontSize: 16,
        marginHorizontal: 15,
        borderWidth: 1,
        borderColor: 'green',
        borderRadius: 25,
    },

    send: {
        marginHorizontal: 3,
        marginRight: 10
    },

    note: {
        flex: 1,
        backgroundColor: 'rgba(245, 255, 250, 1)',
        marginBottom: 15,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15,
        flexDirection: 'colonm',
        marginHorizontal: 15,
        borderWidth: 2,
        borderColor: 'green'
    },

    swipeHiddenItem: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 15
    },

    swipeIcon: {
        marginRight: 8
    },

    date: {
        fontSize: 16,
        marginBottom: 5,
    },

    detailDate: {
        fontSize: 17,
    },

    detailNote: {
        backgroundColor: 'mintcream',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: 'green',
        borderRadius: 20,
        marginHorizontal: 10,
        marginVertical: 10,
    },

    detailHeader: {
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: 25,
        marginTop: 13,
        flexDirection: 'row'
    },

    detailChatbot: {
    },

    detailChatbotAnswer: {
        backgroundColor: 'beige',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: 'burlywood',
        borderRadius: 20,
        marginHorizontal: 10,
        marginVertical: 10
    },

    detailChatbotSituation: {
        backgroundColor: 'beige',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: 'burlywood',
        borderRadius: 20,
        marginHorizontal: 10,
        marginVertical: 10
    },

    detailChatbotAnswerHeader: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 17
    },

    detailChatbotSituationHeader: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 17
    },

    recordBtn: {
        backgroundColor: 'lightgrey',
        marginTop: -8,
        marginBottom: 15,
        marginHorizontal: 18
    },

    stopRecordBtn: {
        backgroundColor: 'red',
        marginTop: -8,
        marginBottom: 15,
        marginHorizontal: 18
    },

    playaudio: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -10
    }
})

export default styles