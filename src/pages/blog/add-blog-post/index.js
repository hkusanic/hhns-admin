import React from 'react'
import { Switch, Tabs } from 'antd'
import { Helmet } from 'react-helmet'
import AddForm from './AddForm'
import styles from './style.module.scss'

const { TabPane } = Tabs

class BlogAddPost extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      language: true,
    }
  }

  handleLanguage = checked => {
    this.setState({
      language: checked,
    })
  }

  render() {
    const { language } = this.state
    return (
      <div>
        <Helmet title="Add Blog Post" />
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
                <h1>Audit</h1>
              </div>
            </section>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default BlogAddPost
