import requests
import json
import time

api_url = 'http://localhost:8787/api/moroccan-law-qa'
headers = {'Content-Type': 'application/json'}

questions = [
    ('Q1: Suspended Sentence & Criminal Record', 'ar', 'هل سجن غير نافذ سيكتب في حسن السيرة؟'),
    ('Q2: Documents for Engagement Certificate', 'ar', 'ما هي الوثائق المطلوبة للحصول على شهادة الخطوبة في حالة السجن؟'),
    ('Q3: Buyer Knowledge as Evidence', 'ar', 'هل يمكن اعتبار علم المشتري المسبق بالضرائب كدليل ضده في الشكوى؟'),
]

results = []

for label, lang, question in questions:
    print(f'\n{"="*70}')
    print(f'{label}')
    print(f'{"="*70}')
    print(f'Question: {question}\n')
    
    body = {'messages': [{'role': 'user', 'content': question}], 'language': lang}
    
    try:
        start = time.time()
        r = requests.post(api_url, json=body, timeout=120)
        elapsed = time.time() - start
        
        if r.status_code == 200:
            data = r.json()
            print(f'Model: gpt-4.1-nano')
            print(f'Response time: {elapsed:.1f}s')
            print(f'Response length: {len(data["content"])} chars\n')
            print(f'Answer:\n{data["content"]}\n')
            results.append({'label': label, 'success': True, 'time': elapsed})
        else:
            print(f'Error {r.status_code}: {r.text[:200]}')
            results.append({'label': label, 'success': False})
    except Exception as e:
        print(f'Exception: {e}')
        results.append({'label': label, 'success': False})
    
    time.sleep(1)

print(f'\n{"="*70}')
print('SUMMARY')
print(f'{"="*70}')
for r in results:
    status = '✓' if r['success'] else '✗'
    time_str = f"{r.get('time', 0):.1f}s" if r['success'] else "failed"
    print(f'{status} {r["label"]}: {time_str}')
