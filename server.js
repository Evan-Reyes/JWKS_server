// Dependencies
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');

// Constants
const PORT = 8080;
const EXPIRY_DURATION = 3600; // 1 hour in seconds

// Initialize Express
const app = express();

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
  },
});

// Associate Key ID (kid) and expiry timestamp
const kid = 'my_rsa_key';
const expiry = Math.floor(Date.now() / 1000) + EXPIRY_DURATION;

// Web server with handlers
app.get('/jwks', (req, res) => {
  // Serve keys that have not expired
  if (expiry > Math.floor(Date.now() / 1000)) {
    const jwks = {
      keys: [
        {
          kty: 'RSA',
          kid,
          use: 'sig',
          alg: 'RS256',
          n: publicKey.split('\n').slice(1, -2).join(''),
          e: 'AQAB',

        },
      ],
    };
    res.json(jwks);
  } else {
    res.status(404).send('Keys not found or expired');
  }
});

app.post('/auth', (req, res) => {
  // Generate JWT
  const token = jwt.sign({ sub: 'user123' }, privateKey, {
    algorithm: 'RS256',
    expiresIn: EXPIRY_DURATION,
  });
  res.json({ token });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export server for testing
module.exports = server;