/* eslint-disable */
const serverAddress = window.location.protocol + '//' + window.location.hostname

if (window.location.hostname === 'localhost') {
  serverAddress = serverAddress + ':' + 3000
}

export default serverAddress
