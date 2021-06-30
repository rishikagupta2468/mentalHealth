import csv
import pandas as pd
import numpy as np
import re
import string
import preprocessor as p
from emot.emo_unicode import UNICODE_EMO, EMOTICONS

path = './Data/user_dataset_input.xlsx'
df = pd.read_excel(path)
df.head()

"""**Remove hashtag**"""


def remove_hashtag(text):
    text = re.sub(r"#(\w+)", ' ', text, flags=re.MULTILINE)
    return text


"""**Remove mentions and URLs**"""


def remove_mentions_and_url(text):
    processed_text = re.sub(r"(?:\@|http?\://|https?\://|www)\S+", "", text)
    processed_text = " ".join(processed_text.split())
    return processed_text


"""**Remove Emojis**"""


# def remove_emojis(text):
#     p.set_options(p.OPT.EMOJI)
#     p.clean(text)
#     return text


"""**Convert Emoji to Text**"""


def convert_emojis_to_word(text):
    for emot in UNICODE_EMO:
        text = text.replace(emot, "_".join(
            UNICODE_EMO[emot].replace(",", "").replace(":", "").split()))
    return text


"""**Text Cleaning: Lowercasing, Removal of Punctuations and Removal of Digits**"""


def text_cleaning(text):
    text = "".join([char.lower()
                    for char in text if char not in string.punctuation])
    text = re.sub('[0-9]+', '', text)
    return text


"""Preprocessing Procedure"""

process_data = []
for i in range(0, len(df)):
    process_data.append(df['Text'][i])

for i in range(0, len(process_data)):
    process_data[i] = convert_emojis_to_word(process_data[i])

for i in range(0, len(process_data)):
    process_data[i] = remove_mentions_and_url(process_data[i])

for i in range(0, len(process_data)):
    process_data[i] = remove_hashtag(process_data[i])

# for i in range(0, len(process_data)):
#     process_data[i] = remove_emojis(process_data[i])

for i in range(0, len(process_data)):
    process_data[i] = text_cleaning(process_data[i])

df['Text'] = process_data

df = pd.DataFrame(data=df, index=None, columns=[
                  "Date", "Text", "Name", "Username", "Location", "Retweet_count", "Label"])
df.to_excel('./Data/user_dataset_processed.xlsx', index=False)
