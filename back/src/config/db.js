const mongoose = require('mongoose');
const env = require('./env');
const dns = require('dns');

console.log('URI Check:', process.env.MONGO_URI);

const connectDB = async () => {
    try {
        const uri = env.mongoUri || process.env.MONGO_URI;

        if (!uri) {
            throw new Error('MONGO_URI is not defined in environment');
        }

        if (uri.startsWith('mongodb+srv://')) {
            // attempt to resolve SRV records to give a clearer diagnostic
            const match = uri.match(/@([^/]+)\//);
            const host = match ? match[1] : null;
            if (host) {
                const attemptResolve = () =>
                    new Promise((resolve, reject) => {
                        dns.resolveSrv(`_mongodb._tcp.${host}`, (err, addresses) => {
                            if (err) return reject(err);
                            resolve(addresses);
                        });
                    });

                try {
                    const addresses = await attemptResolve();
                    console.log('SRV records resolved:', addresses);
                } catch (err) {
                    console.log(`DNS SRV lookup failed for ${host}: ${err.message}`);
                    console.log('SRV lookup failure often indicates DNS or network issues (e.g., corporate VPN/firewall or blocked DNS).');
                    console.log('Retrying SRV lookup using public DNS servers (8.8.8.8, 1.1.1.1)...');
                    try {
                        dns.setServers(['8.8.8.8', '1.1.1.1']);
                        const addresses = await attemptResolve();
                        console.log('SRV records resolved with public DNS:', addresses);
                    } catch (err2) {
                        console.log(`SRV lookup retry failed: ${err2.message}`);
                        console.log('If this persists: switch networks, disable VPN/firewall, or use the standard (mongodb://) connection string from Atlas.');
                    }
                }
            }
        }

        const result = await mongoose.connect(uri, {
            family: 4, // keep IPv4 preference for Windows
            serverSelectionTimeoutMS: 10000,
        });

        console.log('MongoDB connected successfully...');
    } catch (err) {
        console.log(`MongoDB connection Error ${err.message}`);
        // don't exit process here to let nodemon show diagnostics and keep watcher active
    }
};

module.exports = connectDB;