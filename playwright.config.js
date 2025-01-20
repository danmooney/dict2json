module.exports = {
  timeout: 5000, // Set the global timeout to 5000 milliseconds (5 seconds)
  use: {
    // Grant clipboard permissions for all tests
    permissions: ['clipboard-read', 'clipboard-write']
  },
};
