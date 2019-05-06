/* eslint-disable */
import React from 'react'
import { Switch, Tabs } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import AddForm from './AddForm'
import styles from './style.module.scss'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'
import BackNavigation from '../../../common/BackNavigation/index'

const { TabPane } = Tabs

@connect(({ blog, router }) => ({ blog, router }))
class BlogAddPost extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      language: window.localStorage['app.settings.locale'] === '"en-US"',
      editingBlog: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.blog.editBlog) {
      const { blog } = nextProps

      this.setState({
        editingBlog: blog.editBlog,
      })
    }
    this.setState({
      language: window.localStorage['app.settings.locale'] === '"en-US"',
    })
  }

  handleLanguage = checked => {
    this.setState({
      language: checked,
    })
  }

  render() {
    const { blog } = this.props

    const { language, editingBlog } = this.state
    return (
      <div>
        <BackNavigation link="/blog/blog-list" title="Blog List" />
        <Helmet title="Add Blog Post" />
        {editingBlog && editingBlog.title_en ? (
          <div style={{ paddingTop: '10px' }}>
            <div>
              <strong>Title :</strong>
              &nbsp;&nbsp;
              <span>
                {language ? editingBlog.title_en : editingBlog.title_ru ? editingBlog.title_ru : ''}
              </span>
            </div>
          </div>
        ) : null}
        <Tabs defaultActiveKey="1">
          <TabPane tab="Blog" key="1">
            <section className="card">
              <div className="card-header mb-2">
                <div className="utils__title">
                  <strong>Post Add/Edit</strong>
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
                <div className={styles.addPost}>
                  <AddForm english={language} />
                </div>
              </div>
            </section>
          </TabPane>
          <TabPane tab="Audit" key="2">
            <section className="card">
              <div className="card-body">
                <AuditTimeline audit={editingBlog.audit ? editingBlog.audit : blog.blogAudit} />
              </div>
            </section>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default BlogAddPost
