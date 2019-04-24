import axios from 'axios'
import serverAddress from './config'

export async function createVideo(body) {
  const url = `${serverAddress}/api/video/create`
  console.log(body)
  // return axios
  //   .post(url, body)
  //   .then(response => {
  //     if (response && response.data) {
  //       return response
  //     }
  //     return false
  //   })
  //   .catch(error => {
  //     return error
  //   })
}

export async function getSuggestions(body) {
  const type = body.payload.type
  let url
  const parameter = body.payload.parameter
  if (type === 'lecture') {
    url = `${serverAddress}/api/lecture/?title=${parameter}`
  } else if (type === 'kirtan') {
    url = `${serverAddress}/api/kirtan/?title=${parameter}`
  }

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
