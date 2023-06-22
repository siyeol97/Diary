import torch
import torch.nn as nn
import random

from model.classifier import KoBERTforSequenceClassfication
from transformers import BertModel
from kobert_tokenizer import KoBERTTokenizer


def load_wellness_answer():
    root_path = "."
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


if __name__ == "__main__":
    root_path = "."
    checkpoint_path = f"{root_path}/checkpoint"
    save_ckpt_path = f"{checkpoint_path}/kobert-wellness-text-classification.pth"

    # 답변과 카테고리 불러오기
    category, answer = load_wellness_answer()

    ctx = "cuda" if torch.cuda.is_available() else "cpu"
    device = torch.device(ctx)

    # 저장한 Checkpoint 불러오기
    checkpoint = torch.load(save_ckpt_path, map_location=device)

    model = KoBERTforSequenceClassfication()
    model.load_state_dict(checkpoint['model_state_dict'])

    model.to(ctx)
    model.eval()

    tokenizer = KoBERTTokenizer.from_pretrained('skt/kobert-base-v1')

    user_input = input('\nUser Input: ')
    sentences = user_input.split('.')  # 입력 문장을 '.'으로 분할하여 리스트에 저장

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
            answer_output = f'Answer: {answer_list[answer_index]}, Index: {max_index}, Situation: {category[str(max_index)]}, Softmax Value: {max_index_value}'

            output_list.append(answer_output)

    print('\nChatbot Output:')
    for output in output_list:
        print(output)
    print('-' * 50)