import { UnsupportedMediaTypeException } from '@nestjs/common';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new UnsupportedMediaTypeException('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const documentFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/)) {
    return callback(new UnsupportedMediaTypeException('Only image, PDF, or DOC files are allowed!'), false);
  }
  callback(null, true);
};

export const companyImageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(png|svg)$/)) {
      return callback(new UnsupportedMediaTypeException('Only PNG or SVG image files are allowed!'), false);
    }
    callback(null, true);
  };