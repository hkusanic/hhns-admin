/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Table, Switch } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import renderHTML from 'react-render-html'

import './index.css'

@connect(({ kirtan }) => ({ kirtan }))
class KirtanList extends React.Component {
  state = {
    // language: window.localStorage['app.settings.locale'] === '"en-US"',
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
              type: 'kirtan/GET_KIRTAN',
              page: this.state.currentPage,
            })
          },
        )
      } else {
        dispatch({
          type: 'kirtan/GET_KIRTAN',
          page: this.state.currentPage,
        })
      }
    } else {
      dispatch({
        type: 'kirtan/GET_KIRTAN',
        page: this.state.currentPage,
      })
    }

    dispatch({
      type: 'video/RESET_STORE',
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.kirtan.isDeleted) {
      const { dispatch } = this.props
      dispatch({
        type: 'kirtan/GET_KIRTAN',
        page: 1,
      })
    }
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
  }

  handlePageChnage = page => {
    const { dispatch } = this.props

    this.setState(
      {
        currentPage: page,
      },
      () => {
        dispatch({
          type: 'kirtan/GET_KIRTAN',
          page: this.state.currentPage,
        })
      },
    )
  }

  deleteKirtan = uuid => {
    const { dispatch } = this.props
    dispatch({
      type: 'kirtan/DELETE_KIRTAN_BY_ID',
      uuid,
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
      pathname: '/kirtan/create',
      state: { id: record.uuid, language, currentPage },
    })
  }

  render() {
    const { kirtan } = this.props
    const { language, currentPage, perPage } = this.state
    const { kirtans, totalKirtans } = kirtan
    const data = kirtans

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
        dataIndex: 'kirtan_creation_date',
        key: 'kirtan_creation_date',
        render: date => <span>{`${new Date(date).toDateString()}`}</span>,
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link
              to={{ pathname: '/kirtan/create', state: { id: record.uuid, language, currentPage } }}
            >
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
            <i
              className="fa fa-trash mr-2 closeIcon"
              onClick={() => {
                this.deleteKirtan(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]

    const paginationConfig = {
      current: currentPage,
      pageSize: perPage,
      total: totalKirtans,
      onChange: this.handlePageChnage,
    }

    return (
      <div>
        <Helmet title="Kirtan List" />
        <div className="card">
          <div className="card-header mb-3">
            <div className="utils__title">
              <strong>Kirtan List</strong>
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

export default KirtanList
