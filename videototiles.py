from moviepy.editor import VideoFileClip
from PIL import Image
import os

video_path = 'badapple.mp4'
output_directory = 'out/'

if not os.path.exists(output_directory):
    os.makedirs(output_directory)

video = VideoFileClip(video_path)

for i, frame in enumerate(video.iter_frames()):
    if i == 33:
        for j, pixel in enumerate(frame):
            if j < 10:
                print(pixel)
    if i < 80:
        frame_path = os.path.join(output_directory, f"frame_{i}.png")
        frame_image = Image.fromarray(frame)
        frame_image.save(frame_path)

video.close()
print("Done")