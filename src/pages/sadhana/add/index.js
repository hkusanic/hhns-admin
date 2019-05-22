import React from 'react'
import { Form, Input, Switch } from 'antd'

import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import BackNavigation from '../../../common/BackNavigation/index'
import styles from './style.module.scss'

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

    let fullName = ''

    if (Object.keys(editSadhana).length > 0) {
      fullName = `${editSadhana.firstName} ${editSadhana.lastName}`
    }

    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col-lg-2 ml-1 text-center">
              <span className="font-weight-bold">{editSadhana.date}</span>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-2">
              <BackNavigation link="/sadhana/list" title="Sadhana List" />
            </div>
            <div className="col-lg-2">
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
        </div>

        <div className="mt-4">
          <Helmet title="Add Sadhana" />
          <section className="card">
            <div className="card-body">
              <div className={styles.addPost}>
                <Form className="mt-3">
                  <div className="form-group">
                    <FormItem label={language ? 'Name' : 'Name'}>
                      <Input disabled value={fullName} placeholder="Name" name="name" />
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label={language ? 'Email' : 'Email'}>
                      <Input disabled value={editSadhana.email} placeholder="Email" name="email" />
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
      </React.Fragment>
    )
  }
}

export default AddSadhana
