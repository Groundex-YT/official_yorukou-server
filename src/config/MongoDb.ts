import mongoose from 'mongoose';

const MongoDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            //@ts-ignore
            useNewUrlParser: true
        });

        console.log(`mongoose connected as: ${conn.connection.host}`);
    } catch (err) {
        console.log(err);
    }
};

export default MongoDb;
