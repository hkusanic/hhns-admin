/* eslint-disable no-unused-vars */
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

@connect(({ blog }) => ({ blog }))
class BlogList extends React.Component {
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
              type: 'blog/GET_LIST',
              page: this.state.currentPage,
            })
          },
        )
      } else {
        dispatch({
          type: 'blog/GET_LIST',
          page: this.state.currentPage,
        })
      }
    } else {
      dispatch({
        type: 'blog/GET_LIST',
        page: this.state.currentPage,
      })
    }

    dispatch({
      type: 'kirtan/RESET_STORE',
    })

    dispatch({
      type: 'video/RESET_STORE',
    })
  }

  componentWillReceiveProps(nextProps) {
    const { blog, dispatch } = this.props
    const { isDeleted } = blog
    if ((!isDeleted && nextProps.blog.isDeleted) || (isDeleted && nextProps.blog.isDeleted)) {
      dispatch({
        type: 'blog/GET_LIST',
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
          type: 'blog/GET_LIST',
          page: this.state.currentPage,
        })
      },
    )
  }

  deleteBlog = uuid => {
    const { dispatch } = this.props
    dispatch({
      type: 'blog/DELETE_BLOG_BY_ID',
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
    const { language, currentPage } = this.state
    const { history } = this.props
    history.push({
      pathname: '/blog/add-blog-post',
      state: { id: record.uuid, language, currentPage },
    })
  }

  render() {
    const { language, currentPage, perPage } = this.state
    const { blog } = this.props
    const { blogs, totalBlogs } = blog
    const data = blogs

    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'en.title' : 'ru.title',
        key: language ? 'en.title' : 'ru.title',
        render: text => (text ? renderHTML(text.substring(0, 30)) : ''),
      },
      {
        title: 'Author',
        dataIndex: 'author',
        key: 'author',
        render: text => (text ? renderHTML(this.showing100Characters(text)) : ''),
      },
      {
        title: 'Date',
        dataIndex: 'blog_creation_date',
        key: 'blog_creation_date',
        render: date => <span>{`${new Date(date).toDateString()}`}</span>,
      },
      {
        title: 'Action',
        key: 'uuid',
        render: record => (
          <span>
            <Link
              to={{
                pathname: '/blog/add-blog-post',
                state: { id: record.uuid, language, currentPage },
              }}
            >
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
            <i
              className="fa fa-trash mr-2 closeIcon"
              onClick={() => {
                this.deleteBlog(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]

    const paginationConfig = {
      current: currentPage,
      pageSize: perPage,
      total: totalBlogs,
      onChange: this.handlePageChnage,
    }

    return (
      <div>
        <Helmet title="Products List" />
        <div className="card">
          <div className="card-header mb-3">
            <div className="utils__title">
              <strong>Blog List</strong>
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
              rowClassName={record =>
                record.needs_translation === true ? 'NotTranslated' : 'translated'
              }
              onRow={record => {
                return {
                  onDoubleClick: () => {
                    this.hanldeRedirect(record)
                  }, // double click
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

export default BlogList
