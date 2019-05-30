import types from './action'

const initialState = {
  loading: false,
  comments: [],
  commentDetails: {},
}

export default function commentReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
