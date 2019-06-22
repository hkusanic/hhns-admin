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
      uploading: true,
      date: new Date(),
      publishDate: new Date(),
      titleEn: '',
      titleRu: '',
      tagsEn: '',
      tagsRu: '',
      bodyContentEn: '',
      bodyContentRu: '',
      formElements: formInputElements,
      paginationCurrentPage: '',
      fileList: [],
    }
  }

  componentDidMount() {
    const { dispatch, router } = this.props
    const { location } = router
    const { state } = location
    if (state !== undefined) {
      const { language, currentPage } = state
      setTimeout(
        this.setState({
          language,
          paginationCurrentPage: currentPage,
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

    dispatch({
      type: 'kirtan/RESET_STORE',
    })

    dispatch({
      type: 'video/RESET_STORE',
    })
  }

  componentWillReceiveProps(nextProps) {
    const { uploading, files } = this.state

    if (nextProps.blog.editBlog !== '' && uploading) {
      const { blog } = nextProps

      const htmlbodyContentEn = blog.editBlog && blog.editBlog.en ? blog.editBlog.en.body : ''
      const htmlbodyContentRu = blog.editBlog && blog.editBlog.ru ? blog.editBlog.ru.body : ''

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

      const titleEn = blog.editBlog && blog.editBlog.en ? blog.editBlog.en.title : ''
      const titleRu = blog.editBlog && blog.editBlog.ru ? blog.editBlog.ru.title : ''

      const tagsEn = blog.editBlog && blog.editBlog.en ? blog.editBlog.en.tags : ''
      const tagsRu = blog.editBlog && blog.editBlog.ru ? blog.editBlog.ru.tags : ''

      let tempFilesArray = []
      let tempFilesObject = {}
      const tempFiles = blog.editBlog.files

      if (files.length > 0) {
        tempFilesArray = files
      } else {
        for (let i = 0; i < tempFiles.length; i += 1) {
          tempFilesObject = {
            fileName: blog.editBlog.files[i],
            percentage: 'zeroPercent',
          }
          tempFilesArray.push(tempFilesObject)
        }
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
      uploading: true,
      date: new Date(),
      publishDate: new Date(),
    })
  }

  handleCreateDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        date: dateString,
        uploading: false,
      })
    }, 0)
  }

  handlePublishDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        publishDate: dateString,
        uploading: false,
      })
    }, 0)
  }

  handleFormBody = param => {
    // event.preventDefault()
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

    let bodyContentStateEn = ''
    let bodyContentStateRu = ''

    if (bodyContentEn) {
      bodyContentStateEn = draftToHtml(convertToRaw(bodyContentEn.getCurrentContent()))
    }

    if (bodyContentRu) {
      bodyContentStateRu = draftToHtml(convertToRaw(bodyContentRu.getCurrentContent()))
    }

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
      blog_creation_date: date,
      publish_date: publishDate,
      created_date_time: new Date(),
      en: {},
      ru: {},
    }

    body.en.title = titleEn
    body.en.body = bodyContentStateEn
    body.en.tags = tagsEn
    body.needs_translation = translationRequired

    body.ru.title = titleRu
    body.ru.body = bodyContentStateRu
    body.ru.tags = tagsRu
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

      if (param === 'submit') {
        this.scrollToTopPage()
      }
    } else {
      dispatch({
        type: 'blog/CREATE_BLOG',
        payload: body,
      })
      if (param === 'submit') {
        this.scrollToTopPage()
        this.handleStateReset()
      }
    }
  }

  handleStateReset = () => {
    this.setState({
      language: true,
      editingBlog: '',
      switchDisabled: true,
      files: [],
      editorState: EditorState.createEmpty(),
      editedBody: '',
      translationRequired: false,
      uploading: true,
      date: new Date(),
      publishDate: new Date(),
      titleEn: '',
      titleRu: '',
      tagsEn: '',
      tagsRu: '',
      bodyContentEn: '',
      bodyContentRu: '',
      formElements: formInputElements,
      paginationCurrentPage: '',
    })
  }

  scrollToTopPage = () => {
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

  dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  handleFileChange = info => {
    if (info.file.status === 'uploading') {
      this.setState(
        {
          fileList: info.fileList,
          uploading: false,
        },
        () => {
          this.uploads3(info)
        },
      )
    }
  }

  uploads3 = info => {
    const fileName = info.file.name
    const fileType = info.file.type

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

        this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, info, finalUrl)
      })
      .catch(error => {
        notification.error({
          message: 'error',
          description: `Some error occured. Please check your internet connection`,
        })
      })
  }

  uploadFileToS3UsingPresignedUrl = (presignedUrl, info, finalUrl) => {
    const { fileList } = this.state

    axios({
      method: 'PUT',
      url: presignedUrl,
      data: info.file.originFileObj,
      headers: {
        'Content-Type': info.file.type,
      },
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100)

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < fileList.length; i++) {
          if (fileList[i].name === finalUrl.split('/').pop(-1))
            fileList[i].percent = percentCompleted
        }

        this.setUploadedFiles(finalUrl, percentCompleted, fileList)
      },
    })
      .then(response => {
        // console.log(response)
      })
      .catch(err => {
        notification.warning({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      })
  }

  setUploadedFiles = (finalUrl, percentCompleted, fileList) => {
    const { files } = this.state

    const tempFilesArray = [...files]

    const tempFileList = [...fileList]

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

    const result = tempFileList.every((val, index, arr) => {
      if (val.percent === 100) {
        return true
      }
      return false
    })

    if (result) {
      notification.success({
        message: 'Success',
        description: `${fileList.length} file(s) have been uploaded successfully`,
      })
      this.setState({
        fileList: [],
      })
    }

    this.setState({
      files: tempFilesArray,
    })
  }

  deleteFile = item => {
    document.getElementById(item).style.pointerEvents = 'none'
    document.getElementById(item).style.opacity = '0.4'

    const fileName = item.substr(item.lastIndexOf('.com/') + 5)

    const tempFileName = fileName.split('/').pop(-1)

    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/deleteFile/?filename=${fileName}`,
      success: data => {
        notification.success({
          message: 'File Deleted',
          description: `${tempFileName} has been successfully deleted`,
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
      error(err) {
        notification.error({
          message: 'error',
          description: 'Error occured during deleting, Please try again',
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
        uploading: false,
      })
    }

    if (!language) {
      this.setState({
        bodyContentRu: bodyContent,
        uploading: false,
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
      paginationCurrentPage,
    } = this.state
    const dateFormat = 'YYYY/MM/DD'

    let customStyle = {}
    if (files.length > 5) {
      customStyle = { overflowY: 'auto', height: '250px' }
    }
    const linkState = {
      paginationCurrentPage,
    }

    return (
      <div>
        <BackNavigation link="/blog/blog-list" title="Blog List" linkState={linkState} />
        <Helmet title="Add Blog Post" />
        {editingBlog && editingBlog.en.title ? (
          <div style={{ paddingTop: '10px' }}>
            <div>
              <strong>Title :</strong>
              &nbsp;&nbsp;
              <span>
                {language
                  ? editingBlog.en.title
                  : editingBlog.ru && editingBlog.ru.title
                  ? editingBlog.ru.title
                  : ''}
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
                    style={{ width: '100px', float: 'right', margin: '0px 10px 10px 0px' }}
                  />
                </div>
              </div>
              <div className="card-body">
                <div className={styles.addPost}>
                  {/* <AddForm english={language} language={language} onFieldValueChange={this.onFieldValueChange} /> */}
                  <Form className="mt-3">
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
                    </div>
                    <div className="form-group">
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
                            editingBlog && editingBlog.blog_creation_date
                              ? moment(new Date(editingBlog.blog_creation_date), dateFormat)
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
                            wrapperClassName="demo-wrapper"
                            editorClassName="demo-editor"
                            editorState={language ? bodyContentEn : bodyContentRu}
                            onEditorStateChange={this.onEditorStateChangeBody}
                          />
                        </div>
                      </FormItem>
                    </div>
                    <div className="form-group" style={customStyle}>
                      <FormItem label="Attachment">
                        <ul>
                          {files.length > 0 &&
                            files.map((item, index) => {
                              return (
                                <li className="filesList" key={index}>
                                  <div className="fileDisplay">
                                    <div className="uploadedFileName">
                                      {item.fileName
                                        .split('/')
                                        .pop(-1)
                                        .substring(0, 30)}
                                    </div>
                                    <div
                                      className="deleteIcon"
                                      key={item.fileName}
                                      id={item.fileName}
                                    >
                                      <i
                                        className="fa fa-trash closeIcon"
                                        onClick={() => {
                                          this.deleteFile(item.fileName)
                                        }}
                                      />
                                    </div>
                                    <div className="progressBar">
                                      {item.percentage !== 'zeroPercent' ? (
                                        <Progress percent={item.percentage} />
                                      ) : null}
                                    </div>
                                  </div>
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
                            fileList={this.state.fileList}
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
                          <Button
                            type="primary"
                            htmlType="submit"
                            onClick={() => this.handleFormBody('submit')}
                          >
                            Save and Post
                          </Button>
                        </span>
                        <Button type="danger" onClick={this.handleStateReset}>
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
                {/* <AuditTimeline audit={editingBlog.audit ? editingBlog.audit : blog.blogAudit} /> */}
                <AuditTimeline audit={editingBlog.audit && editingBlog.audit} />
              </div>
            </section>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default BlogAddPost
