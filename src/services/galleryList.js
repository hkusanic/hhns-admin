import axios from 'axios'
import serverAddress from './config'

export async function getMainGallery() {
  const url = `${serverAddress}/api/gallerylist/`
  return axios
    .get(url)
    .then(response => {
      console.log('response =====>>>>>>>', response)
      if (response && response.data) {
        return response
      }
      return false
    })
    .catch(error => {
      return error
    })
}

export async function createMainGallery(body) {
  const url = `${serverAddress}/api/gallerylist/create/`
  return axios
    .post(url, body)
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

export async function removeMainGallery(uuid) {
  const url = `${serverAddress}/api/gallerylist/${uuid}/remove`
  return axios
    .post(url)
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
