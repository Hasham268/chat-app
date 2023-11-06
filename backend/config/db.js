const mongoose = require('mongoose');

const connectToDB = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`Mongodb connected : ${con.connection.host}`);
    } catch (e) {
        console.log(e);
        process.exit()
    }
}

module.exports = connectToDB;