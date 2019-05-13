/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
import React from 'react'
import { Editor } from 'react-draft-wysiwyg'

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import {
  Form,
  Input,
  Button,
  Checkbox,
  DatePicker,
  Select,
  Upload,
  Icon,
  message,
  notification,
  Switch,
  Tabs,
} from 'antd'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import $ from 'jquery'
import moment from 'moment'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import BackNavigation from '../../../common/BackNavigation/index'
import { uuidv4 } from '../../../services/custom'
import styles from './style.module.scss'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'

const { Option } = Select
const { TabPane } = Tabs
const FormItem = Form.Item
const { Dragger } = Upload

@Form.create()
@connect(({ quote, router }) => ({ quote, router }))
class AddQuote extends React.Component {
  state = {
    files: [],
    editorState: EditorState.createEmpty(),
    editingQuote: '',
    editedBody: '',
    language: true,
    translationRequired: true,
  }

  componentDidMount() {
    const { dispatch, router } = this.props
    const { location } = router
    const { state } = location
    if (state !== undefined) {
      const { id, language } = state
      const uuid = id
      setTimeout(
        this.setState({
          language,
        }),
        0,
      )
      if (uuid !== undefined) {
        const body = {
          uuid,
        }

        dispatch({
          type: 'quote/GET_QUOTE_BY_ID',
          payload: body,
        })
      }
    }
    dispatch({
      type: 'quote/GET_TOPICS',
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.quote.editQuote) {
      const { quote } = nextProps
      const { editQuote } = quote
      const { language } = this.state
      const html = editQuote
        ? language
          ? editQuote.en.body
          : editQuote.ru
          ? editQuote.ru.body
          : ''
        : ''
      let editorState = ''
      if (html.length > 0) {
        const contentBlock = htmlToDraft(html)
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
          editorState = EditorState.createWithContent(contentState)
        }
        this.setState({
          editingQuote: quote.editQuote,
          editorState,
        })
      }
    }
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
  }

  componentWillUnmount() {
    this.setState({
      files: [],
      editorState: EditorState.createEmpty(),
      editingQuote: '',
      editedBody: '',
      language: true,
      translationRequired: true,
    })
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      files: [],
      editorState: EditorState.createEmpty(),
      editingQuote: '',
      editedBody: '',
      language: true,
      translationRequired: true,
    })
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  handleFormBody = event => {
    event.preventDefault()
    const { form, dispatch, router, english } = this.props
    // const { location } = router
    // const uuid = location.state
    const { location } = router
    const { state } = location

    let uuid = ''
    if (state !== undefined) {
      const { id } = state
      uuid = id
    }

    const { files, editorState, editingQuote, translationRequired, topics, language } = this.state
    const titleEn = form.getFieldValue('title')
    const topic = form.getFieldValue('topic')
    const date = form.getFieldValue('date')
    const publishDate = form.getFieldValue('publish_date')
    const author = form.getFieldValue('author')
    const languageData = form.getFieldValue('language')
    const bodyEn = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    const body = {
      author: 'nirajanana swami',
      uuid: uuid || uuidv4(),
      language: languageData,
      date,
      published_date: publishDate,
      needs_translation: translationRequired,
      en: {
        title: language ? titleEn : editingQuote ? editingQuote.en.title : '',
        topic: language ? topic : editingQuote ? editingQuote.en.topic : '',
        body: language ? bodyEn : editingQuote ? editingQuote.en.body : '',
        author,
      },
      ru: {
        title: language ? (editingQuote ? editingQuote.ru.title : '') : titleEn,
        topic: language ? (editingQuote ? editingQuote.ru.topic : '') : topic,
        body: language ? (editingQuote ? editingQuote.ru.body : '') : bodyEn,
        author,
      },
    }
    if (editingQuote) {
      body.audit = editingQuote.audit
      const payload = {
        body,
        uuid,
      }
      dispatch({
        type: 'quote/UPDATE_QUOTE',
        payload,
      })
    } else {
      dispatch({
        type: 'quote/CREATE_QUOTE',
        payload: body,
      })
    }
  }

  onEditorStateChange: Function = editorState => {
    this.setState({
      editorState,
    })
  }

  handleLanguage = () => {
    const { language, editingQuote } = this.state
    this.setState({
      language: !language,
    })
    const html = editingQuote
      ? language
        ? editingQuote.en.body
        : editingQuote.ru
        ? editingQuote.ru.body
        : ''
      : ''
    let editorState = ''
    if (html.length > 0) {
      const contentBlock = htmlToDraft(html)
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
        editorState = EditorState.createWithContent(contentState)
      }
      this.setState({
        editorState,
      })
    }
  }

  render() {
    const { form, english, quote } = this.props

    const { editingQuote, editedBody, editorState, translationRequired, language } = this.state
    const { files } = this.state
    const { topics } = quote
    const dateFormat = 'YYYY/MM/DD'

    return (
      <div>
        <BackNavigation link="/quote/list" title="Quote List" />
        {editingQuote && editingQuote.en && editingQuote.ru ? (
          <div style={{ paddingTop: '10px' }}>
            <div>
              <strong>Title :</strong>
              &nbsp;&nbsp;
              <span>
                {language ? editingQuote.en.title : editingQuote.ru ? editingQuote.ru.title : ''}
              </span>
            </div>
          </div>
        ) : null}
        <Helmet title="Create Quote" />
        <Tabs defaultActiveKey="1">
          <TabPane tab="Quote" key="1">
            <section className="card">
              <div className="card-header mb-2">
                <div className="utils__title">
                  <strong>Quote Add/Edit</strong>
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
                  <Form className="mt-3" onSubmit={this.handleFormBody}>
                    <div className="form-group">
                      <FormItem label={language ? 'Title' : 'Title'}>
                        {form.getFieldDecorator('title', {
                          initialValue: editingQuote
                            ? language
                              ? editingQuote.en.title
                              : editingQuote.ru
                              ? editingQuote.ru.title
                              : ''
                            : '',
                        })(<Input placeholder="Post title" />)}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label={language ? 'Topic' : 'Topic'}>
                        {form.getFieldDecorator('topic', {
                          initialValue:
                            editingQuote && editingQuote.en && editingQuote.ru
                              ? language
                                ? editingQuote.en.topic
                                : editingQuote.ru.topic
                              : '',
                        })(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select Topic"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {topics && topics.length > 0
                              ? topics.map(item => {
                                  return (
                                    <Option
                                      key={item.uuid}
                                      value={language ? item.name_en : item.name_ru}
                                    >
                                      {language ? item.name_en : item.name_ru}
                                    </Option>
                                  )
                                })
                              : null}
                          </Select>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Author">
                        {form.getFieldDecorator('author', {
                          initialValue: editingQuote ? editingQuote.en.author : '',
                        })(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select Author"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option value="Niranjana Swami">Niranjana Swami</Option>
                            <Option value="Other">Other</Option>
                          </Select>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Language">
                        {form.getFieldDecorator('language', {
                          initialValue: editingQuote ? editingQuote.language : '',
                        })(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select a color"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option value="english">English</Option>
                            <Option value="russian">Russian</Option>
                          </Select>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Date">
                        {form.getFieldDecorator('date', {
                          rules: [
                            {
                              required: true,
                              message: 'Date is required',
                            },
                          ],
                          initialValue:
                            editingQuote && editingQuote.date
                              ? moment(editingQuote.date, dateFormat)
                              : moment(new Date(), dateFormat),
                        })(<DatePicker onChange={this.handleDate} />)}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Publish Date">
                        {form.getFieldDecorator('publish_date', {
                          rules: [
                            {
                              required: true,
                              message: 'Publish Date is required',
                            },
                          ],
                          initialValue:
                            editingQuote && editingQuote.published_date
                              ? moment(editingQuote.published_date, dateFormat)
                              : moment(new Date(), dateFormat),
                        })(<DatePicker disabled />)}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem>
                        {form.getFieldDecorator('translation', {
                          rules: [
                            {
                              required: true,
                              message: 'Need Translation is required',
                            },
                          ],
                          initialValue: editingQuote ? editingQuote.needs_translation : '',
                        })(
                          <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                            &nbsp; Need Translation ?
                          </Checkbox>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label={english ? 'Body' : 'Body'}>
                        {form.getFieldDecorator('content', {
                          initialValue: editorState || '',
                        })(
                          <div className={styles.editor}>
                            <Editor
                              editorState={editorState}
                              onEditorStateChange={this.onEditorStateChange}
                            />
                          </div>,
                        )}
                      </FormItem>
                    </div>
                  </Form>
                </div>
                <div className={styles.submit}>
                  <span className="mr-3">
                    <Button type="primary" onClick={this.handleFormBody}>
                      Save and Post
                    </Button>
                  </span>
                  <Button type="danger" onClick={this.handleReset}>
                    Discard
                  </Button>
                </div>
              </div>
            </section>
          </TabPane>
          <TabPane tab="Audit" key="2">
            <section className="card">
              <div className="card-body">
                <AuditTimeline audit={editingQuote.audit ? editingQuote.audit : quote.quoteAudit} />
              </div>
            </section>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default AddQuote
