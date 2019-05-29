import types from './action'

const initialState = {
  loading: false,
  users: [],
}

export default function userProfileReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
