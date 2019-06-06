import axios from 'axios'
import serverAddress from './config'
/* eslint-disable */

export async function getCommentsList() {
  const url = serverAddress + '/api/comment/getlimitedlist'
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

export async function updateComment(uuid, body) {
  const url = `${serverAddress}/api/comment/update/${uuid}`
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
