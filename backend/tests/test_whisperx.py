import whisperx

AUDIO_FILE = r"E:\whisper-test\ami\IS1001a.Mix-Headset.wav"

device = "cpu"
compute_type = "int8"

print("Loading WhisperX model...")

model = whisperx.load_model(
    "base",
    device=device,
    compute_type=compute_type
)

print("Transcribing...")

result = model.transcribe(AUDIO_FILE)

print("\n===== TRANSCRIPT =====\n")

for segment in result["segments"]:
    print(
        f"[{segment['start']:.2f} - {segment['end']:.2f}] "
        f"{segment['text']}"
    )