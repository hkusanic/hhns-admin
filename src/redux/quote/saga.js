/* eslint-disable */
import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import { getQuoteTopicList } from 'services/common'
import actions from './action'
import {
  createQuote,
  getQuoteList,
  getQuoteByUuid,
  deleteQuoteByUuid,
  updateQuote,
} from 'services/quote'

export function* getTopics() {
  try {
    const result = yield call(getQuoteTopicList)
    const { data } = result
    if (result.status === 200) {
      yield put({
        type: 'quote/SET_STATE',
        payload: {
          editLecture: '',
          topics: data.topic,
        },
      })
    }
  } catch (err) {
    notification.error({
      message: 'Error',
      description: 'Error Occured while getting Topics',
    })
  }
}

export function* createQuoteSaga({ payload }) {
  const userDetails = JSON.parse(localStorage.getItem('user'))

  const today = new Date()
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
  const dateTime = `${date} ${time}`
  let obj = {}
  obj.fullName = `${userDetails.firstName} ${userDetails.last}`
  obj.email = userDetails.email
  obj.dateTime = dateTime
  let audit = []
  audit.push(JSON.stringify(obj))
  payload.audit = audit

  try {
    const result = yield call(createQuote, payload)
    if (result.status === 200) {
      notification.success({
        message: 'Success',
        description: 'Quote is created successfully',
      })
      yield put({
        type: 'quote/SET_STATE',
        payload: {
          isLectureCreated: true,
          editLecture: '',
          isDeleted: false,
          isUpdated: false,
          lectures: [],
          quoteAudit: result.data.quote.audit,
        },
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Error Occured while creating Quote',
    })
  }
}

export function* getQuoteListSaga(payload) {
  try {
    const { page, author } = payload
    const result = yield call(getQuoteList, page, author)
    const { data } = result
    const { quote } = data

    if (result.status === 200) {
      yield put({
        type: 'quote/SET_STATE',
        payload: {
          quotes: quote.results,
          totalQuotes: quote.total,
          editQuote: '',
          isQuoteCreated: false,
          isDeleted: false,
          isUpdated: false,
        },
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured',
    })
  }
}

export function* getQuoteByUuidSaga(body) {
  try {
    const result = yield call(getQuoteByUuid, body)
    // localStorage.setItem('auditData', result.data.quote.audit)
    const { data } = result
    if (result.status === 200) {
      yield put({
        type: 'quote/SET_STATE',
        payload: {
          editQuote: data.quote,
          isQuoteCreated: false,
          isDeleted: false,
          isUpdated: false,
          quoteAudit: result.data.quote.audit,
        },
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured',
    })
  }
}

export function* deleteQuoteByUuidSaga(payload) {
  try {
    const { uuid } = payload
    const result = yield call(deleteQuoteByUuid, uuid)
    if (result.status === 200) {
      yield put({
        type: 'quote/SET_STATE',
        payload: {
          isDeleted: true,
          isQuoteCreated: false,
          isUpdated: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Quote is Deleted successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Deleting Quote',
    })
  }
}

export function* updateQuoteSaga(payload) {
  const { body, uuid } = payload.payload

  const userDetails = JSON.parse(localStorage.getItem('user'))
  const today = new Date()
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
  const dateTime = `${date} ${time}`
  let obj = {}
  obj.fullName = `${userDetails.firstName} ${userDetails.last}`
  obj.email = userDetails.email
  obj.dateTime = dateTime
  // const ad = localStorage.getItem('auditData')
  let auditData = JSON.parse('[' + body.audit + ']')
  let auditArray = []
  auditData.forEach(e => {
    auditArray.push(JSON.stringify(e))
  })
  auditArray.push(JSON.stringify(obj))
  body.audit = auditArray

  try {
    // const { body, uuid } = payload.payload
    const result = yield call(updateQuote, uuid, body)
    // console.log('*******qoute', result)
    if (result.status === 200) {
      yield put({
        type: 'quote/SET_STATE',
        payload: {
          editQuote: result.data.Quote,
          isUpdated: true,
          isQuoteCreated: false,
          isDeleted: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Quote is updated successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Updating Quote',
    })
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.GET_TOPICS, getTopics),
    takeEvery(actions.CREATE_QUOTE, createQuoteSaga),
    takeEvery(actions.GET_QUOTES, getQuoteListSaga),
    takeEvery(actions.GET_QUOTE_BY_ID, getQuoteByUuidSaga),
    takeEvery(actions.DELETE_QUOTE_BY_ID, deleteQuoteByUuidSaga),
    takeEvery(actions.UPDATE_QUOTE, updateQuoteSaga),
  ])
}
