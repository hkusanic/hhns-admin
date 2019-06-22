/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable */
import React from 'react'
import { Table, DatePicker, Select, Switch, Button } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import renderHTML from 'react-render-html'
import { Link } from 'react-router-dom'

import './index.css'

const { Option } = Select

@connect(({ quote }) => ({ quote }))
class QuotesList extends React.Component {
  state = {
    language: true,
    currentPage: 1,
    perPage: 20,
    author: '',
  }

  componentDidMount() {
    const { dispatch, location } = this.props
    const { state } = location
    if (state !== undefined) {
      if (state.paginationCurrentPage) {
        this.setState(
          {
            currentPage: state.paginationCurrentPage,
          },
          () => {
            dispatch({
              type: 'quote/GET_QUOTES',
              page: this.state.currentPage,
            })
          },
        )
      } else {
        dispatch({
          type: 'quote/GET_QUOTES',
          page: this.state.currentPage,
        })
      }
    } else {
      dispatch({
        type: 'quote/GET_QUOTES',
        page: this.state.currentPage,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props
    if (nextProps.quote.isDeleted) {
      dispatch({
        type: 'quote/QUOTES',
        page: 1,
      })
    }
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
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

  // handlePageChnage = page => {
  //   const { dispatch } = this.props

  //   dispatch({
  //     type: 'quote/GET_QUOTES',
  //     page,
  //   })
  // }

  handlePageChnage = page => {
    const { dispatch } = this.props

    this.setState(
      {
        currentPage: page,
      },
      () => {
        dispatch({
          type: 'quote/GET_QUOTES',
          page: this.state.currentPage,
        })
      },
    )
  }

  deleteQuote = uuid => {
    const { dispatch } = this.props
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

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  hanldeRedirect = record => {
    const { history } = this.props
    const { language, currentPage } = this.state
    history.push({
      pathname: '/quote/create',
      state: { id: record.uuid, language, currentPage },
    })
  }

  handleSelectChange = value => {
    const { dispatch } = this.props
    this.setState(
      {
        author: value,
      },
      () => {
        dispatch({
          type: 'quote/GET_QUOTES',
          page: this.state.currentPage,
          author: this.state.author,
        })
      },
    )
  }

  handleResetButtonClick = () => {
    const { dispatch } = this.props
    this.setState(
      {
        author: '',
      },
      () => {
        dispatch({
          type: 'quote/GET_QUOTES',
          page: this.state.currentPage,
          author: this.state.author,
        })
      },
    )
  }

  render() {
    const { language, currentPage, perPage, author } = this.state
    const { quote } = this.props
    const { quotes, totalQuotes } = quote
    const data = quotes
    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'en.title' : 'ru.title',
        key: language ? 'en.title' : 'ru.title',
        render: title =>
          title ? renderHTML(this.showing100Characters(title)) : 'Translation missing',
      },
      {
        title: 'Topic',
        dataIndex: language ? 'en.topic' : 'ru.topic',
        key: language ? 'en.topic' : 'ru.topic',
        render: topic =>
          topic ? renderHTML(this.showing100Characters(topic)) : 'Translation missing',
      },
      {
        title: 'Author',
        dataIndex: 'author',
        key: 'author',
        render: author =>
          author ? renderHTML(this.showing100Characters(author)) : 'Translation missing',
      },
      {
        title: 'Date',
        dataIndex: 'quote_date',
        key: 'quote_date',
        render: date => <span>{`${new Date(date).toDateString()}`}</span>,
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link
              to={{ pathname: '/quote/create', state: { id: record.uuid, language, currentPage } }}
            >
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
            <i
              className="fa fa-trash mr-2 closeIcon"
              onClick={() => {
                this.deleteQuote(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]

    const paginationConfig = {
      current: currentPage,
      pageSize: perPage,
      total: totalQuotes,
      onChange: this.handlePageChnage,
    }

    return (
      <div>
        <Helmet title="Lecture List" />
        <div className="card">
          <div className="card-header mb-3">
            <div className="row utils__title">
              <div className="col-lg-8 mb-3">
                <strong>Quote List</strong>
                <Switch
                  defaultChecked
                  checkedChildren={language ? 'en' : 'ru'}
                  unCheckedChildren={language ? 'en' : 'ru'}
                  onChange={this.handleLanguage}
                  className="toggle"
                  style={{ width: '100px', marginLeft: '10px' }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3">
                <Select
                  style={{ width: '100%' }}
                  id="disciple"
                  placeholder="Author"
                  onChange={this.handleSelectChange}
                  // eslint-disable-next-line no-unneeded-ternary
                  value={author ? author : 'Select Author'}
                >
                  <Option value="Niranjana Swami">Niranjana Swami</Option>
                  <Option value="Srila Prabhupada">Srila Prabhupada</Option>
                </Select>
              </div>
              <div className="col-lg-3">
                <Button type="primary" onClick={this.handleResetButtonClick}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <Table
              // eslint-disable-next-line no-underscore-dangle
              rowKey={record => record._id}
              // eslint-disable-next-line no-unused-expressions
              rowClassName={record =>
                record.needs_translation === true ? 'NotTranslated' : 'translated'
              }
              onRow={record => {
                return {
                  onDoubleClick: () => {
                    this.hanldeRedirect(record)
                  },
                }
              }}
              className="utils__scrollTable customTable"
              scroll={{ x: '100%' }}
              columns={columns}
              dataSource={data}
              pagination={paginationConfig}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default QuotesList
