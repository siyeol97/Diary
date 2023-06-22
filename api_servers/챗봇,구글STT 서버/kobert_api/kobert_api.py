from flask import Flask, request, jsonify, make_response
import torch
import torch.nn as nn
from kobert_wellness_chatbot_main.model.classifier import KoBERTforSequenceClassfication
from transformers import BertModel
from kobert_tokenizer import KoBERTTokenizer
import random
import os
import logging
from kss import split_sentences
from flask_cors import CORS


#GOOGLE STT API KEY .JSON FILE
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""

from datetime import datetime
from google.cloud import speech
import logging



## 1. GOOGLE STT API SERVER에 오디오파일 제공 - 텍스트 데이터 받아와서
## 2. 
app = Flask(__name__)
app.logger.setLevel(logging.DEBUG)
CORS(app)

def generate_unique_filename():
    current_date = datetime.now().strftime('%Y%m%d')
    timestamp = datetime.now().strftime('%H%M%S')
    return f'file_{current_date}_{timestamp}.wav'

#오디오 파일 받아와서 변환된 텍스트 응답
@app.route('/audio', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return {'error': 'No audio file found'}, 400

    file = request.files['file']

    # 저장할 파일 경로
    file_name = generate_unique_filename()
    file_path = os.path.join('./audiofiles', file_name)

    # 파일 저장
    file.save(file_path)

    # Google STT API 요청
    response = transcribe_audio(file_path)
    app.logger.info('response: %s', response)

    # 결과 반환
    return {'transcript': response}

#GOOLE STT REQUEST
def transcribe_audio(file_path):
    # Instantiates a client
    client = speech.SpeechClient()

    # 음성 파일 읽기
    with open(file_path, 'rb') as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=41000,
        language_code="ko-KR",
    )

    # 음성 인식 요청
    response = client.recognize(config=config, audio=audio)

    transcript = ''
    for result in response.results:
        transcript += result.alternatives[0].transcript
    
    app.logger.info('transcript: %s', transcript)

    return transcript

def load_wellness_answer():
    root_path = "./kobert_wellness_chatbot_main"
    category_path = f"{root_path}/data/wellness_dialog_category.txt"
    answer_path = f"{root_path}/data/wellness_dialog_answer.txt"

    c_f = open(category_path, 'r', encoding='utf-8')
    a_f = open(answer_path, 'r', encoding='utf-8')

    category_lines = c_f.readlines()
    answer_lines = a_f.readlines()

    category = {}
    answer = {}
    for line_num, line_data in enumerate(category_lines):
        data = line_data.split('    ')
        category[data[1][:-1]] = data[0]

    for line_num, line_data in enumerate(answer_lines):
        data = line_data.split('    ')
        keys = answer.keys()
        if (data[0] in keys):
            answer[data[0]] += [data[1][:-1]]
        else:
            answer[data[0]] = [data[1][:-1]]

    return category, answer

def kobert_input(tokenizer, str, device=None, max_seq_len=512):
    index_of_words = tokenizer.encode(str)
    token_type_ids = [0] * len(index_of_words)
    attention_mask = [1] * len(index_of_words)

    # Padding Length
    padding_length = max_seq_len - len(index_of_words)

    # Zero Padding
    index_of_words += [0] * padding_length
    token_type_ids += [0] * padding_length
    attention_mask += [0] * padding_length

    data = {
        'input_ids': torch.tensor([index_of_words]).to(device),
        'token_type_ids': torch.tensor([token_type_ids]).to(device),
        'attention_mask': torch.tensor([attention_mask]).to(device),
    }
    return data

#텍스트 받아와서 감정분석 응답
@app.route('/', methods=['GET', 'POST'])
def process_input():
    if request.method == 'POST':
        
        data = request.get_json()

        user_input = data['user_input']
        sentences = split_sentences(user_input)
        #sentences = [sentence for sentence in user_input.split('.') if sentence]
        print('sentences : ', sentences)
        

        output_list = []  # 각 문장에 대한 챗봇 출력값을 저장할 리스트

        for sent in sentences:
            if sent.strip():  # 빈 문자열이 아닌 경우에만 실행
                data = kobert_input(tokenizer, sent.strip(), device, 512)

                output = model(**data)

                logit = output[0]
                softmax_logit = torch.softmax(logit, dim=-1)
                softmax_logit = softmax_logit.squeeze()

                max_index = torch.argmax(softmax_logit).item()
                max_index_value = softmax_logit[torch.argmax(softmax_logit)].item()

                answer_list = answer[category[str(max_index)]]
                answer_len = len(answer_list) - 1
                answer_index = random.randint(0, answer_len)
                answer_output = {
                    'answer': answer_list[answer_index],
                    'index': max_index,
                    'situation': category[str(max_index)],
                    'softmax_value': max_index_value
                }

                output_list.append(answer_output)

        return jsonify({'output_list': output_list})
    
    else:
        response = make_response('This is a GET request.')
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response
        
if __name__ == "__main__":
    root_path = "./kobert_wellness_chatbot_main"
    checkpoint_path = f"{root_path}/checkpoint"
    save_ckpt_path = f"{checkpoint_path}/kobert_wellness_text_classification.pth"

    # 답변과 카테고리 불러오기
    category, answer = load_wellness_answer()

    ctx = "cuda" if torch.cuda.is_available() else "cpu"
    device = torch.device(ctx)

    # 저장한 Checkpoint model 불러오기
    checkpoint = torch.load(save_ckpt_path, map_location=device)

    model = KoBERTforSequenceClassfication()
    model.load_state_dict(checkpoint['model_state_dict'])

    model.to(ctx)
    model.eval()

    tokenizer = KoBERTTokenizer.from_pretrained('skt/kobert-base-v1')

    app.run(host='0.0.0.0', port=80, debug=True)
