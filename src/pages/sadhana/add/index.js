import React from 'react'
import { Form, Input, Switch, Tabs } from 'antd'

import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import BackNavigation from '../../../common/BackNavigation/index'
import styles from './style.module.scss'

const { TabPane } = Tabs
const FormItem = Form.Item

const { TextArea } = Input

@Form.create()
@connect(({ sadhana, router }) => ({ sadhana, router }))
class AddSadhana extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      language: true,
      editSadhana: {},
    }
  }

  componentDidMount() {
    const { dispatch, router } = this.props
    const { location } = router
    const { state } = location

    if (state !== undefined) {
      const { uuid } = state

      if (uuid !== undefined) {
        const body = {
          uuid,
        }

        dispatch({
          type: 'sadhana/GET_SADHANA_BY_ID',
          payload: body,
        })
      }
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.sadhana.editSadhana !== prevState.editSadhana) {
      return { editSadhana: nextProps.sadhana.editSadhana }
    }
    return null
  }

  handleLanguage = () => {
    const { language } = this.state

    this.setState({ language: !language })
  }

  render() {
    const { language, editSadhana } = this.state
    console.log('editSadhana===>', editSadhana)
    return (
      <React.Fragment>
        <BackNavigation link="/sadhana/list" title="Sadhana List" />
        <Switch
          defaultChecked
          checkedChildren={language ? 'en' : 'ru'}
          unCheckedChildren={language ? 'en' : 'ru'}
          onChange={this.handleLanguage}
          className="toggle"
          style={{ width: '100px', marginLeft: '10px' }}
        />

        <Tabs defaultActiveKey="1">
          <TabPane tab="Lecture" key="1">
            <div>
              <Helmet title="Add Sadhana" />
              <section className="card">
                <div className="card-body">
                  <div className={styles.addPost}>
                    <Form className="mt-3">
                      <div className="form-group">
                        <FormItem label={language ? 'Name' : 'Name'}>
                          <Input
                            disabled
                            value={`${editSadhana.firstName} ${editSadhana.lastName}`}
                            placeholder="Name"
                            name="name"
                          />
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Email' : 'Email'}>
                          <Input
                            disabled
                            value={editSadhana.email}
                            placeholder="Email"
                            name="email"
                          />
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Date' : 'Date'}>
                          <Input disabled value={editSadhana.date} placeholder="Date" name="date" />
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Time Rising' : 'Time Rising'}>
                          <Input
                            disabled
                            value={editSadhana.time_rising}
                            placeholder="Time Rising"
                            name="time_rising"
                          />
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Rounds' : 'Rounds'}>
                          <Input
                            disabled
                            value={editSadhana.rounds}
                            placeholder="Rounds"
                            name="rounds"
                          />
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Reading' : 'Reading'}>
                          <Input
                            disabled
                            value={editSadhana.reading}
                            placeholder="Reading"
                            name="reading"
                          />
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Association' : 'Association'}>
                          <Input
                            disabled
                            value={editSadhana.association}
                            placeholder="Association"
                            name="association"
                          />
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Comments' : 'Comments'}>
                          <TextArea
                            rows={4}
                            disabled
                            value={editSadhana.comments}
                            placeholder="Comments"
                            name="comments"
                          />
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Lectures' : 'Lectures'}>
                          <TextArea
                            rows={4}
                            disabled
                            value={editSadhana.lectures}
                            placeholder="Lectures"
                            name="lectures"
                          />
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Additional Comments' : 'Additional Comments'}>
                          <TextArea
                            rows={4}
                            disabled
                            value={editSadhana.additional_comments}
                            placeholder="Additional Comments"
                            name="additional_comments"
                          />
                        </FormItem>
                      </div>
                    </Form>
                  </div>
                </div>
              </section>
            </div>
          </TabPane>
        </Tabs>
      </React.Fragment>
    )
  }
}

export default AddSadhana
