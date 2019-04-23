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
  try {
    console.log('====>', payload)
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
    const { page } = payload
    const result = yield call(getQuoteList, page)
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
    const { data } = result
    if (result.status === 200) {
      yield put({
        type: 'quote/SET_STATE',
        payload: {
          editQuote: data.quote,
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
  try {
    const { body, uuid } = payload.payload
    const result = yield call(updateQuote, uuid, body)
    if (result.status === 200) {
      yield put({
        type: 'quote/SET_STATE',
        payload: {
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
