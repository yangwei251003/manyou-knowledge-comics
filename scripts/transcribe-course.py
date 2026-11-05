from pathlib import Path
import argparse,json
from faster_whisper import WhisperModel
p=argparse.ArgumentParser();p.add_argument('--audio',required=True);p.add_argument('--model',required=True);p.add_argument('--out',required=True);a=p.parse_args()
model=WhisperModel(a.model,device='cpu',compute_type='int8',cpu_threads=6)
segments,info=model.transcribe(a.audio,language='zh',beam_size=5,word_timestamps=True,vad_filter=True)
data=[{'start':s.start,'end':s.end,'text':s.text,'words':[{'start':w.start,'end':w.end,'word':w.word} for w in (s.words or [])]} for s in segments]
Path(a.out).write_text(json.dumps({'language':info.language,'segments':data,'note':'ASR checks wording and timing only; does not establish listening review.'},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps([{'start':x['start'],'end':x['end'],'text':x['text']} for x in data],ensure_ascii=False))
