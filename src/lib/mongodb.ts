import mongoose from 'mongoose'

const clientOptions = {
  serverApi: { version: '1' as const, strict: true, deprecationErrors: true },
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  retryWrites: true
}

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URL as string, clientOptions)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection failed:', err)
    setTimeout(connectMongo, 5000)
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected — retrying...')
  setTimeout(connectMongo, 5000)
})

connectMongo()

export default mongoose
