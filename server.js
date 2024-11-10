const express = require('express');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
// Initialize Express and PostgreSQL connection
const app = express();
const port = 3000;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'upload_002',
    password: 'percyjackson365',
    port: 5432,
});

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
app.post('/upload', upload.single('file'), async (req, res) => {
    const { blockAddr,rkey } = req.body;
    const file = req.file;

    if (!file) {
        return res.redirect('/error.html');
    }

    try {
        const queryText = 'INSERT INTO uploads(block_address, document_type, retrieve_key, file_path) VALUES($1, $2, $3, $4)';
        await pool.query(queryText, [blockAddr, req.body["documentType"], rkey, file.path]);
        res.redirect('/success.html');
    } catch (err) {
        console.error(err);
        res.redirect('/error.html');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/fileuploadpage', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/upload.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.get('/retrieve', (req, res) => {
    res.render('retrieve', { file: null, error: null });  
});

app.get("/status",(req,res)=>{
    res.sendFile(path.join(__dirname, '/views/status.html'));
})
app.get("/uploads", (req, res) => {
    pool.query("SELECT * FROM uploads", (err, result) => {
      if (err) {
        console.error("Database query error:", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.json(result.rows);
      }
    });
  });


// Handle file retrieval
app.post('/retrieve', async (req, res) => {
    const { rkey } = req.body;

    try {
        const queryText = 'SELECT file_path, document_type FROM uploads WHERE retrieve_key = $1';
        const result = await pool.query(queryText, [rkey]);

        if (result.rows.length > 0) {
            const filePath = result.rows[0].file_path;
            const fileType = result.rows[0].document_type.includes('image') ? 'image' : 'file';
            res.render('retrieve', { file: filePath, rkey, fileType });
        } else {
            res.render('retrieve', { error: 'No file found for the given name', file: null });
        }
    } catch (err) {
        console.error(err);
        res.redirect('/error.html');
    }
});
