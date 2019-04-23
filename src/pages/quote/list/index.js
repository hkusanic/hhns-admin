/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable */
import React from 'react'
import { Table, DatePicker, Select } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import renderHTML from 'react-render-html'
import { Link } from 'react-router-dom'

const { Option } = Select

@connect(({ quote }) => ({ quote }))
class QuotesList extends React.Component {
  state = {}

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'quote/GET_QUOTES',
      page: 1,
    })
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props
    if (nextProps.quote.isDeleted) {
      dispatch({
        type: 'quote/QUOTES',
        page: 1,
      })
    }
  }

  showing100Characters = sentence => {
    let result = sentence
    let resultArray = result.split(' ')
    if (resultArray.length > 10) {
      resultArray = resultArray.slice(0, 10)
      result = `${resultArray.join(' ')}...`
    }
    return result
  }

  handlePageChnage = page => {
    const { dispatch } = this.props

    dispatch({
      type: 'quote/GET_QUOTES',
      page,
    })
  }

  deleteQuote = uuid => {
    const { dispatch } = this.props
    console.log('uuid====????', uuid)
    dispatch({
      type: 'quote/DELETE_QUOTE_BY_ID',
      uuid,
    })
    dispatch({
      type: 'quote/GET_QUOTES',
      page: 1,
    })
  }

  onChangeDate = date => {
    const { dispatch } = this.props
    dispatch({
      type: 'quote/GET_QUOTES',
      page: 1,
      date: date ? date.format('YYYY-MM-DD') : null,
    })
  }

  onChangeDateSort = order => {
    const { dispatch } = this.props
    dispatch({
      type: 'quote/GET_QUOTES',
      page: 1,
      createdDateSort: order,
    })
  }

  render() {
    const { quote } = this.props
    const { quotes, totalQuotes } = quote
    const data = quotes
    const columns = [
      {
        title: 'Title',
        dataIndex:
          window.localStorage['app.settings.locale'] === '"ru-RU"' ? 'ru.title' : 'en.title',
        key: window.localStorage['app.settings.locale'] === '"ru-RU"' ? 'ru.title' : 'en.title',
        render: title =>
          title ? renderHTML(this.showing100Characters(title)) : 'Translation missing',
      },
      {
        title: 'Topic',
        dataIndex:
          window.localStorage['app.settings.locale'] === '"ru-RU"' ? 'ru.topic' : 'en.topic',
        key: window.localStorage['app.settings.locale'] === '"ru-RU"' ? 'ru.topic' : 'en.topic',
        render: topic =>
          topic ? renderHTML(this.showing100Characters(topic)) : 'Translation missing',
      },
      {
        title: 'Author',
        dataIndex:
          window.localStorage['app.settings.locale'] === '"ru-RU"' ? 'ru.author' : 'en.author',
        key: window.localStorage['app.settings.locale'] === '"ru-RU"' ? 'ru.author' : 'en.author',
        render: author =>
          author ? renderHTML(this.showing100Characters(author)) : 'Translation missing',
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link to={{ pathname: '/quote/create', state: record.uuid }}>
              <i className="fa fa-edit mr-2" />
            </Link>
            <i
              className="fa fa-trash mr-2"
              onClick={() => {
                this.deleteQuote(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]

    return (
      <div>
        <Helmet title="Lecture List" />
        <div className="card">
          <div className="card-header">
            <div className="utils__title">
              <strong>Quote List</strong>
            </div>
          </div>
          <div className="card-body">
            <Table
              // eslint-disable-next-line no-unused-expressions
              rowClassName={record =>
                record.translation_required === true ? 'NotTranslated' : 'translated'
              }
              className="utils__scrollTable"
              scroll={{ x: '100%' }}
              columns={columns}
              dataSource={data}
              pagination={{
                pageSize: 20,
                onChange: this.handlePageChnage,
                total: totalQuotes,
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default QuotesList
