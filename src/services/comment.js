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
