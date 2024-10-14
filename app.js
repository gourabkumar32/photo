const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/imageUpload');

// Image schema and model
const imageSchema = new mongoose.Schema({
    imagePath: String
});

const Image = mongoose.model('Image', imageSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
app.get('/', async (req, res) => {
    const images = await Image.find();
    res.render('index', { images });
});

app.post('/upload', upload.single('image'), (req, res) => {
    const newImage = new Image({ imagePath: req.file.filename });
    newImage.save()
        .then(() => res.redirect('/'))
        .catch(err => res.status(500).send(err));
});

app.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await Image.findByIdAndDelete(id);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
