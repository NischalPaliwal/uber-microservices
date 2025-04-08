const mongoose = require('mongoose');

const connectToDB = async () => {
    await mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Ride service connected to database!');
    }).catch((error) => {
        console.log(error);
    });
}

module.exports = connectToDB;