/* eslint-disable */
import axios from 'axios'
import serverAddress from './config'

export async function createQuote(body) {
  const url = `${serverAddress}/api/quote/create/`
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

export async function getQuoteList(page) {
  const pageNumber = page || 1
  const url = serverAddress + '/api/quote?page=' + pageNumber
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

export async function getQuoteByUuid(request) {
  const body = request.payload
  const url = `${serverAddress}/api/quote/getquotebyid/`
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

export async function deleteQuoteByUuid(uuid) {
  const url = `${serverAddress}/api/quote/${uuid}/remove`
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

export async function updateQuote(uuid, body) {
  const url = `${serverAddress}/api/quote/${uuid}/update`
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
