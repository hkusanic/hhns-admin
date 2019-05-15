/* eslint-disable */
import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import {
  getLectureList,
  createLecture,
  deleteLectureByUuid,
  updateLecture,
  getLectureByUuid,
} from 'services/lecture'
import { getTopicList, getEventList, getLocationList, getTranslationList } from 'services/common'
import actions from './action'

export function* getLectureListSaga(payload) {
  try {
    const { page } = payload
    const { date } = payload
    const { createdDateSort } = payload
    let { transcribe_required } = payload
    transcribe_required = transcribe_required === true ? true : false
    const result = yield call(getLectureList, page, date, createdDateSort, transcribe_required)
    const { data } = result
    const { lecture } = data

    if (result.status === 200) {
      yield put({
        type: 'lecture/SET_STATE',
        payload: {
          lectures: lecture.results,
          totalLectures: lecture.total,
          editLecture: '',
          isLectureCreated: false,
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

export function* createLectureSaga(payload) {
  const { body } = payload

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
  body.audit = audit

  try {
    const result = yield call(createLecture, body)
    // console.log('lecture result',result)
    if (result.status === 200) {
      notification.success({
        message: 'Success',
        description: 'Lecture is created successfully',
      })
      yield put({
        type: 'lecture/SET_STATE',
        payload: {
          isLectureCreated: true,
          editLecture: '',
          isDeleted: false,
          isUpdated: false,
          lectures: [],
          lectureAudit: result.data.Lecture.audit,
        },
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Error Occured while Creating Lecture',
    })
  }
}

export function* deleteBlogByUuidSaga(payload) {
  try {
    const { uuid } = payload
    const result = yield call(deleteLectureByUuid, uuid)
    if (result.status === 200) {
      yield put({
        type: 'lecture/SET_STATE',
        payload: {
          editLecture: '',
          isDeleted: true,
          isLectureCreated: false,
          isUpdated: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'lecture is Deleted successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Deleting lecture',
    })
  }
}

export function* updateLectureSaga(payload) {
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
  let auditData = JSON.parse('[' + body.audit + ']')
  let auditArray = []
  auditData.forEach(e => {
    auditArray.push(JSON.stringify(e))
  })
  auditArray.push(JSON.stringify(obj))
  body.audit = auditArray

  try {
    // const { body, uuid } = payload.payload
    // console.log('payload ====>>>>', body, uuid)
    const result = yield call(updateLecture, uuid, body)
    console.log('******* result from lecture', result)
    if (result.status === 200) {
      yield put({
        type: 'lecture/SET_STATE',
        payload: {
          editLecture: result.data.Lecture,
          isUpdated: true,
          isLectureCreated: false,
          isDeleted: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'lecture is updated successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Updating lecture',
    })
  }
}
export function* getTopics() {
  try {
    const result = yield call(getTopicList)
    const { data } = result
    if (result.status === 200) {
      yield put({
        type: 'lecture/SET_STATE',
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

export function* getEvents() {
  try {
    const result = yield call(getEventList)
    const { data } = result
    if (result.status === 200) {
      yield put({
        type: 'lecture/SET_STATE',
        payload: {
          editLecture: '',
          events: data.event,
        },
      })
    }
  } catch (err) {
    notification.error({
      message: 'Error',
      description: 'Error Occured while getting Events',
    })
  }
}

export function* getLocations() {
  try {
    const result = yield call(getLocationList)
    const { data } = result
    if (result.status === 200) {
      yield put({
        type: 'lecture/SET_STATE',
        payload: {
          editLecture: '',
          locations: data.location,
        },
      })
    }
  } catch (err) {
    notification.error({
      message: 'Error',
      description: 'Error Occured while getting Locations',
    })
  }
}

export function* getLectureByUuidSaga(body) {
  try {
    const result = yield call(getLectureByUuid, body)
    console.log('result =====>>>>', result)
    const { data } = result
    if (result.status === 200) {
      yield put({
        type: 'lecture/SET_STATE',
        payload: {
          editLecture: data.lecture,
          isLectureCreated: false,
          isDeleted: false,
          isUpdated: false,
        },
      })
    }
  } catch (err) {
    notification.error({
      message: 'Error',
      description: 'Error Occured while getting Lecture',
    })
  }
}

export function* getTranslations() {
  try {
    const result = yield call(getTranslationList)
    const { data } = result

    if (result.status === 200) {
      yield put({
        type: 'lecture/SET_STATE',
        payload: {
          editLecture: '',
          translations: data.translation,
        },
      })
    }
  } catch (err) {
    notification.error({
      message: 'Error',
      description: 'Error Occured while getting Locations',
    })
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.GET_LECTURES, getLectureListSaga),
    takeEvery(actions.GET_TOPICS, getTopics),
    takeEvery(actions.GET_EVENTS, getEvents),
    takeEvery(actions.GET_LOCATIONS, getLocations),
    takeEvery(actions.GET_TRANSLATIONS, getTranslations),
    takeEvery(actions.CREATE_LECTURE, createLectureSaga),
    takeEvery(actions.DELETE_LECTURE, deleteBlogByUuidSaga),
    takeEvery(actions.UPDATE_LECTURE, updateLectureSaga),
    takeEvery(actions.GET_LECTURE_BY_ID, getLectureByUuidSaga),
  ])
}
