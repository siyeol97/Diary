import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 25,
    marginTop: 13,
    marginBottom: 10,
  },

  writeDiary: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 30,
    marginVertical: 10,
    marginRight: 5,
    marginLeft: 17,
    fontSize: 16,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: '#576F72',
    borderRadius: 25,
  },

  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },

  send: {
    marginHorizontal: 3,
    marginRight: 10,
    marginTop: 6,
  },

  note: {
    flex: 1,
    backgroundColor: '#e4f0ea',
    marginBottom: 0,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 0,
    flexDirection: 'colonm',
    marginHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#416753',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.3 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },

  swipeHiddenItem: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: 'red',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },

  swipeIcon: {
    marginRight: 18,
  },

  date: {
    fontSize: 16,
    marginBottom: 5,
  },

  detailDate: {
    fontSize: 17,
  },

  detailNote: {
    backgroundColor: '#F8F6F4',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#213028',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 10,
  },

  detailHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 25,
    marginTop: 13,
    marginLeft: 65,
  },
  backBtn: {
    marginTop: 8,
    marginLeft: 10,
  },

  detailChatbot: {},

  detailChatbotAnswer: {
    backgroundColor: '#F8F6F4',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#213028',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 10,
  },

  detailChatbotSituation: {
    backgroundColor: '#F8F6F4',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#213028',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 10,
  },

  detailChatbotAnswerHeader: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 17,
  },

  detailChatbotSituationHeader: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 17,
  },

  recordBtn: {
    marginTop: 8,
    zIndex: 1,
  },

  stopRecordBtn: {
    backgroundColor: 'red',
    marginTop: -8,
    marginBottom: 15,
    marginHorizontal: 18,
  },

  playAudio: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -10,
  },
});

export default styles;
