import types from './action'

const initialState = {
  loading: false,
  quotes: [],
  totalQuotes: '',
  topics: [],
  isQuoteCreated: false,
  isDeleted: false,
  isUpdated: false,
  editQuote: '',
  error: '',
}

export default function quoteReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
