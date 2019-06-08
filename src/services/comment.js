import axios from 'axios'
import serverAddress from './config'
/* eslint-disable */

export async function getCommentsList(approved) {
  // const url = serverAddress + '/api/comment/getlimitedlist'
  const url = `${serverAddress}/api/comment/getlimitedlist?approved=${approved ? approved : ''}`
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
