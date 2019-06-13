/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Table, Switch } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import renderHTML from 'react-render-html'
import { Link } from 'react-router-dom'

import './index.css'

@connect(({ video }) => ({ video }))
class VideoList extends React.Component {
  state = {
    language: true,
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
              type: 'video/GET_VIDEOS',
              page: this.state.currentPage,
            })
          },
        )
      } else {
        dispatch({
          type: 'video/GET_VIDEOS',
          page: this.state.currentPage,
        })
      }
    } else {
      dispatch({
        type: 'video/GET_VIDEOS',
        page: this.state.currentPage,
      })
    }

    dispatch({
      type: 'kirtan/RESET_STORE',
    })
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props
    if (nextProps.video.isDeleted) {
      dispatch({
        type: 'video/GET_VIDEOS',
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

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  handlePageChnage = page => {
    const { dispatch } = this.props

    this.setState(
      {
        currentPage: page,
      },
      () => {
        dispatch({
          type: 'video/GET_VIDEOS',
          page: this.state.currentPage,
        })
      },
    )
  }

  deleteVideo = uuid => {
    const { dispatch } = this.props
    dispatch({
      type: 'video/DELETE_VIDEOS',
      uuid,
    })
  }

  onChangeDate = date => {
    const { dispatch } = this.props
    dispatch({
      type: 'video/GET_VIDEOS',
      page: 1,
      date: date ? date.format('YYYY-MM-DD') : null,
    })
  }

  onChangeDateSort = order => {
    const { dispatch } = this.props
    dispatch({
      type: 'video/GET_VIDEOS',
      page: 1,
      createdDateSort: order,
    })
  }

  hanldeRedirect = record => {
    const { history } = this.props
    const { language, currentPage } = this.state
    history.push({
      pathname: '/video/create',
      state: { uuid: record.uuid, language, currentPage },
    })
  }

  render() {
    const { video } = this.props
    const { videos, totalVideos } = video
    const { language, currentPage, perPage } = this.state
    const data = videos
    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'en.title' : 'ru.title',
        key: language ? 'en.title' : 'ru.title',
        render: title => (title ? renderHTML(title.substring(0, 30)) : ''),
      },
      {
        title: 'Event',
        dataIndex: language ? 'en.event' : 'ru.event',
        key: language ? 'en.event' : 'ru.event',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: date => <span>{`${new Date(date).toDateString()}`}</span>,
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link
              to={{
                pathname: '/video/create',
                state: { uuid: record.uuid, language, currentPage },
              }}
            >
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
            <i
              className="fa fa-trash mr-2 closeIcon"
              onClick={() => {
                this.deleteVideo(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]

    const paginationConfig = {
      current: currentPage,
      pageSize: perPage,
      total: totalVideos,
      onChange: this.handlePageChnage,
    }

    return (
      <div>
        <Helmet title="Video List" />
        <div className="card">
          <div className="card-header">
            <div className="utils__title" style={{ paddingBottom: '10px' }}>
              <strong>Video List</strong>
              <Switch
                defaultChecked
                checkedChildren={language ? 'en' : 'ru'}
                unCheckedChildren={language ? 'en' : 'ru'}
                onChange={this.handleLanguage}
                className="toggle"
                style={{ width: '100px', marginLeft: '10px' }}
              />
            </div>
            {/* <DatePicker onChange={this.onChangeDate} />
            <Select
              id="product-edit-colors"
              showSearch
              style={{ width: '20%' }}
              onChange={this.onChangeDateSort}
              placeholder="Select Order"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="asc">Ascending</Option>
              <Option value="desc">Descending</Option>
            </Select> */}
          </div>
          <div className="card-body">
            <Table
              // eslint-disable-next-line no-underscore-dangle
              rowKey={record => record._id}
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

export default VideoList
