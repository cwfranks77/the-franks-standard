# Phone greeting audio

## 1. Drop raw recordings here

From Voice Memos, copy into this folder:

- `charles-raw.m4a` (any format: mp3, wav, m4a)
- `brandy-raw.m4a`

## 2. Enhance (noise + volume + trim silence)

```powershell
cd C:\Users\ninja\dev\the-franks-standard
npm run audio:enhance
```

Creates:

- `charles-greeting.mp3`
- `brandy-greeting.mp3`

**Wrong words / stumbles:** re-record that clip — automation cannot fix speech mistakes.

## 3. Deploy + Twilio secrets

See `docs/GREETING-RECORDINGS.md`
