const gcloud = require('./secretManager')

module.exports.getConfig = async function getConfig(secret) {
    return await gcloud.getSecret(secret)
};
  
