import express, { Application, Request, Response, json } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { v1Routes } from './routes/v1/index';

const logger = (req: Request, res: Response, next: Function) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

const app: Application = express();

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', logger, v1Routes);

// create a 404 route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Not Found'
  });
});

app.listen(8000, () => {
  console.log('Example app listening on port 8000!');
});