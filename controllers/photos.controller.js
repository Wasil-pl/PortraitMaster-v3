const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const requestIp = require('request-ip');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    const pattern = new RegExp(/^[a-zA-Z ]*$/);
    const titleMatched = title.match(pattern).join('');
    const authorMatched = author.match(pattern).join('');

    if (titleMatched.length < title.length) throw new Error('Invalid characters...');
    if (authorMatched.length < author.length) throw new Error('Invalid characters...');

    const emailRegexp = /^[a-zA-Z0-9\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9]{1,5}$/;
    if (!email.match(emailRegexp)) throw new Error('Invalid email');

    const titleMaxLength = 25;
    const authorMaxLength = 50;

    if (title.length >= titleMaxLength) throw new Error('Title is too long');
    if (author.length >= authorMaxLength) throw new Error('Author name is too long');

    const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
    const fileExtension = fileName.split('.').slice(-1)[0];
    const acceptedFileExtensions = ['jpg', 'png', 'gif'];

    if (!acceptedFileExtensions.includes(fileExtension)) throw new Error('Unsupported file format');

    if (!title && !author && !email && !file) throw new Error('Wrong input!'); // if fields are empty...

    const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
    await newPhoto.save(); // ...save new photo in DB
    res.json(newPhoto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const photoId = req.params.id;
    const photoToUpdate = await Photo.findById(photoId);
    if (!photoToUpdate) return res.status(404).json({ message: 'Not found' });

    const userIp = requestIp.getClientIp(req);
    const voter = (await Voter.findOne({ user: userIp })) || new Voter({ user: userIp, votes: [] });

    if (voter.votes.includes(photoId))
      return res.status(409).json({ message: 'This user has already voted for this photo.' });

    voter.votes.push(photoId);
    await voter.save();

    photoToUpdate.votes++;
    await photoToUpdate.save();

    return res.send({ message: 'OK' });
  } catch (err) {
    return res.status(500).json(err);
  }
};
