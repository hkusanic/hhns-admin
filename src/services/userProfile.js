import axios from 'axios'
import serverAddress from './config'
/* eslint-disable */

export async function getUsersList() {
  const url = serverAddress + '/api/user'
  return axios
    .get(url)
    .then(response => {
      if (response && response.data) {
        return response
      }
      return false
    })
    .catch(error => {
      return error
    })
}
