import openai
from moviepy.editor import VideoFileClip
import os


def transcribe_and_summarize(video_path):
    """
    Transcribe and summarize video in Vietnamese or English
    target_language: "vi", "en", or "auto"
    """

    # Extract audio
    video = VideoFileClip(video_path)
    if video != None and video.audio is not None:
        video.audio.write_audiofile("audio.mp3")
    else:
        print("No audio track found in the video.")
        exit(1)

    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Transcribe
    with open("audio.mp3", "rb") as audio_file:
        transcript_result = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
        )

    detected_language = transcript_result.language
    transcript = transcript_result.text

    # Language-specific prompts
    prompts = {
        "vi": {
            "system": "Bạn là một trợ lý AI chuyên phân tích nội dung video. Hãy tóm tắt một cách chính xác và súc tích.",
            "user": f"Tóm tắt nội dung chính của video từ transcript sau:\n\n{transcript}",
        },
        "en": {
            "system": "You are an AI assistant specialized in video content analysis. Provide accurate and concise summaries.",
            "user": f"Summarize the main content of the video from this transcript:\n\n{transcript}",
        },
    }

    # Choose prompt based on detected language
    if detected_language == "vietnamese":
        selected_prompts = prompts["vi"]
    elif detected_language == "english":
        selected_prompts = prompts["en"]
    else:
        # Default to English for other languages
        selected_prompts = prompts["en"]

    # Generate summary
    summary_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": selected_prompts["system"]},
            {"role": "user", "content": selected_prompts["user"]},
        ],
        max_tokens=300,
        temperature=0.3,
    )

    # Cleanup
    video.close()
    os.remove("audio.mp3")

    return {
        "transcript": transcript,
        "detected_language": detected_language,
        "summary": summary_response.choices[0].message.content,
    }


# Usage examples
result = transcribe_and_summarize("/home/aaronpham/Coding/ReelsAI/videos/sample.mp4")
print(f"Language: {result['detected_language']}")
print(f"Summary: {result['summary']}")
