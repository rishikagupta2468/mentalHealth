from nltk.corpus import wordnet, stopwords
import textstat
import warnings
from textblob.np_extractors import ConllExtractor
from textblob import TextBlob
from nltk import pos_tag
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
from collections import defaultdict
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import numpy as np
import pandas as pd
import re
import nltk
import pickle
warnings.filterwarnings("ignore")

"""1. Tokenize</br>
2. Lemmatize</br>
3. Pos taggging
"""


def tokenize_lemmatize_pos_tag(dataframe):
    tokenized_tweet = dataframe['Text'].apply(lambda x: x.split())
    dataframe['Text_Final'] = tokenized_tweet
    # WordNetLemmatizer requires Pos tags to understand if the word is noun or verb or adjective etc. By default it is set to Noun
    tag_map = defaultdict(lambda: wordnet.NOUN)
    tag_map['J'] = wordnet.ADJ
    tag_map['V'] = wordnet.VERB
    tag_map['R'] = wordnet.ADV
    for index, entry in enumerate(dataframe['Text_Final']):
        # Declaring Empty List to store the words that follow the rules for this step
        Final_words = []
        # Initializing WordNetLemmatizer()
        word_Lemmatized = WordNetLemmatizer()
        # pos_tag function below will provide the 'tag' i.e if the word is Noun(N) or Verb(V) or something else.
        for word, tag in pos_tag(entry):
            # Below condition is to check for Stop words and consider only alphabets
            if word not in stopwords.words('english') and word.isalpha():
                word_Final = word_Lemmatized.lemmatize(word, tag_map[tag[0]])
                Final_words.append(word_Final)
        # The final processed set of words for each iteration will be stored in 'text_final'
        dataframe.loc[index, 'Text_Final'] = str(Final_words)
    print("Tokenization + lemmatization + pos tagging complete\n")

    return dataframe


"""4. BAG OF WORDS"""

sentence_re = r'(?:(?:[A-Z])(?:.[A-Z])+.?)|(?:\w+(?:-\w+)*)|(?:\$?\d+(?:.\d+)?%?)|(?:...|)(?:[][.,;"\'?():-_`])'
grammar = r"""
    NBAR:
        {<NN.*|JJ>*<NN.*>}  # Nouns and Adjectives, terminated with Nouns
        
    NP:
        {<NBAR>}
        {<NBAR><IN><NBAR>}  # Above, connected with in/of/etc...
"""
chunker = nltk.RegexpParser(grammar)


class PhraseExtractHelper(object):
    def __init__(self):
        self.lemmatizer = nltk.WordNetLemmatizer()

    def leaves(self, tree):
        """Finds NP (nounphrase) leaf nodes of a chunk tree."""
        for subtree in tree.subtrees(filter=lambda t: t.label() == 'NP'):
            yield subtree.leaves()

    def normalise(self, word):
        """Normalises words to lowercase and stems and lemmatizes it."""
        word = word.lower()
        word = self.lemmatizer.lemmatize(word)
        return word

    def acceptable_word(self, word):
        """Checks conditions for acceptable word: length, stopword. We can increase the length if we want to consider large phrase"""
        accepted = bool(3 <= len(word) <= 40
                        and 'https' not in word.lower()
                        and 'http' not in word.lower()
                        and '#' not in word.lower()
                        )
        return accepted

    def get_terms(self, tree):
        for leaf in self.leaves(tree):
            term = [self.normalise(w)
                    for w, t in leaf if self.acceptable_word(w)]
            yield term


def bow_st(dataframe):
    key_phrases = []
    phrase_extract_helper = PhraseExtractHelper()
    for index, row in dataframe.iterrows():
        toks = nltk.regexp_tokenize(row.Text_Final, sentence_re)
        postoks = nltk.tag.pos_tag(toks)
        tree = chunker.parse(postoks)

        terms = phrase_extract_helper.get_terms(tree)
        tweet_phrases = []

        for term in terms:
            if len(term):
                tweet_phrases.append(' '.join(term))

        key_phrases.append(tweet_phrases)

    key_phrases[:10]
    textblob_key_phrases = []
    extractor = ConllExtractor()

    for index, row in dataframe.iterrows():
        # filerting out all the hashtags
        words_without_hash = [
            word for word in row.Text_Final.split() if '#' not in word.lower()]
        hash_removed_sentence = ' '.join(words_without_hash)
        blob = TextBlob(hash_removed_sentence, np_extractor=extractor)
        textblob_key_phrases.append(list(blob.noun_phrases))

    textblob_key_phrases[:10]
    dataframe['key_phrases'] = textblob_key_phrases
    phrase_sents = dataframe['key_phrases'].apply(lambda x: ' '.join(x))
    print('Bag of words complete.\n')
    return dataframe


"""Testing"""
filename = 'finalized_model.sav'

model = pickle.load(open(filename, 'rb'))
test_df = pd.read_excel('./Data/user_dataset_input.xlsx')
bow_test_dataframe = tokenize_lemmatize_pos_tag(test_df)
bow_test_dataframe = bow_st(bow_test_dataframe)
enc = LabelEncoder()
vec = pickle.load(open('vectorizer.pickle', 'rb'))
X_test = vec.transform(bow_test_dataframe['Text_Final'])
y_pred = model.predict(X_test)
result = pd.read_excel('./Data/user_dataset_input.xlsx')
result['Label'] = y_pred
# print(len(result))
for i in range(len(result)):
    if result.iloc[i, -1] == 0:
        result.iloc[i, -1] = "Not suicidal"
    else:
        result.iloc[i, -1] = "Suicidal"
# result['Label'].replace({0: "Non-Suicidal", 1: "Suicidal"})
print(result['Label'])
result.to_excel('./Data/output.xlsx', index=False)
