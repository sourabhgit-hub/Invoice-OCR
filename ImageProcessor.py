import pytesseract
from pytesseract import Output
import cv2
import re
import numpy as np
import json
# from PIL import Image

class ImageProcessor:
    def __init__(self, img_path):
        self.img_path = img_path
        self.img = cv2.imread(img_path)
    
    # Show image
    def show(self):
        img=self.img
        cv2.imshow('img',img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    # grayscale
    def preprocess_image(self):
        self.grayscale()
        self.binarize(150)
        # self.remove_noise()

    def grayscale(self):
        self.img =cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)

    # binarize
    def binarize(self,thres):
        self.img = cv2.threshold(self.img,thres,240,cv2.THRESH_BINARY)[1]

    # noise removal
    def remove_noise(self):
        pass

    # returns true if string is not empty
    def notEmpty(self,str):
        for s in str:
            if(s!=' '):
                return True
        return False

    # get boxes around text
    def get_boxes(self):
        img=self.img
        d = pytesseract.image_to_data(img, output_type=Output.DICT)
        n_boxes = len(d['text'])
        for i in range(n_boxes):
            if int(d['conf'][i]) > 60 and self.notEmpty(d['text'][i]):
                (x, y, w, h) = (d['left'][i], d['top'][i], d['width'][i], d['height'][i])
                img = cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 1)
        self.show()

    # Get the text and dimensions of rectangle around the text
    def get_rect_data(self):
        img=self.img
        d = pytesseract.image_to_data(img, output_type=Output.DICT)
        n_boxes = len(d['text'])
        boxes=[]
        for i in range(n_boxes):
            if int(d['conf'][i]) > 50 and self.notEmpty(d['text'][i]):
                (x, y, w, h) = (d['left'][i], d['top'][i], d['width'][i], d['height'][i])
                boxes.append({'x': x, 'y': y, 'w': w, 'h': h, 'text': d['text'][i]})
        return boxes

    # returns  the text
    def get_all_text(self):
        return pytesseract.image_to_string(self.img, lang='eng')
    
def main():
    # img_path='static/uploaded_image.jpg'
    # image = ImageProcessor(img_path)
    # image.preprocess_image()
    # all_data = image.get_rect_data()

    # file_path = 'static/rectangles.json'
    # with open(file_path, 'w') as f:
    #     # Write each item in the list to the file
    #     json.dump(all_data, f, indent=2)
    pass

if __name__ == '__main__':
    main()