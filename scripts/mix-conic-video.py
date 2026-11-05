from pathlib import Path
import argparse,json,subprocess,hashlib,shutil
p=argparse.ArgumentParser();p.add_argument('--ffmpeg',default=shutil.which('ffmpeg'));p.add_argument('--music',required=True);a=p.parse_args()
if not a.ffmpeg:raise SystemExit('Set --ffmpeg to an installed FFmpeg executable')
root=Path(__file__).resolve().parents[1]
timeline=json.loads((root/'production/conic-timeline.json').read_text(encoding='utf-8'));duration=timeline['duration']
out=root/'assets/video/conic-distance.mp4'
voice=root/'production/audio/conic-narration.wav';music=Path(a.music).resolve()
# The music runs once continuously. Voice is prioritised with side-chain ducking.
filters=(f'[1:a]aresample=48000,highpass=f=65,loudnorm=I=-18:TP=-2:LRA=8,adelay=600|600,apad,atrim=duration={duration},asplit=2[voice][side];'
 f'[2:a]atrim=start=12:duration={duration},asetpts=PTS-STARTPTS,aresample=48000,volume=0.14,afade=t=in:st=0:d=1.5,afade=t=out:st={duration-3}:d=3[bg];'
 '[bg][side]sidechaincompress=threshold=0.025:ratio=5:attack=30:release=350:makeup=1[duck];'
 '[voice][duck]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.84:level=false[mix]')
cmd=[a.ffmpeg,'-hide_banner','-y','-i',str(root/'tmp/conic-silent.mp4'),'-i',str(voice),'-i',str(music),'-filter_complex',filters,'-map','0:v:0','-map','[mix]','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-t',str(duration),'-movflags','+faststart',str(out)]
r=subprocess.run(cmd,capture_output=True,text=True,encoding='utf-8',errors='replace');
if r.returncode:raise SystemExit(r.stderr[-5000:])
analysis=subprocess.run([a.ffmpeg,'-hide_banner','-i',str(out),'-vn','-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,encoding='utf-8',errors='replace')
(root/'production/conic-audio-measurement.txt').write_text(analysis.stderr[-2200:],encoding='utf-8')
sources={'date':'2026-11-06','narration':{'engine':'Local Qwen CustomVoice 0.6B','voice':'温柔女声','speed':1.05,'file':'production/audio/conic-narration.wav','sha256':hashlib.sha256(voice.read_bytes()).hexdigest(),'rawDurationSeconds':59.1105,'fullListeningReview':False},'music':{'title':'A Kind Of Hope','artist':'Scott Buckley','page':'https://www.scottbuckley.com.au/library/a-kind-of-hope/','download':'https://www.scottbuckley.com.au/library/wp-content/uploads/2022/10/AKindOfHope.mp3','license':'CC BY 4.0','licenseUrl':'https://creativecommons.org/licenses/by/4.0/','sha256':hashlib.sha256(music.read_bytes()).hexdigest(),'acquired':'Official public download link in an isolated headless browser; no user cookies or authentication.','excerptStartSeconds':12,'excerptDurationSeconds':duration,'changes':'Excerpted, faded, volume adjusted, side-chain ducked and mixed with original synthetic narration. No artist endorsement implied.','attribution':"‘A Kind Of Hope’ by Scott Buckley — released under CC BY 4.0. www.scottbuckley.com.au"},'mix':{'sidechainDucking':True,'continuousMusic':True,'musicLooped':False,'peakLimiterLinear':.84,'fullListeningReview':False,'note':'Signal measurement and ASR do not establish naturalness or mix listening review.'}}
(root/'production/conic-audio-sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
manifest={'id':'conic-distance','title':'三种曲线，三种距离约定','chapter':'m13','file':'assets/video/conic-distance.mp4','poster':'assets/video/conic-poster.jpg','captions':'assets/video/conic-distance.vtt','duration':duration,'width':timeline['width'],'height':timeline['height'],'fps':timeline['fps'],'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'narration':'synthetic','music':'A Kind Of Hope — Scott Buckley · CC BY 4.0','rendered':True,'continuousVisualReview':False,'fullListeningReview':False,'teacherReview':'not-performed','scope':'A short explanation of conic distance definitions and one ellipse calculation; not a whole-chapter recap or full course coverage.'}
(root/'production/video-manifest.json').write_text(json.dumps({'updated':'2026-11-06','videos':[manifest]},ensure_ascii=False,indent=2),encoding='utf-8')
def stamp(t):
 ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000);return f'{h:02d}:{m:02d}:{s:02d}.{ms:03d}'
vtt='WEBVTT\n\n'+'\n\n'.join(f'{i+1}\n{stamp(start)} --> {stamp(end)}\n{text}' for i,(start,end,text) in enumerate(timeline['subtitles']))+'\n'
(root/'assets/video/conic-distance.vtt').write_text(vtt,encoding='utf-8')
print(json.dumps({'video':manifest['file'],'duration':duration,'bytes':manifest['bytes'],'sha256':manifest['sha256'],'audio':'Narration + licensed continuous music, ducked; full listening review not performed.'},ensure_ascii=False,indent=2))
