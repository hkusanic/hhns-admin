/* eslint-disable */
import { notification } from 'antd'
import { all, takeEvery, put, call } from 'redux-saga/effects'
import {
  createBlogApi,
  getBlogList,
  getBlogByUuid,
  deleteBlogByUuid,
  updateBlog,
} from 'services/blog'
import actions from './action'

export function* createBlogSaga({ payload }) {
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

  // console.log('blog payload', payload)

  try {
    const result = yield call(createBlogApi, payload)
    // console.log('from blog saga', result)
    if (result.status === 200) {
      notification.success({
        message: 'Success',
        description: 'Blog is created successfully',
      })
      yield put({
        type: 'blog/SET_STATE',
        payload: {
          isBlogCreated: true,
          isDeleted: false,
          isUpdated: false,
          blogs: [],
          blogAudit: result.data.Blog.audit,
        },
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured',
    })
    yield put({
      type: 'blog/SET_STATE',
      payload: {
        isBlogCreated: false,
        blogs: [],
      },
    })
  }
}

export function* getBlogListSaga(payload) {
  try {
    const { page } = payload
    const result = yield call(getBlogList, page)
    const { data } = result
    const { blog } = data
    if (result.status === 200) {
      yield put({
        type: 'blog/SET_STATE',
        payload: {
          blogs: blog.results,
          totalBlogs: blog.total,
          isBlogCreated: false,
          isDeleted: false,
          isUpdated: false,
          editBlog: '',
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

export function* getBlogByUuidSaga(body) {
  try {
    const result = yield call(getBlogByUuid, body)
    const { data } = result
    console.log('blog uuid', data)
    if (result.status === 200) {
      yield put({
        type: 'blog/SET_STATE',
        payload: {
          editBlog: data.blog,
          isBlogCreated: false,
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

export function* deleteBlogByUuidSaga(payload) {
  try {
    const { uuid } = payload
    const result = yield call(deleteBlogByUuid, uuid)
    if (result.status === 200) {
      yield put({
        type: 'blog/SET_STATE',
        payload: {
          isDeleted: true,
          isBlogCreated: false,
          isUpdated: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Blog is Deleted successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Deleting Blog',
    })
  }
}

export function* updateBlogSaga(payload) {
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
    const result = yield call(updateBlog, uuid, body)
    if (result.status === 200) {
      yield put({
        type: 'blog/SET_STATE',
        payload: {
          editBlog: result.data.Blog,
          isUpdated: true,
          isBlogCreated: false,
          isDeleted: false,
        },
      })
      notification.success({
        message: 'Success',
        description: 'Blog is updated successfully',
      })
    }
  } catch (err) {
    notification.warning({
      message: 'Error',
      description: 'Some Error Occured While Updating Blog',
    })
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.CREATE_BLOG, createBlogSaga),
    takeEvery(actions.GET_LIST, getBlogListSaga),
    takeEvery(actions.GET_BLOG_BY_ID, getBlogByUuidSaga),
    takeEvery(actions.DELETE_BLOG_BY_ID, deleteBlogByUuidSaga),
    takeEvery(actions.UPDATE_BLOG, updateBlogSaga),
  ])
}
