import sys
import os
import numpy as np
from moviepy.editor import VideoFileClip
from PIL import Image

if len(sys.argv) != 2:
    print("Usage: python videoToTiles.py <input_video_path>")
    sys.exit(1)
video_path = sys.argv[1]
out_dir = 'out/'

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

video = VideoFileClip(video_path)

for i, frame in enumerate(video.iter_frames()):
    if i < 80:
        frame_path = os.path.join(out_dir, f"frame_{i}.png")
        frame_arr = np.clip(frame, 0, 255)
        frame_arr[frame_arr < 128] = 0
        frame_arr[frame_arr > 127] = 255

        frame_image = Image.fromarray(frame_arr)
        frame_image.save(frame_path)

video.close()
print("Done")