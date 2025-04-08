const amqp = require('amqplib');

let connection, channel;

const connect = async () => {
    connection = await amqp.connect(process.env.RABBIT_URL);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
}

const subscribeToQueue = async (queueName, callback) => {
    if (!channel) await connect();
    await channel.assertQueue(queueName);
    channel.consume(queueName, (message) => {
        callback(message.content.toString());
        channel.ack(message);
    });
}

const publishToQueue = async (queueName, data) => {
    if (!channel) await connect();
    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(data));
}

module.exports = {
    subscribeToQueue,
    publishToQueue,
    connect,
};