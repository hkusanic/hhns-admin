/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Table, DatePicker, Select, Switch, Checkbox } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import renderHTML from 'react-render-html'
import { Link } from 'react-router-dom'

import './index.css'

const { Option } = Select

@connect(({ lecture }) => ({ lecture }))
class ProductsList extends React.Component {
  state = {
    language: true,
    transcribe: false,
    currentPage: 1,
    perPage: 20,
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
              type: 'lecture/GET_LECTURES',
              page: this.state.currentPage,
            })
          },
        )
      } else {
        dispatch({
          type: 'lecture/GET_LECTURES',
          page: this.state.currentPage,
        })
      }
    } else {
      dispatch({
        type: 'lecture/GET_LECTURES',
        page: this.state.currentPage,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props
    if (nextProps.lecture.isDeleted) {
      dispatch({
        type: 'lecture/GET_LECTURES',
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

  handlePageChnage = page => {
    const { dispatch } = this.props

    this.setState(
      {
        currentPage: page,
      },
      () => {
        dispatch({
          type: 'lecture/GET_LECTURES',
          page: this.state.currentPage,
        })
      },
    )
  }

  deleteLecture = uuid => {
    const { dispatch } = this.props
    dispatch({
      type: 'lecture/DELETE_LECTURE',
      uuid,
    })
  }

  onChangeDate = date => {
    const { dispatch } = this.props
    dispatch({
      type: 'lecture/GET_LECTURES',
      page: 1,
      date: date ? date.format('YYYY-MM-DD') : null,
    })
  }

  onChangeDateSort = order => {
    const { dispatch } = this.props
    dispatch({
      type: 'lecture/GET_LECTURES',
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
    const { language, currentPage } = this.state
    const { history } = this.props

    history.push({
      pathname: '/lecture/create',
      state: {
        id: record.uuid,
        language,
        currentPage,
      },
    })
  }

  handleTranscribe = event => {
    setTimeout(() => {
      this.setState({
        transcribe: event.target.checked,
      })
    }, 0)

    const { dispatch } = this.props
    dispatch({
      type: 'lecture/GET_LECTURES',
      page: 1,
      transcribe_required: event.target.checked,
    })
  }

  render() {
    const { language, transcribe, currentPage, perPage } = this.state
    const { lecture } = this.props
    const { lectures, totalLectures } = lecture
    const data = lectures
    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'en.title' : 'ru.title',
        key: language ? 'en.title' : 'ru.title',
        render: title => (title ? renderHTML(title.substring(0, 40)) : ''),
      },
      // {
      //   title: 'Event',
      //   dataIndex: language ? 'en.event' : 'ru.event',
      //   key: language ? 'en.event' : 'ru.event',
      // },
      // {
      //   title: 'Author',
      //   dataIndex: 'author',
      //   key: 'author',
      // },
      {
        title: 'Date',
        dataIndex: 'created_date_time',
        key: 'created_date_time',
        render: date => <span>{`${new Date(date).toDateString()}`}</span>,
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link
              to={{
                pathname: '/lecture/create',
                state: { id: record.uuid, language, currentPage },
              }}
            >
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
            <i
              className="fa fa-trash mr-2 closeIcon"
              onClick={() => {
                this.deleteLecture(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]

    const paginationConfig = {
      current: currentPage,
      pageSize: perPage,
      total: totalLectures,
      onChange: this.handlePageChnage,
    }

    return (
      <div>
        <Helmet title="Lecture List" />
        <div className="card">
          <div className="card-header mb-3">
            <div className="utils__title">
              <strong>Lecture List</strong>
              <Switch
                defaultChecked
                checkedChildren={language ? 'en' : 'ru'}
                unCheckedChildren={language ? 'en' : 'ru'}
                onChange={this.handleLanguage}
                className="toggle"
                // style={{ width: '100px', float: 'right', margin: '0px 10px 10px 0px' }}
                style={{ width: '100px', marginLeft: '10px' }}
              />
            </div>
            <DatePicker
              style={{ paddingTop: '10px' }}
              className="mr-3"
              onChange={this.onChangeDate}
            />
            <Select
              id="product-edit-colors"
              showSearch
              style={{ width: '20%', paddingTop: '10px' }}
              onChange={this.onChangeDateSort}
              placeholder="Select Order"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="asc">Ascending</Option>
              <Option value="desc">Descending</Option>
            </Select>
            &nbsp;&nbsp;&nbsp;
            <Checkbox checked={transcribe} onChange={this.handleTranscribe}>
              &nbsp; Transcribe ?
            </Checkbox>
          </div>
          <div className="card-body">
            <Table
              rowKey={record => record.uuid}
              // eslint-disable-next-line no-unused-expressions
              rowClassName={record =>
                record.translation_required === true ? 'NotTranslated' : 'translated'
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

export default ProductsList
