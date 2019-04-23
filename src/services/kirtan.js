import axios from 'axios'
import serverAddress from './config'

export async function getKirtanList(page) {
  const pageNumber = page || 1
  const url = `${serverAddress}/api/kirtan?page=${pageNumber}`
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

export async function createKirtan(body) {
  const url = `${serverAddress}/api/kirtan/create`
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

export async function deleteKirtanByUuid(uuid) {
  const url = `${serverAddress}/api/kirtan/${uuid}/remove`
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

export async function updateKirtan(uuid, body) {
  console.log('value in api ====>>>', body, uuid)
  const url = `${serverAddress}/api/kirtan/${uuid}/update`
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
  const url = `${serverAddress}/api/kirtan/getkirtanbyid/`
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
