const mongoose = require('mongoose');

module.exports = async () => {
    await mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Captain service connected to database!');
    }).catch((error) => {
        console.log(error);
    });
}