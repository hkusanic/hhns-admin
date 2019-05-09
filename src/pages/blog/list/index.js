/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Table, Switch } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import renderHTML from 'react-render-html'
import { Link } from 'react-router-dom'

@connect(({ blog }) => ({ blog }))
class BlogList extends React.Component {
  state = {
    language: true,
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'blog/GET_LIST',
      page: 1,
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

    dispatch({
      type: 'blog/GET_LIST',
      page,
    })
  }

  deleteBlog = uuid => {
    const { dispatch } = this.props
    console.log('uuid====????', uuid)
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
    const { history } = this.props
    history.push({
      pathname: '/blog/add-blog-post',
      state: record.uuid,
    })
  }

  render() {
    const { language } = this.state
    const { blog } = this.props
    const { blogs, totalBlogs } = blog
    const data = blogs

    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'title_en' : 'title_ru',
        key: language ? 'title_en' : 'title_ru',
        render: title => (title ? renderHTML(this.showing100Characters(title)) : ''),
      },
      {
        title: 'Author',
        dataIndex: 'author',
        key: 'author',
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: date => <span>{`${new Date(date).toDateString()}`}</span>,
      },
      {
        title: 'Action',
        key: 'uuid',
        render: record => (
          <span>
            <Link to={{ pathname: '/blog/add-blog-post', state: record.uuid }}>
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

    return (
      <div>
        <Helmet title="Products List" />
        <div className="card">
          <div className="card-header">
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
              className="utils__scrollTable"
              scroll={{ x: '100%' }}
              columns={columns}
              dataSource={data}
              pagination={{
                pageSize: 20,
                onChange: this.handlePageChnage,
                total: totalBlogs,
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default BlogList
