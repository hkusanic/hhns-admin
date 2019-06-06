import axios from 'axios'
import serverAddress from './config'
/* eslint-disable */

export async function getSadhanaList(page, date, createdDateSort, email, userId) {
  const pageNumber = page || 1
  const dateNow = date || null
  const createdDateSorting = createdDateSort || null
  const url =
    serverAddress +
    '/api/sadhana?page=' +
    pageNumber +
    (dateNow ? '&date=' + date : '') +
    (createdDateSorting ? '&createdDateSort=' + createdDateSorting : '') +
    (email ? '&email=' + email : '') +
    (userId ? '&userId=' + userId : '')
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

export async function getSadhanaByUuid(request) {
  const body = request.payload
  const url = `${serverAddress}/api/sadhana/getSadhanaById`
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
