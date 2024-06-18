import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import MongoDb from './config/MongoDb';
import router from './router';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(cookieParser());

MongoDb();
app.use('/api/v1', router);

const PORT = process.env.PORT || 5000;

app.use((req, res) => {
    res.status(404).json({
        status: 404,
        error: 'Not Found'
    });
});

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
