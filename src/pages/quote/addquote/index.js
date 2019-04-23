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
  Select,
  Upload,
  Icon,
  message,
  notification,
  Switch,
} from 'antd'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import $ from 'jquery'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import styles from './style.module.scss'

const { Option } = Select

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
  }

  componentDidMount() {
    const { router, dispatch } = this.props
    const { location } = router
    const uuid = location.state
    if (uuid !== undefined) {
      const body = {
        uuid,
      }
      dispatch({
        type: 'quote/GET_QUOTE_BY_ID',
        payload: body,
      })
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
      const html = editQuote ? (language ? editQuote.en.body : editQuote.ru.body) : ''
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
  }

  uuidv4 = () => {
    // eslint-disable-next-line func-names
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      // eslint-disable-next-line no-bitwise
      const r = (Math.random() * 16) | 0

      // eslint-disable-next-line no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  handleFormBody = event => {
    event.preventDefault()
    const { form, dispatch, router, english } = this.props
    const { location } = router
    const uuid = location.state
    const { files, editorState, editingQuote, translationRequired, topics, language } = this.state
    const titleEn = form.getFieldValue('title')
    const topic = form.getFieldValue('topic')
    const author = form.getFieldValue('author')
    const languageData = form.getFieldValue('language')
    const bodyEn = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    const body = {
      author: 'nirajanana swami',
      uuid: uuid || this.uuidv4(),
      language: languageData,
      en: {},
      ru: {},
    }
    if (language) {
      body.en.title = titleEn
      body.en.body = bodyEn
      body.en.topic = topic
      body.en.author = author
    } else {
      body.ru.title = titleEn
      body.ru.body = bodyEn
      body.ru.topic = topic
      body.ru.author = author
    }
    if (editingQuote) {
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

  handleLanguage = checked => {
    this.setState({
      language: checked,
    })
    const { editingQuote, language } = this.state
    const html = editingQuote ? (language ? editingQuote.en.body : editingQuote.ru.body) : ''
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

    return (
      <div>
        <Helmet title="Create Quote" />
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
                          : editingQuote.ru.title
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
                        <Option value="Other" />
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
      </div>
    )
  }
}

export default AddQuote
