import axios from 'axios'
import serverAddress from './config'

export async function getLectureList(page) {
  const pageNumber = page || 1
  const url = `${serverAddress}/api/lecture/?page=${pageNumber}`
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

export async function createLecture(body) {
  const url = `${serverAddress}/api/lecture/create/`
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

export async function deleteLectureByUuid(uuid) {
  const url = `${serverAddress}/api/lecture/${uuid}/remove`
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

export async function updateLecture(uuid, body) {
  console.log('value in api ====>>>', body, uuid)
  const url = `${serverAddress}/api/lecture/${uuid}/update`
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

export async function getLectureByUuid(request) {
  const body = request.payload
  const url = `${serverAddress}/api/lecture/getlecturebyid/`
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
