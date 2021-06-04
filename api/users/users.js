const admin = require("firebase-admin");

const userValidation = {
    getUID: async(token) => {
        try {
            return (await admin.auth().verifyIdToken(token)).uid.valueOf()
        } catch (error) {
            return null;
        }
    }
} 

module.exports = userValidation