const Photo = require('../models/photo.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    const pattern = new RegExp(/(<\s*(strong|em)*>(([A-z]|\s)*)<\s*\/\s*(strong|em)>)|(([A-z]|\s|\.)*)/, 'g');
    const titleMatched = title.match(pattern).join('');
    const authorMatched = title.match(pattern).join('');

    if (titleMatched.length < title.length) throw new Error('Invalid characters...');
    if (authorMatched.length < author.length) throw new Error('Invalid characters...');

    const validateEmail =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email.match(validateEmail)) throw new Error('Invalid email');

    const titleMaxLength = 25;
    const authorMaxLength = 50;

    if (title.length >= titleMaxLength) throw new Error('Title is too long');
    if (author.length >= authorMaxLength) throw new Error('Author name is too long');

    const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
    const fileExtension = fileName.split('.').slice(-1)[0];

    if (fileExtension !== 'jpg' && fileExtension !== 'png' && fileExtension !== 'gif')
      throw new Error('Unsupported file format');

    if (!title && !author && !email && !file) throw new Error('Wrong input!'); // if fields are empty...

    const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
    await newPhoto.save(); // ...save new photo in DB
    res.json(newPhoto);
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
