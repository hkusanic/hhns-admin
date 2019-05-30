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

export async function getUserByUuid(request) {
  const body = request.payload
  const url = `${serverAddress}/api/user/getUserByUserId`
  return axios
    .post(url, body)
    .then(response => {
      if (response.status === 200) {
        return response
      }
      return false
    })
    .catch(error => {
      return error
    })
}
