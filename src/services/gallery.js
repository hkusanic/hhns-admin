import axios from 'axios'
import serverAddress from './config'

export async function getStaticGallery() {
  const url = `${serverAddress}/api/gallery/getStaticGallery`
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

export async function createGallery(body) {
  const url = `${serverAddress}/api/gallery/create/`
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

export async function removeGallery(uuid) {
  const url = `${serverAddress}/api/gallery/${uuid}/remove`
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

export async function getSubGalleryByGallery(body) {
  const url = `${serverAddress}/api/gallery/getGalleryByGallery/`
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

export async function getGalleryByUuid(request) {
  const body = request.payload
  const url = `${serverAddress}/api/gallery/getgallerybyid/`
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

export async function updateGallery(uuid, body) {
  console.log('value in api ====>>>', body, uuid)
  const url = `${serverAddress}/api/gallery/${uuid}/update`
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
