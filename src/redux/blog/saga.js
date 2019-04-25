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
  try {
    const result = yield call(createBlogApi, payload)
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
  try {
    const { body, uuid } = payload.payload

    console.log(payload)

    const result = yield call(updateBlog, uuid, body)
    if (result.status === 200) {
      yield put({
        type: 'blog/SET_STATE',
        payload: {
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
