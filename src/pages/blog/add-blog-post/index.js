/* eslint-disable */
import React from 'react'
import { Editor } from 'react-draft-wysiwyg'
import axios from 'axios'
import { uuidv4 } from '../../../services/custom'
import { formInputElements } from '../../../utils/addBlogInput'
import { checkValidation } from '../../../utils/checkValidation'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import {
  Switch,
  Tabs,
  Form,
  Input,
  Button,
  Checkbox,
  Select,
  Upload,
  Icon,
  message,
  notification,
  DatePicker,
  Progress,
} from 'antd'
import $ from 'jquery'
import moment from 'moment'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import styles from './style.module.scss'
import serverAddress from '../../../services/config'

import './index.css'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import AddForm from './AddForm'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'
import BackNavigation from '../../../common/BackNavigation/index'

const { Option } = Select
const FormItem = Form.Item
const { Dragger } = Upload

const { TabPane } = Tabs

@Form.create()
@connect(({ blog, router }) => ({ blog, router }))
class BlogAddPost extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      language: true,
      editingBlog: '',
      switchDisabled: true,
      files: [],
      editorState: EditorState.createEmpty(),
      editedBody: '',
      translationRequired: false,
      upoading: true,
      date: new Date(),
      publishDate: new Date(),
      titleEn: '',
      titleRu: '',
      tagsEn: '',
      tagsRu: '',
      bodyContentEn: EditorState.createEmpty(),
      bodyContentRu: EditorState.createEmpty(),
      formElements: formInputElements,
    }
  }

  componentDidMount() {
    const { dispatch, router } = this.props
    const { location } = router
    const { state } = location
    if (state !== undefined) {
      const { language } = state
      setTimeout(
        this.setState({
          language,
        }),
        0,
      )
      const { id } = state
      const uuid = id
      if (uuid !== undefined) {
        const body = {
          uuid,
        }
        dispatch({
          type: 'blog/GET_BLOG_BY_ID',
          payload: body,
        })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { upoading } = this.state

    if (nextProps.blog.editBlog) {
      const { blog } = nextProps

      const htmlbodyContentEn = blog.editBlog ? blog.editBlog.body_en : EditorState.createEmpty()
      const htmlbodyContentRu = blog.editBlog ? blog.editBlog.body_ru : EditorState.createEmpty()

      let bodyContentEn = ''
      let bodyContentRu = ''

      if (htmlbodyContentEn && htmlbodyContentEn.length > 0) {
        const contentBlockEn = htmlToDraft(htmlbodyContentEn)
        if (contentBlockEn) {
          const contentStateEn = ContentState.createFromBlockArray(contentBlockEn.contentBlocks)
          bodyContentEn = EditorState.createWithContent(contentStateEn)
        }
      }

      if (htmlbodyContentRu && htmlbodyContentRu.length > 0) {
        const contentBlockRu = htmlToDraft(htmlbodyContentRu)
        if (contentBlockRu) {
          const contentStateRu = ContentState.createFromBlockArray(contentBlockRu.contentBlocks)
          bodyContentRu = EditorState.createWithContent(contentStateRu)
        }
      }

      const titleEn = blog.editBlog ? blog.editBlog.title_en : ''
      const titleRu = blog.editBlog ? blog.editBlog.title_ru : ''

      const tagsEn = blog.editBlog ? blog.editBlog.tags_en : ''
      const tagsRu = blog.editBlog ? blog.editBlog.tags_ru : ''

      const tempFilesArray = []
      let tempFilesObject = {}
      const tempFiles = blog.editBlog.files

      for (let i = 0; i < tempFiles.length; i += 1) {
        tempFilesObject = {
          fileName: blog.editBlog.files[i],
          percentage: 'zeroPercent',
        }
        tempFilesArray.push(tempFilesObject)
      }

      this.setState(
        {
          editingBlog: blog.editBlog,
          files: tempFilesArray,
          translationRequired: blog.editBlog.needs_translation,
          // editorState,
          bodyContentEn,
          bodyContentRu,
          titleEn,
          titleRu,
          tagsEn,
          tagsRu,
        },
        () => {
          if (!this.onFieldValueChange()) {
            this.setState({ switchDisabled: false })
          }
        },
      )
    }
    if (nextProps.blog.isBlogCreated) {
      const { files } = this.state
      this.setState({
        files,
      })
      this.handleReset()
    }
  }

  componentWillUnmount() {
    this.handleReset()
    this.setState({
      files: [],
      editorState: EditorState.createEmpty(),
      editingBlog: '',
      editedBody: '',
      translationRequired: false,
      upoading: true,
      date: new Date(),
      publishDate: new Date(),
    })
  }

  handleCreateDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        date: dateString,
      })
    }, 0)
  }

  handlePublishDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        publishDate: dateString,
      })
    }, 0)
  }

  handleFormBody = event => {
    event.preventDefault()
    const { form, dispatch, router } = this.props
    const { language, titleEn, titleRu, tagsEn, tagsRu, bodyContentEn, bodyContentRu } = this.state
    const { location } = router
    // const uuid = location.state
    const { state } = location
    let uuid = ''
    if (state !== undefined) {
      const { id } = state
      uuid = id
    }
    const { files, editorState, editingBlog, translationRequired, publishDate, date } = this.state
    // const titleEn = form.getFieldValue('title')
    const tag = form.getFieldValue('tag')
    const author = form.getFieldValue('author')
    const languageField = form.getFieldValue('language')
    const bodyEn = draftToHtml(convertToRaw(editorState.getCurrentContent()))

    const bodyContentStateEn = draftToHtml(convertToRaw(bodyContentEn.getCurrentContent()))
    const bodyContentStateRu = draftToHtml(convertToRaw(bodyContentRu.getCurrentContent()))

    if (titleEn === '' || tagsEn === '') {
      notification.error({
        message: 'Error',
        description: 'Please fill all the fields',
      })

      return
    }

    const tempFilesArray = []
    for (let i = 0; i < files.length; i += 1) {
      tempFilesArray.push(files[i].fileName)
    }

    const body = {
      uuid: uuid || uuidv4(),
      language: languageField,
      author,
      files: tempFilesArray,
      needs_translation: translationRequired,
      date,
      publish_date: publishDate,
    }

    body.title_en = titleEn
    body.body_en = bodyContentStateEn
    body.tags_en = tagsEn
    body.needs_translation = translationRequired

    body.title_ru = titleRu
    body.body_ru = bodyContentStateRu
    body.tags_ru = tagsRu
    body.needs_translation = translationRequired

    if (editingBlog) {
      body.audit = editingBlog.audit
      const payload = {
        body,
        uuid,
      }
      dispatch({
        type: 'blog/UPDATE_BLOG',
        payload,
      })

      this.scrollToTopPage()
    } else {
      dispatch({
        type: 'blog/CREATE_BLOG',
        payload: body,
      })
      this.scrollToTopPage()
    }
  }

  scrollToTopPage = () => {
    // $('html, body').animate({ scrollTop: 0 }, 'fast')
    // return false

    const scrollDuration = 500
    const scrollStep = -window.scrollY / (scrollDuration / 15),
      scrollInterval = setInterval(function() {
        if (window.scrollY != 0) {
          window.scrollBy(0, scrollStep)
        } else clearInterval(scrollInterval)
      }, 10)
  }

  onEditorChangeStateBody = bodyContent => {
    const { language } = this.props

    if (language) {
      this.setState({
        bodyContentEn: bodyContent,
      })
    }

    if (!language) {
      this.setState({
        bodyContentRu: bodyContent,
      })
    }
  }

  getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }

  handleFileChange = info => {
    if (info.file.status === 'done') {
      this.setState({ upoading: false }, () => {
        this.uploads3(info.file)
      })
    }
  }

  uploads3 = file => {
    const fileName = file.name
    const fileType = file.type

    const { files } = this.state

    axios({
      method: 'GET',
      url: `${serverAddress}/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
    })
      .then(response => {
        const { data } = response
        const temp = data.presignedUrl.toString()
        const finalUrl = temp.substr(0, temp.lastIndexOf('?'))

        for (let i = 0; i < files.length; i += 1) {
          if (files[i].fileName === finalUrl) {
            notification.warning({
              message: 'error',
              description: `You can't upload file with the same name.`,
            })
            return
          }
        }

        this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, file, finalUrl)
      })
      .catch(error => {
        notification.error({
          message: 'error',
          description: `Some error occured. Please check your internet connection`,
        })
      })

    // $.ajax({
    //   type: 'GET',
    //   url: `${serverAddress}/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
    //   success: data => {
    //     const temp = data.presignedUrl.toString()
    //     const finalUrl = temp.substr(0, temp.lastIndexOf('?'))
    //     const { files } = this.state
    //     const array = [...files]

    //     array.push(finalUrl)
    //     this.setState({ files: array })
    //     this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, file)
    //   },
    //   error() {
    //     notification.error({
    //       message: 'error',
    //       description: 'Error occured during uploading, Please try again',
    //     })
    //   },
    // })
  }

  uploadFileToS3UsingPresignedUrl = (presignedUrl, file, finalUrl) => {
    axios({
      method: 'PUT',
      url: presignedUrl,
      data: file.originFileObj,
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100)

        this.setUploadedFiles(finalUrl, percentCompleted)
      },
    })
      .then(response => {
        // notification.success({
        //   message: 'Success',
        //   description: 'file has been uploaded successfully',
        // })
      })
      .catch(err => {
        notification.warning({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      })

    // $.ajax({
    //   type: 'PUT',
    //   url: presignedUrl,
    //   data: file.originFileObj,
    //   headers: {
    //     'Content-Type': file.type,
    //     reportProgress: true,
    //   },
    //   processData: false,
    //   success: data => {
    //     notification.success({
    //       message: 'Success',
    //       description: 'file has been uploaded successfully',
    //     })
    //   },
    //   error() {
    //     notification.error({
    //       message: 'error',
    //       description: 'Error occured during uploading, Please try again',
    //     })
    //   },
    // })
  }

  setUploadedFiles = (finalUrl, percentCompleted) => {
    const { files } = this.state

    const tempFilesArray = [...files]

    const objIndex = tempFilesArray.findIndex(obj => obj.fileName === finalUrl)

    if (objIndex > -1) {
      tempFilesArray[objIndex].percentage = percentCompleted
    } else {
      const tempFilesObject = {
        fileName: finalUrl,
        percentage: percentCompleted,
      }
      tempFilesArray.push(tempFilesObject)
    }

    if (percentCompleted === 100) {
      notification.success({
        message: 'Success',
        description: 'file has been uploaded successfully',
      })
    }

    this.setState({
      files: tempFilesArray,
    })
  }

  dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  deleteFile = item => {
    const fileName = item.substr(item.lastIndexOf('.com/') + 5)
    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/deleteFile/?filename=${fileName}`,
      success: data => {
        notification.success({
          message: 'File Deleted',
          description: 'File has been successfully deleted',
        })

        const { files } = this.state

        for (let i = 0; i < files.length; i += 1) {
          if (files[i].fileName === item) {
            files.splice(i, 1)
            break
          }
        }

        this.setState({
          files,
        })
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, Please try again',
        })
      },
    })
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      editorState: '',
      editingBlog: {},
      files: [],
      translationRequired: false,
    })
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  handleTitleChange = event => {
    const { formElements, titleEn, titleRu, tagsEn, tagsRu, language } = this.state

    const updatedFormElements = {
      ...formElements,
      [event.target.name]: {
        ...formElements[event.target.name],
        value: event.target.value,
        touched: true,
        valid: checkValidation(event.target.value, formElements[event.target.name].validation),
      },
    }

    if (language) {
      this.setState(
        {
          formElements: updatedFormElements,
          titleEn: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }

    if (!language) {
      this.setState(
        {
          formElements: updatedFormElements,
          titleRu: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }
  }

  handleTagsChange = event => {
    const { formElements, titleEn, titleRu, tagsEn, tagsRu, language } = this.state

    const updatedFormElements = {
      ...formElements,
      [event.target.name]: {
        ...formElements[event.target.name],
        value: event.target.value,
        touched: true,
        valid: checkValidation(event.target.value, formElements[event.target.name].validation),
      },
    }

    if (language) {
      this.setState(
        {
          formElements: updatedFormElements,
          tagsEn: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }

    if (!language) {
      this.setState(
        {
          formElements: updatedFormElements,
          tagsRu: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }
  }

  handleLanguage = checked => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  onFieldValueChange = () => {
    const { titleEn, tagsEn } = this.state

    if (titleEn !== '' && tagsEn !== '') {
      this.setState({ switchDisabled: false })
      return false
    }

    this.setState({ switchDisabled: true })
    return true
  }

  onEditorStateChangeBody = bodyContent => {
    const { language } = this.state

    if (language) {
      this.setState({
        bodyContentEn: bodyContent,
      })
    }

    if (!language) {
      this.setState({
        bodyContentRu: bodyContent,
      })
    }
  }

  render() {
    const { blog, form } = this.props

    const {
      editingBlog,
      editedBody,
      editorState,
      translationRequired,
      titleEn,
      titleRu,
      tagsEn,
      tagsRu,
      bodyContentEn,
      bodyContentRu,
      formElements,
      files,
      language,
      switchDisabled,
    } = this.state
    const dateFormat = 'YYYY/MM/DD'

    let customStyle = {}
    if (files.length > 5) {
      customStyle = { overflowY: 'auto', height: '250px' }
    }

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
                    disabled={switchDisabled}
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
                  {/* <AddForm english={language} language={language} onFieldValueChange={this.onFieldValueChange} /> */}
                  <Form className="mt-3" onSubmit={this.handleFormBody}>
                    <div className="form-group">
                      <FormItem label={language ? 'Title' : 'Title'}>
                        <Input
                          onChange={this.handleTitleChange}
                          value={language ? titleEn : titleRu}
                          placeholder="Blog title"
                          name="title"
                        />
                        {!formElements.title.valid &&
                        formElements.title.validation &&
                        formElements.title.touched ? (
                          <div className="invalidFeedback">{formElements.title.errorMessage}</div>
                        ) : null}
                      </FormItem>

                      {/* <FormItem label={english ? 'Title' : 'Title'}>
                            {form.getFieldDecorator('title', {
                              initialValue: editingBlog
                                ? english
                                  ? editingBlog.title_en
                                  : editingBlog.title_ru
                                : '',
                            })(<Input placeholder="Post title" />)}
                          </FormItem> */}
                    </div>
                    <div className="form-group">
                      {/* <FormItem label={english ? 'Tags' : 'Tags'}>
                            {form.getFieldDecorator('tag', {
                              initialValue: editingBlog
                                ? english
                                  ? editingBlog.tags_en
                                  : editingBlog.tags_ru
                                : '',
                            })(<Input placeholder="Tags" />)}
                          </FormItem> */}
                      <FormItem label={language ? 'Tags' : 'Tags'}>
                        <Input
                          onChange={this.handleTagsChange}
                          value={language ? tagsEn : tagsRu}
                          placeholder="Tags"
                          name="tags"
                        />
                        {!formElements.tags.valid &&
                        formElements.tags.validation &&
                        formElements.tags.touched ? (
                          <div className="invalidFeedback">{formElements.tags.errorMessage}</div>
                        ) : null}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Author">
                        {form.getFieldDecorator('author', {
                          initialValue: editingBlog ? editingBlog.author : '',
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
                          initialValue: editingBlog ? editingBlog.language : '',
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
                      <FormItem>
                        {form.getFieldDecorator('translation', {
                          initialValue: translationRequired,
                        })(
                          <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                            Need Translation ?
                          </Checkbox>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Date">
                        {form.getFieldDecorator('date', {
                          rules: [
                            {
                              required: true,
                              message: 'Create Date is required',
                            },
                          ],
                          initialValue:
                            editingBlog && editingBlog.date
                              ? moment(editingBlog.date, dateFormat)
                              : moment(new Date(), dateFormat),
                        })(<DatePicker onChange={this.handleCreateDate} />)}
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
                            editingBlog && editingBlog.published_date
                              ? moment(editingBlog.published_date, dateFormat)
                              : moment(new Date(), dateFormat),
                        })(<DatePicker onChange={this.handlePublishDate} disabled />)}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label={language ? 'Body' : 'Body'}>
                        <div className={styles.editor} style={{ backgroundColor: '#fff' }}>
                          <Editor
                            editorState={language ? bodyContentEn : bodyContentRu}
                            onEditorStateChange={this.onEditorStateChangeBody}
                          />
                        </div>

                        {/* {form.getFieldDecorator('content', {
                          initialValue: editorState || '',
                        })(
                          <div className={styles.editor}>
                            <Editor
                              editorState={editorState}
                              onEditorStateChange={this.onEditorStateChange}
                            />
                          </div>,
                        )} */}
                      </FormItem>
                    </div>
                    <div className="form-group" style={customStyle}>
                      <FormItem label="Attachment">
                        <ul>
                          {/* {files && files.length > 0
                            ? files.map(item => {
                                return (
                                  <li className="filesList">
                                    {item}
                                    <i
                                      className="fa fa-close closeIcon"
                                      onClick={() => {
                                        this.deleteFile(item)
                                      }}
                                    />
                                  </li>
                                )
                              })
                            : null} */}

                          {files.length > 0 &&
                            files.map((item, index) => {
                              return (
                                <li className="filesList" key={index}>
                                  <i
                                    className="fa fa-trash closeIcon"
                                    onClick={() => {
                                      this.deleteFile(item.fileName, 'transcription')
                                    }}
                                  />
                                  <div
                                    style={{
                                      display: 'inline-block',
                                      width: '20rem',
                                      paddingLeft: '15px',
                                    }}
                                  >
                                    {item.fileName.split('/').pop(-1)}
                                  </div>
                                  {item.percentage !== 'zeroPercent' && item.percentage !== 100 ? (
                                    <div style={{ display: 'inline-block', width: '20rem' }}>
                                      <Progress percent={item.percentage} />
                                    </div>
                                  ) : null}
                                </li>
                              )
                            })}
                        </ul>
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem>
                        {form.getFieldDecorator('Files')(
                          <Dragger
                            showUploadList={false}
                            customRequest={this.dummyRequest}
                            onChange={this.handleFileChange}
                          >
                            <p className="ant-upload-drag-icon">
                              <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">
                              Click or drag file to this area to upload
                            </p>
                            <p className="ant-upload-hint">
                              Support for a single or bulk upload. Strictly prohibit from uploading
                              company data or other band files
                            </p>
                          </Dragger>,
                        )}
                      </FormItem>
                    </div>
                    <FormItem>
                      <div className={styles.submit}>
                        <span className="mr-3">
                          <Button type="primary" htmlType="submit">
                            Save and Post
                          </Button>
                        </span>
                        <Button type="danger" onClick={this.handleReset}>
                          Discard
                        </Button>
                      </div>
                    </FormItem>
                  </Form>
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
