import { MongoClient, Db, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error(
    'Missing MongoDB URI. Please set MONGODB_URI in your .env.local file (e.g., MONGODB_URI=mongodb://localhost:27017).'
  );
}
if (!process.env.MONGODB_DB) {
  throw new Error(
    'Missing MongoDB database name. Please set MONGODB_DB in your .env.local file (e.g., MONGODB_DB=startdown).'
  );
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

const options: MongoClientOptions = {
  maxPoolSize: 10,
  wtimeoutMS: 2500,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient>;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client
      .connect()
      .then((connectedClient) => {
        console.log('MongoDB connected successfully (development)');
        return connectedClient;
      })
      .catch((err) => {
        console.error('MongoDB connection error (development):', err);
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client
    .connect()
    .then((connectedClient) => {
      console.log('MongoDB connected successfully (production)');
      return connectedClient;
    })
    .catch((err) => {
      console.error('MongoDB connection error (production):', err);
      throw err;
    });
}

export async function getDb(): Promise<Db> {
  if (!dbName) {
    console.error('MongoDB database name is not configured.');
    throw new Error('MongoDB database name is not configured.');
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

let isShuttingDown = false;
async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('Attempting graceful shutdown...');
  try {
    const clientToClose = await clientPromise;
    await clientToClose.close();
    console.log('MongoDB connection closed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB connection close:', err);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default clientPromise;
