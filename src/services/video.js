import axios from 'axios'
import serverAddress from './config'

export async function createVideo(body) {
  const url = `${serverAddress}/api/video/create`
  console.log(body)
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

export async function getSuggestions(body) {
  const { payload } = body
  const { type, parameter } = payload
  let url
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

export async function getVideoList(page, date, createdDateSort) {
  const pageNumber = page || 1
  const dateNow = date || null
  const createdDateSorting = createdDateSort || null
  const url = `${serverAddress}/api/video?page=${pageNumber}${dateNow ? `&date=${date}` : ''}${
    createdDateSorting ? `&createdDateSort=${createdDateSorting}` : ''
  }`
  console.log(url)
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
export async function deleteVideoByUuid(uuid) {
  const url = `${serverAddress}/api/video/${uuid}/remove`
  return axios
    .post(url)
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
export async function getVideoByUuid(request) {
  const body = request.payload
  const url = `${serverAddress}/api/video/getvideobyid/`
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
export async function updateVideo(uuid, body) {
  console.log('value in api ====>>>', body, uuid)
  const url = `${serverAddress}/api/video/${uuid}/update`
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
